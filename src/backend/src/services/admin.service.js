// src/services/admin.service.js
const { Op, fn, col, literal } = require('sequelize');
const {
  Usuario,
  PerfilEstudiante,
  ProgresoLeccion,
  Leccion,
  Nivel,
} = require('../models');

/**
 * Lista todos los usuarios con su perfil.
 * Soporta ?rol=estudiante|admin  y  ?estado=true|false
 */
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

/**
 * Actualiza campos de un usuario: estado, id_rol.
 */
async function updateUser(id, body) {
  const usuario = await Usuario.findByPk(id, { attributes: { exclude: ['contrasena_hash'] } });
  if (!usuario) {
    const err = new Error('Usuario no encontrado');
    err.status = 404;
    throw err;
  }

  const camposPermitidos = {};
  if (body.estado  !== undefined) camposPermitidos.estado  = body.estado;
  if (body.id_rol  !== undefined) camposPermitidos.id_rol  = body.id_rol;
  if (body.nombre  !== undefined) camposPermitidos.nombre  = body.nombre;
  if (body.apellido !== undefined) camposPermitidos.apellido = body.apellido;

  if (Object.keys(camposPermitidos).length === 0) {
    const err = new Error('No se enviaron campos válidos para actualizar');
    err.status = 400;
    throw err;
  }

  await usuario.update(camposPermitidos);
  return usuario;
}

/**
 * Métricas generales de la plataforma.
 */
async function getMetrics() {
  const [totalUsuarios, totalActivos, totalLecciones, totalNiveles] = await Promise.all([
    Usuario.count(),
    Usuario.count({ where: { estado: true } }),
    Leccion.count({ where: { estado: 'activo' } }),
    Nivel.count({ where: { estado: 'activo' } }),
  ]);

  const completadas = await ProgresoLeccion.count({ where: { estado: 'completada' } });
  const enProgreso  = await ProgresoLeccion.count({ where: { estado: 'en_progreso' } });

  // XP promedio entre estudiantes activos
  const xpResult = await PerfilEstudiante.findOne({
    attributes: [[fn('AVG', col('xp_total')), 'xp_promedio']],
    raw: true,
  });
  const xp_promedio = Math.round(parseFloat(xpResult?.xp_promedio) || 0);

  // Registros últimos 7 días
  const hace7dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const nuevosUsuarios = await Usuario.count({
    where: { fecha_registro: { [Op.gte]: hace7dias } },
  });

  return {
    usuarios: { total: totalUsuarios, activos: totalActivos, nuevos_ultima_semana: nuevosUsuarios },
    contenido: { niveles: totalNiveles, lecciones: totalLecciones },
    progreso: { completadas, en_progreso: enProgreso },
    xp_promedio,
  };
}

module.exports = { getUsers, updateUser, getMetrics };
