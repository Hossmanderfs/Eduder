// src/services/exercise.service.js
const { Ejercicio, Pista } = require('../models');

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

module.exports = { evaluate, getHint };
