// src/services/profile.service.js
const {
  Usuario,
  PerfilEstudiante,
  MedallaUsuario,
  MedallaCatalogo,
  Notificacion,
} = require('../models');

// ── CU-04 | RF-18 | E12 - obtenerResumen(): PerfilDTO ────────────────────────
// Devuelve el perfil completo del estudiante autenticado:
// nivel actual, XP total, streak, medallas obtenidas y notificaciones sin leer.
// La información de progreso por nivel se consulta en progress.service (RF-09).
async function getSummary(id_usuario) {
  const usuario = await Usuario.findByPk(id_usuario, {
    attributes: ['id_usuario', 'nombre', 'apellido', 'correo_institucional', 'id_rol', 'fecha_registro'],
    include: [
      {
        // RF-18: nivel actual, XP total, streak de días consecutivos
        model: PerfilEstudiante,
        as: 'perfil',
      },
      {
        // RF-18: medallas obtenidas con fecha de obtención
        model: MedallaUsuario,
        as: 'medallas',
        include: [{ model: MedallaCatalogo, as: 'medalla' }],
        order: [['fecha_obtencion', 'DESC']],
      },
      {
        // RF-16: notificaciones pendientes (no leídas), máximo 10
        model: Notificacion,
        as: 'notificaciones',
        where: { leida: false },
        required: false,
        order: [['fecha_envio', 'DESC']],
        limit: 10,
      },
    ],
  });

  if (!usuario) {
    const err = new Error('Usuario no encontrado');
    err.status = 404;
    throw err;
  }

  return usuario;
}

module.exports = { getSummary };
