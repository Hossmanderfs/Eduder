// src/services/lesson.service.js
const { Leccion, ContenidoLeccion, Ejercicio, Pista, Nivel } = require('../models');

async function getLessonById(id) {
  const leccion = await Leccion.findByPk(id, {
    include: [
      { model: Nivel, as: 'nivel', attributes: ['id_nivel', 'nombre'] },
    ],
  });
  if (!leccion) {
    const err = new Error('Lección no encontrada');
    err.status = 404;
    throw err;
  }
  return leccion;
}

async function getLessonContent(id) {
  const leccion = await Leccion.findByPk(id, {
    attributes: ['id_leccion', 'titulo', 'tipo', 'orden', 'xp_base'],
    include: [
      {
        model: ContenidoLeccion,
        as: 'contenidos',
        order: [['orden', 'ASC']],
      },
      {
        model: Ejercicio,
        as: 'ejercicios',
        order: [['orden', 'ASC']],
        // No devolvemos respuesta_correcta ni explicacion aquí por seguridad
        attributes: ['id_ejercicio', 'enunciado', 'tipo_interaccion', 'orden'],
        include: [
          {
            model: Pista,
            as: 'pistas',
            attributes: ['id_pista', 'numero_pista'],
            // El texto de la pista se revela sólo al solicitarla
          },
        ],
      },
    ],
  });

  if (!leccion) {
    const err = new Error('Lección no encontrada');
    err.status = 404;
    throw err;
  }
  return leccion;
}

module.exports = { getLessonById, getLessonContent };
