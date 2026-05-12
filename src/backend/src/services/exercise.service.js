// src/services/exercise.service.js
const { Ejercicio, Pista } = require('../models');

/**
 * Evalúa la respuesta del estudiante para un ejercicio.
 * Body: { id_ejercicio, respuesta }
 * Devuelve: { correcto, explicacion, respuesta_correcta? }
 */
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

  const correcto = normalizar(String(respuesta)) === normalizar(ejercicio.respuesta_correcta);

  const resultado = {
    id_ejercicio,
    correcto,
    explicacion: correcto ? null : ejercicio.explicacion,
  };

  // Si es correcta devolvemos también la respuesta para feedback positivo
  if (correcto) {
    resultado.respuesta_correcta = ejercicio.respuesta_correcta;
  }

  return resultado;
}

/**
 * Devuelve el texto de una pista (1 o 2) para un ejercicio.
 * Query param: ?numero=1
 */
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

module.exports = { evaluate, getHint };
