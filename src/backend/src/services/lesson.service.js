// src/services/lesson.service.js
const { v4: uuidv4 } = require('uuid');
const { Leccion, ContenidoLeccion, Ejercicio, Pista, Nivel, TipoLeccion } = require('../models');

// ── CU-03 | RF-08 | E12 - cargarContenido() ──────────────────────────────────
// Devuelve los datos básicos de una lección junto con su nivel padre.
async function getLessonById(id) {
  const leccion = await Leccion.findByPk(id, {
    include: [
      { model: Nivel,       as: 'nivel',      attributes: ['id_nivel', 'nombre'] },
      { model: TipoLeccion, as: 'tipoLeccion', attributes: ['id_tipo', 'nombre_tipo'] },
    ],
  });
  if (!leccion) {
    const err = new Error('Lección no encontrada');
    err.status = 404;
    throw err;
  }
  return leccion;
}

// ── CU-03 | RF-08, RF-10, RF-11 | E12 - cargarContenido() / obtenerPista() ───
// Devuelve la lección con sus bloques de contenido y ejercicios ordenados.
// La respuesta_correcta NO se expone aquí por seguridad (se evalúa en ExerciseService).
// Solo devuelve metadatos de pistas (número), el texto se entrega bajo demanda (RF-11).
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
        attributes: ['id_ejercicio', 'enunciado', 'tipo_interaccion', 'orden'],
        include: [
          {
            model: Pista,
            as: 'pistas',
            // RF-11: solo el número de pista, el texto se entrega bajo demanda
            attributes: ['id_pista', 'numero_pista'],
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

// ── Admin | RF-08 | E12 - Leccion CRUD ───────────────────────────────────────
// Crea una nueva lección asociada a un nivel y tipo de lección (FK visibles).
// id_nivel y tipo (FK a TIPO_LECCION) son obligatorios — relaciones del MER.
async function createLesson(body) {
  const { id_nivel, titulo, tipo, orden, xp_base } = body;
  if (!id_nivel || !titulo || !tipo || !orden) {
    const err = new Error('id_nivel, titulo, tipo y orden son obligatorios');
    err.status = 400;
    throw err;
  }

  // Verificar que el nivel padre existe (integridad referencial)
  const nivel = await Nivel.findByPk(id_nivel);
  if (!nivel) {
    const err = new Error('El nivel especificado no existe');
    err.status = 404;
    throw err;
  }

  const leccion = await Leccion.create({
    id_leccion: uuidv4(),
    id_nivel,
    titulo,
    tipo,
    orden,
    xp_base: xp_base ?? 50,
    estado: 'activo',
  });
  return leccion;
}

// ── Admin | RF-08 | E12 - Leccion CRUD ───────────────────────────────────────
// Actualiza los datos de una lección existente.
async function updateLesson(id, body) {
  const leccion = await Leccion.findByPk(id);
  if (!leccion) {
    const err = new Error('Lección no encontrada');
    err.status = 404;
    throw err;
  }
  const campos = {};
  if (body.titulo    !== undefined) campos.titulo    = body.titulo;
  if (body.tipo      !== undefined) campos.tipo      = body.tipo;
  if (body.orden     !== undefined) campos.orden     = body.orden;
  if (body.xp_base   !== undefined) campos.xp_base   = body.xp_base;
  if (body.estado    !== undefined) campos.estado    = body.estado;
  if (body.id_nivel  !== undefined) campos.id_nivel  = body.id_nivel;

  await leccion.update(campos);
  return leccion;
}

// ── Admin | RF-08 | E12 - Leccion CRUD ───────────────────────────────────────
// Desactiva una lección (soft delete). Sus ejercicios y contenidos se conservan.
async function deleteLesson(id) {
  const leccion = await Leccion.findByPk(id);
  if (!leccion) {
    const err = new Error('Lección no encontrada');
    err.status = 404;
    throw err;
  }
  await leccion.update({ estado: 'inactivo' });
  return { message: 'Lección desactivada correctamente' };
}

// ── Admin | RF-08 | E12 - Leccion CRUD (LIST) ────────────────────────────────
// Lista todas las lecciones de un nivel con filtros opcionales.
async function getLessonsByLevel(id_nivel) {
  const lecciones = await Leccion.findAll({
    where: { id_nivel },
    order: [['orden', 'ASC']],
    include: [
      { model: TipoLeccion, as: 'tipoLeccion', attributes: ['nombre_tipo'] },
    ],
  });
  return lecciones;
}


// ── Admin | RF-08 | E12 - Leccion CRUD (LIST ALL) ────────────────────────────
// Devuelve todas las lecciones con sus relaciones FK incluidas.
// Usada por el panel admin cuando no hay filtro de nivel activo.
async function getAllLessons() {
  const lecciones = await Leccion.findAll({
    order: [['id_nivel', 'ASC'], ['orden', 'ASC']],
    include: [
      { model: Nivel,       as: 'nivel',       attributes: ['id_nivel', 'nombre'] },
      { model: TipoLeccion, as: 'tipoLeccion', attributes: ['id_tipo', 'nombre_tipo'] },
    ],
  });
  return lecciones;
}

module.exports = { getAllLessons, getLessonById, getLessonContent, createLesson, updateLesson, deleteLesson, getLessonsByLevel };
