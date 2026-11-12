// src/services/exercise.service.js
const { v4: uuidv4 } = require('uuid');
const { Ejercicio, Pista, Leccion } = require('../models');
const sequelize = require('../config/database');

const TIPOS_INTERACCION = ['seleccion_multiple', 'completar', 'arrastrar'];

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// ── CU-03 | RF-10, RF-12 | E12 - evaluar() ───────────────────────────────────
// Evalúa la respuesta del estudiante comparándola con la respuesta correcta.
// Normaliza ambos strings (trim + lowercase + espacios) antes de comparar.
// Devuelve feedback inmediato: correcto/incorrecto + explicación (RF-10).
// El resultado se usa en progress.service para calcular el puntaje final (RF-12).
async function evaluate(body) {
  const { id_ejercicio, respuesta } = body;

  if (!id_ejercicio || respuesta === undefined || respuesta === null) {
    const err = new Error('id_ejercicio y respuesta son obligatorios');
    err.status = 400;
    throw err;
  }

  const ejercicio = await Ejercicio.findByPk(id_ejercicio, {
    attributes: ['id_ejercicio', 'enunciado', 'tipo_interaccion', 'respuesta_correcta', 'explicacion'],
  });

  if (!ejercicio) {
    const err = new Error('Ejercicio no encontrado');
    err.status = 404;
    throw err;
  }

  // RF-10: evaluación automática normalizada (< 1 segundo de respuesta)
  const correcto = normalizar(String(respuesta)) === normalizar(ejercicio.respuesta_correcta);

  const resultado = {
    id_ejercicio,
    correcto,
    // RF-10: explicación solo si la respuesta es incorrecta
    explicacion: correcto ? null : ejercicio.explicacion,
  };

  if (correcto) {
    resultado.respuesta_correcta = ejercicio.respuesta_correcta;
  }

  return resultado;
}

// ── CU-03 | RF-11 | E12 - obtenerPista() ─────────────────────────────────────
// Devuelve el texto de la pista solicitada (1 o 2) para un ejercicio.
// La segunda pista se entrega solo bajo solicitud explícita del estudiante (RF-11).
// Máximo 2 pistas por ejercicio — CHECK constraint en DDL (RNF-06).
async function getHint(id_ejercicio, numero) {
  const num = parseInt(numero, 10);
  if (![1, 2].includes(num)) {
    const err = new Error('El número de pista debe ser 1 o 2');
    err.status = 400;
    throw err;
  }

  const pista = await Pista.findOne({
    where: { id_ejercicio, numero_pista: num },
  });

  if (!pista) {
    const err = new Error('Pista no encontrada para este ejercicio');
    err.status = 404;
    throw err;
  }

  return { id_ejercicio, numero_pista: num, texto_pista: pista.texto_pista };
}

// ── util ──────────────────────────────────────────────────────────────────────
function normalizar(str) {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

// ── Admin | RF-27 | E12 - Ejercicio CRUD ─────────────────────────────────────
// Valida y normaliza las pistas (máximo 2, numeradas 1 y 2 — RF-11).
function normalizarPistas(pistas) {
  if (pistas === undefined) return undefined;
  if (!Array.isArray(pistas) || pistas.length > 2) {
    throw httpError(400, 'pistas debe ser un arreglo de máximo 2 textos');
  }
  return pistas.map((p, i) => {
    const texto = typeof p === 'string' ? p : p?.texto_pista;
    if (!texto || !String(texto).trim()) throw httpError(400, 'Cada pista debe tener texto');
    return { numero_pista: i + 1, texto_pista: String(texto).trim() };
  });
}

// Lista los ejercicios de una lección con respuesta correcta y pistas (solo admin).
async function listByLesson(id_leccion) {
  return Ejercicio.findAll({
    where: { id_leccion },
    order: [['orden', 'ASC']],
    include: [{ model: Pista, as: 'pistas', attributes: ['id_pista', 'numero_pista', 'texto_pista'] }],
  });
}

// Crea un ejercicio asociado a una lección, con hasta 2 pistas.
async function createExercise(body) {
  const { id_leccion, enunciado, tipo_interaccion, orden, respuesta_correcta, explicacion } = body;
  if (!id_leccion || !enunciado || !tipo_interaccion || !orden || !respuesta_correcta || !explicacion) {
    throw httpError(400, 'id_leccion, enunciado, tipo_interaccion, orden, respuesta_correcta y explicacion son obligatorios');
  }
  if (!TIPOS_INTERACCION.includes(tipo_interaccion)) {
    throw httpError(400, `tipo_interaccion debe ser uno de: ${TIPOS_INTERACCION.join(', ')}`);
  }
  const pistas = normalizarPistas(body.pistas) || [];
  if (!(await Leccion.findByPk(id_leccion))) throw httpError(404, 'Lección no encontrada');

  const id_ejercicio = uuidv4();
  await sequelize.transaction(async (t) => {
    await Ejercicio.create({ id_ejercicio, id_leccion, enunciado, tipo_interaccion, orden, respuesta_correcta, explicacion }, { transaction: t });
    for (const p of pistas) {
      await Pista.create({ id_pista: uuidv4(), id_ejercicio, ...p }, { transaction: t });
    }
  });
  return Ejercicio.findByPk(id_ejercicio, { include: [{ model: Pista, as: 'pistas' }] });
}

// Actualiza un ejercicio; si se envía `pistas` se reemplazan las existentes.
async function updateExercise(id, body) {
  const ejercicio = await Ejercicio.findByPk(id);
  if (!ejercicio) throw httpError(404, 'Ejercicio no encontrado');
  if (body.tipo_interaccion !== undefined && !TIPOS_INTERACCION.includes(body.tipo_interaccion)) {
    throw httpError(400, `tipo_interaccion debe ser uno de: ${TIPOS_INTERACCION.join(', ')}`);
  }
  const pistas = normalizarPistas(body.pistas);
  const campos = {};
  for (const k of ['enunciado', 'tipo_interaccion', 'orden', 'respuesta_correcta', 'explicacion']) {
    if (body[k] !== undefined) campos[k] = body[k];
  }
  if (!Object.keys(campos).length && pistas === undefined) {
    throw httpError(400, 'No se enviaron campos válidos para actualizar');
  }
  await sequelize.transaction(async (t) => {
    if (Object.keys(campos).length) await ejercicio.update(campos, { transaction: t });
    if (pistas !== undefined) {
      await Pista.destroy({ where: { id_ejercicio: id }, transaction: t });
      for (const p of pistas) {
        await Pista.create({ id_pista: uuidv4(), id_ejercicio: id, ...p }, { transaction: t });
      }
    }
  });
  return Ejercicio.findByPk(id, { include: [{ model: Pista, as: 'pistas' }] });
}

// Elimina un ejercicio y sus pistas (ON DELETE CASCADE).
async function deleteExercise(id) {
  const ejercicio = await Ejercicio.findByPk(id);
  if (!ejercicio) throw httpError(404, 'Ejercicio no encontrado');
  await ejercicio.destroy();
  return { message: 'Ejercicio eliminado correctamente' };
}

module.exports = { evaluate, getHint, listByLesson, createExercise, updateExercise, deleteExercise };
