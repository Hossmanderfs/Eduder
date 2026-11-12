// src/services/notification.service.js — Notification Service (RF-16)
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const { Notificacion, PerfilEstudiante, Usuario } = require('../models');

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// Lista las notificaciones del usuario (más recientes primero).
// ?solo_no_leidas=true filtra las pendientes; limit máx. 100.
async function list(id_usuario, query = {}) {
  const where = { id_usuario };
  if (query.solo_no_leidas === 'true') where.leida = false;
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 50, 1), 100);
  const items = await Notificacion.findAll({ where, order: [['fecha_envio', 'DESC']], limit });
  const no_leidas = await Notificacion.count({ where: { id_usuario, leida: false } });
  return { no_leidas, items };
}

async function markRead(id_usuario, id_notificacion) {
  const n = await Notificacion.findOne({ where: { id_notificacion, id_usuario } });
  if (!n) throw httpError(404, 'Notificación no encontrada');
  await n.update({ leida: true });
  return n;
}

async function markAllRead(id_usuario) {
  const [actualizadas] = await Notificacion.update({ leida: true }, { where: { id_usuario, leida: false } });
  return { actualizadas };
}

// Crea una notificación (uso interno de otros servicios y jobs).
async function create(id_usuario, tipo, mensaje) {
  return Notificacion.create({ id_notificacion: uuidv4(), id_usuario, tipo, mensaje });
}

// ── RF-16 | job diario: recordatorio de racha ────────────────────────────────
// Avisa a los estudiantes activos con racha > 0 que no han tenido actividad hoy.
// No duplica el aviso si ya se envió uno de tipo 'racha' hoy.
async function sendStreakReminders(ahora = new Date()) {
  const hoy = ahora.toISOString().split('T')[0];
  const inicioDia = new Date(`${hoy}T00:00:00.000Z`);
  const perfiles = await PerfilEstudiante.findAll({
    where: { streak_dias: { [Op.gt]: 0 }, ultima_actividad: { [Op.lt]: hoy } },
    include: [{ model: Usuario, as: 'usuario', attributes: ['id_usuario', 'estado'], where: { estado: 'activo' } }],
  });
  let enviadas = 0;
  for (const p of perfiles) {
    const ya = await Notificacion.count({
      where: { id_usuario: p.id_usuario, tipo: 'racha', fecha_envio: { [Op.gte]: inicioDia } },
    });
    if (ya) continue;
    await create(p.id_usuario, 'racha', `🔥 Llevas ${p.streak_dias} día(s) de racha. ¡Completa una lección hoy para no perderla!`);
    enviadas++;
  }
  return { enviadas };
}

module.exports = { list, markRead, markAllRead, create, sendStreakReminders };
