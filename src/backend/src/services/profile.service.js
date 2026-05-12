// src/services/profile.service.js
const {
  Usuario,
  PerfilEstudiante,
  MedallaUsuario,
  MedallaCatalogo,
  Notificacion,
} = require('../models');

async function getSummary(id_usuario) {
  const usuario = await Usuario.findByPk(id_usuario, {
    attributes: ['id_usuario', 'nombre', 'apellido', 'correo_institucional', 'id_rol', 'fecha_registro'],
    include: [
      {
        model: PerfilEstudiante,
        as: 'perfil',
      },
      {
        model: MedallaUsuario,
        as: 'medallas',
        include: [{ model: MedallaCatalogo, as: 'medalla' }],
        order: [['fecha_obtencion', 'DESC']],
      },
      {
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
