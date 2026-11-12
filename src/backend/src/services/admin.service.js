// src/services/admin.service.js
const { fn, col, Op } = require('sequelize');
const {
  Usuario,
  PerfilEstudiante,
  ProgresoLeccion,
  Leccion,
  Nivel,
} = require('../models');

// ── CU-06 | RF-21 | E12 - Gestión de Usuarios (Administrador) ────────────────
// Lista todos los usuarios con su perfil de estudiante.
// Soporta filtros por rol (?rol=estudiante|admin) y estado (?estado=activo|inactivo).
async function getUsers(query) {
  const where = {};
  if (query.rol)    where.rol = query.rol;
  if (query.estado !== undefined) where.estado = query.estado;

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
// Al desactivar (estado='inactivo'), las sesiones JWT activas se invalidan
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
  if (body.rol   !== undefined) camposPermitidos.rol   = body.rol;
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
// Convierte ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD en un rango de fechas (inclusive).
function parseRango(query = {}) {
  const rango = {};
  if (query.desde) {
    const d = new Date(`${query.desde}T00:00:00.000Z`);
    if (isNaN(d)) { const e = new Error('desde debe tener formato YYYY-MM-DD'); e.status = 400; throw e; }
    rango.desde = d;
  }
  if (query.hasta) {
    const h = new Date(`${query.hasta}T23:59:59.999Z`);
    if (isNaN(h)) { const e = new Error('hasta debe tener formato YYYY-MM-DD'); e.status = 400; throw e; }
    rango.hasta = h;
  }
  if (rango.desde && rango.hasta && rango.desde > rango.hasta) {
    const e = new Error('desde no puede ser posterior a hasta');
    e.status = 400;
    throw e;
  }
  return rango;
}

function filtroFecha(rango) {
  const f = {};
  if (rango.desde) f[Op.gte] = rango.desde;
  if (rango.hasta) f[Op.lte] = rango.hasta;
  return Object.getOwnPropertySymbols(f).length ? f : null;
}

// ── CU-06 | RF-22 | E12 - Gestión de Usuarios (Administrador) ────────────────
// Devuelve KPIs del sistema: usuarios activos, lecciones completadas y
// promedio de puntajes, filtrables por rango de fechas (?desde=&hasta=).
async function getMetrics(query = {}) {
  const rango = parseRango(query);
  const fRegistro  = filtroFecha(rango);
  const fCompletado = filtroFecha(rango);

  const [totalUsuarios, totalActivos, totalLecciones, totalNiveles] = await Promise.all([
    Usuario.count(),
    Usuario.count({ where: { estado: 'activo' } }),
    Leccion.count({ where: { estado: 'activo' } }),
    Nivel.count({ where: { estado: 'activo' } }),
  ]);

  const whereCompletadas = { estado: 'completada' };
  if (fCompletado) whereCompletadas.fecha_completado = fCompletado;
  const completadas = await ProgresoLeccion.count({ where: whereCompletadas });
  const enProgreso  = await ProgresoLeccion.count({ where: { estado: 'en_progreso' } });

  // RF-22: promedio de puntajes de las lecciones completadas en el rango
  const pj = await ProgresoLeccion.findOne({
    attributes: [[fn('AVG', col('puntaje')), 'promedio']],
    where: whereCompletadas,
    raw: true,
  });
  const promedio_puntaje = Math.round((parseFloat(pj?.promedio) || 0) * 10) / 10;

  const xpResult = await PerfilEstudiante.findOne({
    attributes: [[fn('AVG', col('xp_total')), 'xp_promedio']],
    raw: true,
  });
  const xp_promedio = Math.round(parseFloat(xpResult?.xp_promedio) || 0);

  // Nuevos registros: en el rango pedido o, por defecto, los últimos 7 días
  const whereNuevos = fRegistro
    ? { fecha_registro: fRegistro }
    : { fecha_registro: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
  const nuevosUsuarios = await Usuario.count({ where: whereNuevos });

  return {
    rango: { desde: query.desde || null, hasta: query.hasta || null },
    usuarios: { total: totalUsuarios, activos: totalActivos, nuevos: nuevosUsuarios },
    contenido: { niveles: totalNiveles, lecciones: totalLecciones },
    progreso:  { completadas, en_progreso: enProgreso },
    promedio_puntaje,
    xp_promedio,
  };
}

// Escapa un valor para CSV (RFC 4180) y neutraliza inyección de fórmulas.
function csvCell(v) {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// ── CU-06 | RF-22 | E12 - exportarCSV() ──────────────────────────────────────
// Exporta los KPIs del rango indicado en formato CSV (indicador,valor).
async function exportMetricsCsv(query = {}) {
  const m = await getMetrics(query);
  const filas = [
    ['indicador', 'valor'],
    ['desde', m.rango.desde || ''],
    ['hasta', m.rango.hasta || ''],
    ['usuarios_total', m.usuarios.total],
    ['usuarios_activos', m.usuarios.activos],
    ['usuarios_nuevos', m.usuarios.nuevos],
    ['niveles_activos', m.contenido.niveles],
    ['lecciones_activas', m.contenido.lecciones],
    ['lecciones_completadas', m.progreso.completadas],
    ['lecciones_en_progreso', m.progreso.en_progreso],
    ['promedio_puntaje', m.promedio_puntaje],
    ['xp_promedio', m.xp_promedio],
  ];
  return '\uFEFF' + filas.map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

module.exports = { getUsers, getUserByEmail, updateUser, getMetrics, exportMetricsCsv, parseRango, csvCell };
