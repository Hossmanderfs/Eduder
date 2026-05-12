// src/services/level.service.js
const { Nivel, Leccion } = require('../models');

async function getLevels() {
  const niveles = await Nivel.findAll({
    where: { estado: 'activo' },
    order: [['orden', 'ASC']],
    include: [{
      model: Leccion,
      as: 'lecciones',
      attributes: ['id_leccion', 'titulo', 'tipo', 'orden', 'xp_base', 'estado'],
      where: { estado: 'activo' },
      required: false,
      order: [['orden', 'ASC']],
    }],
  });
  return niveles;
}

async function getLevelById(id) {
  const nivel = await Nivel.findByPk(id, {
    include: [{
      model: Leccion,
      as: 'lecciones',
      attributes: ['id_leccion', 'titulo', 'tipo', 'orden', 'xp_base', 'estado'],
      order: [['orden', 'ASC']],
    }],
  });
  if (!nivel) {
    const err = new Error('Nivel no encontrado');
    err.status = 404;
    throw err;
  }
  return nivel;
}

module.exports = { getLevels, getLevelById };
