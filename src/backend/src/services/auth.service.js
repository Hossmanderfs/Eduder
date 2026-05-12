// src/services/auth.service.js
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const crypto     = require('crypto');
const nodemailer = require('nodemailer');

const {
  Usuario,
  PerfilEstudiante,
  TokenRecuperacion,
} = require('../models');

// ── Helpers ──────────────────────────────────────────────────────────────────

function signToken(usuario) {
  return jwt.sign(
    { id_usuario: usuario.id_usuario, correo: usuario.correo_institucional, rol: usuario.id_rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function usuarioPublico(u) {
  return {
    id_usuario:           u.id_usuario,
    correo_institucional: u.correo_institucional,
    nombre:               u.nombre,
    apellido:             u.apellido,
    rol:                  u.id_rol,
    estado:               u.estado,
    fecha_registro:       u.fecha_registro,
  };
}

// ── CU-01 | RF-01, RF-02 | E12 - registrar() ─────────────────────────────────
// Valida correo institucional, encripta contraseña con bcrypt (costo 10)
// y crea automáticamente el PERFIL_ESTUDIANTE con XP=0, streak=0, nivel=1.
async function register(body) {
  const { correo_institucional, nombre, apellido, contrasena } = body;

  if (!correo_institucional || !nombre || !apellido || !contrasena) {
    const err = new Error('Faltan campos obligatorios: correo_institucional, nombre, apellido, contrasena');
    err.status = 400;
    throw err;
  }

  // RF-01: validar dominio institucional
  const regexCorreo = /^[^\s@]+@uniremington\.edu\.co$/i;
  if (!regexCorreo.test(correo_institucional)) {
    const err = new Error('El correo debe terminar en @uniremington.edu.co');
    err.status = 400;
    throw err;
  }

  const existe = await Usuario.findOne({ where: { correo_institucional } });
  if (existe) {
    const err = new Error('El correo ya está registrado');
    err.status = 409;
    throw err;
  }

  // RF-02: encriptar con bcrypt costo >= 10
  const contrasena_hash = await bcrypt.hash(contrasena, 10);

  const usuario = await Usuario.create({
    id_usuario: uuidv4(),
    correo_institucional,
    nombre,
    apellido,
    contrasena_hash,
    id_rol: 'estudiante',
  });

  // RF-02: crear PERFIL_ESTUDIANTE automáticamente con valores iniciales
  await PerfilEstudiante.create({
    id_perfil:  uuidv4(),
    id_usuario: usuario.id_usuario,
    nivel_actual: 1,
    xp_total: 0,
    streak_dias: 0,
  });

  const token = signToken(usuario);
  return { token, usuario: usuarioPublico(usuario) };
}

// ── CU-02 | RF-03, RF-04, RF-05, RF-06 | E12 - iniciarSesion() / bloquear() ─
// Autentica con correo y contraseña, genera JWT 24h.
// Bloquea la cuenta 15 min tras 5 intentos fallidos consecutivos (RF-05).
// Restaura el acceso automáticamente al expirar el bloqueo (RF-06).
const MAX_INTENTOS    = 5;
const BLOQUEO_MINUTOS = 15;

async function login(body) {
  const { correo_institucional, contrasena } = body;

  if (!correo_institucional || !contrasena) {
    const err = new Error('correo_institucional y contrasena son obligatorios');
    err.status = 400;
    throw err;
  }

  const usuario = await Usuario.findOne({ where: { correo_institucional } });
  if (!usuario) {
    const err = new Error('Credenciales incorrectas');
    err.status = 401;
    throw err;
  }

  // RF-20: cuenta desactivada por administrador
  if (!usuario.estado) {
    const err = new Error('Cuenta desactivada');
    err.status = 403;
    throw err;
  }

  // RF-05: verificar bloqueo temporal vigente
  if (usuario.bloqueado_hasta && new Date() < new Date(usuario.bloqueado_hasta)) {
    const minutos = Math.ceil((new Date(usuario.bloqueado_hasta) - new Date()) / 60000);
    const err = new Error(`Cuenta bloqueada. Intenta en ${minutos} min`);
    err.status = 429;
    throw err;
  }

  const valida = await bcrypt.compare(contrasena, usuario.contrasena_hash);

  if (!valida) {
    // RF-05: incrementar intentos y bloquear al llegar al límite
    const intentos = (usuario.intentos_login || 0) + 1;
    const update   = { intentos_login: intentos };
    if (intentos >= MAX_INTENTOS) {
      update.bloqueado_hasta = new Date(Date.now() + BLOQUEO_MINUTOS * 60 * 1000);
      update.intentos_login  = 0;
    }
    await usuario.update(update);
    const err = new Error('Credenciales incorrectas');
    err.status = 401;
    throw err;
  }

  // RF-06: login exitoso — restaurar acceso, limpiar intentos
  await usuario.update({ intentos_login: 0, bloqueado_hasta: null });

  // RF-03: generar JWT con expiración de 24h
  const token = signToken(usuario);
  return { token, usuario: usuarioPublico(usuario) };
}

// ── CU-05 | RF-19 | E12 - generar() / estaVigente() / invalidar() ────────────
// Envía enlace de recuperación al correo institucional.
// El token tiene validez de 30 min y se invalida tras ser usado.
// Por seguridad no revela si el correo existe o no.
async function recover(body) {
  const { correo_institucional } = body;

  if (!correo_institucional) {
    const err = new Error('correo_institucional es obligatorio');
    err.status = 400;
    throw err;
  }

  const usuario = await Usuario.findOne({ where: { correo_institucional } });
  // RF-19: respuesta genérica para no revelar si el correo existe
  if (!usuario) return { message: 'Si el correo existe, recibirás un enlace de recuperación' };

  const rawToken   = crypto.randomBytes(32).toString('hex');
  const token_hash = await bcrypt.hash(rawToken, 10);
  // RF-19: token válido por 30 minutos
  const expira_en  = new Date(Date.now() + 30 * 60 * 1000);

  // RF-19: invalidar tokens anteriores vigentes antes de crear uno nuevo
  await TokenRecuperacion.update(
    { usado: true },
    { where: { id_usuario: usuario.id_usuario, usado: false } }
  );

  await TokenRecuperacion.create({
    id_token: uuidv4(),
    id_usuario: usuario.id_usuario,
    token_hash,
    expira_en,
  });

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${rawToken}&uid=${usuario.id_usuario}`;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to:   correo_institucional,
      subject: 'EduDer — Recuperación de contraseña',
      html: `<p>Hola ${usuario.nombre},</p>
             <p>Haz clic en el enlace para restablecer tu contraseña (válido 30 minutos):</p>
             <a href="${link}">${link}</a>`,
    });
  }

  return { message: 'Si el correo existe, recibirás un enlace de recuperación' };
}

// ── CU-02 | RF-03 | E12 - logout() ──────────────────────────────────────────
// Cierra sesión. JWT es stateless; la invalidación real ocurre en el cliente.
async function logout() {
  return { message: 'Sesión cerrada correctamente' };
}

module.exports = { register, login, recover, logout };
