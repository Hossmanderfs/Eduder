// src/services/tipo.service.js
const { TipoLeccion } = require('../models');

// ── Admin | RF-08 | E12 - FK → TIPO_LECCION ───────────────────────────────────
// Lista todos los tipos de lección disponibles.
// Usado por el panel admin para poblar el select de tipo en el formulario
// de lecciones (FK → TIPO_LECCION visible en la interfaz).
async function getAll() {
  return TipoLeccion.findAll({ order: [['nombre_tipo', 'ASC']] });
}

module.exports = { getAll };
