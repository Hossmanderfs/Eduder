// src/services/admin.service.js
const { fn, col } = require('sequelize');
const {
  Usuario,
  PerfilEstudiante,
  ProgresoLeccion,
  Leccion,
  Nivel,
} = require('../models');

// ── CU-06 | RF-21 | E12 - Gestión de Usuarios (Administrador) ────────────────
// Lista todos los usuarios con su perfil de estudiante.
// Soporta filtros por rol (?rol=estudiante|admin) y estado (?estado=true|false).
async function getUsers(query) {
  const where = {};
  if (query.rol)    where.id_rol = query.rol;
  if (query.estado !== undefined) where.estado = query.estado === 'true';

  const usuarios = await Usuario.findAll({
    where,
    attributes: { exclude: ['contrasena_hash'] },
    include: [{ model: PerfilEstudiante, as: 'perfil' }],
    order: [['fecha_registro', 'DESC']],
  });

  return usuarios;
}

// ── CU-06 | RF-21 | E12 - Gestión de Usuarios (Administrador) ────────────────
// Busca un usuario por correo institucional y devuelve nombre, estado,
// nivel actual y fecha de registro (RF-21).
async function getUserByEmail(correo) {
  const usuario = await Usuario.findOne({
    where: { correo_institucional: correo },
    attributes: { exclude: ['contrasena_hash'] },
    include: [{ model: PerfilEstudiante, as: 'perfil' }],
  });
  if (!usuario) {
    const err = new Error('Usuario no encontrado');
    err.status = 404;
    throw err;
  }
  return usuario;
}

// ── CU-06 | RF-20 | E12 - Gestión de Usuarios (Administrador) ────────────────
// Actualiza estado, rol, nombre o apellido de un usuario.
// Al desactivar (estado=false), las sesiones JWT activas se invalidan
// porque el middleware verifica estado en cada request (RF-20).
async function updateUser(id, body) {
  const usuario = await Usuario.findByPk(id, { attributes: { exclude: ['contrasena_hash'] } });
  if (!usuario) {
    const err = new Error('Usuario no encontrado');
    err.status = 404;
    throw err;
  }

  const camposPermitidos = {};
  if (body.estado   !== undefined) camposPermitidos.estado   = body.estado;
  if (body.id_rol   !== undefined) camposPermitidos.id_rol   = body.id_rol;
  if (body.nombre   !== undefined) camposPermitidos.nombre   = body.nombre;
  if (body.apellido !== undefined) camposPermitidos.apellido = body.apellido;

  if (Object.keys(camposPermitidos).length === 0) {
    const err = new Error('No se enviaron campos válidos para actualizar');
    err.status = 400;
    throw err;
  }

  await usuario.update(camposPermitidos);
  return usuario;
}

// ── CU-06 | RF-22 | E12 - Gestión de Usuarios (Administrador) ────────────────
// Devuelve KPIs del sistema: usuarios activos, lecciones completadas,
// promedio de XP, nuevos registros en los últimos 7 días (RF-22).
async function getMetrics() {
  const [totalUsuarios, totalActivos, totalLecciones, totalNiveles] = await Promise.all([
    Usuario.count(),
    Usuario.count({ where: { estado: true } }),
    Leccion.count({ where: { estado: 'activo' } }),
    Nivel.count({ where: { estado: 'activo' } }),
  ]);

  const completadas = await ProgresoLeccion.count({ where: { estado: 'completada' } });
  const enProgreso  = await ProgresoLeccion.count({ where: { estado: 'en_progreso' } });

  // RF-22: XP promedio entre todos los estudiantes
  const xpResult = await PerfilEstudiante.findOne({
    attributes: [[fn('AVG', col('xp_total')), 'xp_promedio']],
    raw: true,
  });
  const xp_promedio = Math.round(parseFloat(xpResult?.xp_promedio) || 0);

  // RF-22: nuevos registros última semana
  const hace7dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const { Op }    = require('sequelize');
  const nuevosUsuarios = await Usuario.count({
    where: { fecha_registro: { [Op.gte]: hace7dias } },
  });

  return {
    usuarios: { total: totalUsuarios, activos: totalActivos, nuevos_ultima_semana: nuevosUsuarios },
    contenido: { niveles: totalNiveles, lecciones: totalLecciones },
    progreso:  { completadas, en_progreso: enProgreso },
    xp_promedio,
  };
}

module.exports = { getUsers, getUserByEmail, updateUser, getMetrics };
