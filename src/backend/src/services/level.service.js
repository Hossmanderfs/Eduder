// src/services/level.service.js
const { Nivel, Leccion } = require('../models');

// ── CU-03 | RF-07, RF-08 | E12 - obtenerLecciones() ─────────────────────────
// Devuelve todos los niveles activos con sus lecciones activas ordenadas
// secuencialmente. El orden de niveles y lecciones define el camino de
// aprendizaje (desbloqueo secuencial, RF-08).
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

// ── CU-03 | RF-07 | E12 - estaDesbloqueado() ─────────────────────────────────
// Devuelve un nivel por su ID incluyendo sus lecciones.
// Lanza 404 si el nivel no existe.
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

// ── Admin | RF-07 | E12 - Nivel CRUD ─────────────────────────────────────────
// Crea un nuevo nivel. Solo accesible por administradores (middleware).
async function createLevel(body) {
  const { nombre, descripcion, orden, umbral_aprobacion } = body;
  if (!nombre || !orden) {
    const err = new Error('nombre y orden son obligatorios');
    err.status = 400;
    throw err;
  }
  const nivel = await Nivel.create({
    nombre,
    descripcion: descripcion || null,
    orden,
    umbral_aprobacion: umbral_aprobacion ?? 70,
    estado: 'activo',
  });
  return nivel;
}

// ── Admin | RF-07 | E12 - Nivel CRUD ─────────────────────────────────────────
// Actualiza los datos de un nivel existente.
async function updateLevel(id, body) {
  const nivel = await Nivel.findByPk(id);
  if (!nivel) {
    const err = new Error('Nivel no encontrado');
    err.status = 404;
    throw err;
  }
  const campos = {};
  if (body.nombre              !== undefined) campos.nombre              = body.nombre;
  if (body.descripcion         !== undefined) campos.descripcion         = body.descripcion;
  if (body.orden               !== undefined) campos.orden               = body.orden;
  if (body.umbral_aprobacion   !== undefined) campos.umbral_aprobacion   = body.umbral_aprobacion;
  if (body.estado              !== undefined) campos.estado              = body.estado;

  await nivel.update(campos);
  return nivel;
}

// ── Admin | RF-25 | RN-20 | E12 - Nivel CRUD ─────────────────────────────────
// Elimina un nivel. RN-20: no se puede eliminar un nivel con lecciones asociadas
// (activas o archivadas) sin reasignarlas o eliminarlas antes → 409 Conflict.
async function deleteLevel(id) {
  const nivel = await Nivel.findByPk(id);
  if (!nivel) {
    const err = new Error('Nivel no encontrado');
    err.status = 404;
    throw err;
  }
  const lecciones = await Leccion.count({ where: { id_nivel: id } });
  if (lecciones > 0) {
    const err = new Error(
      `No se puede eliminar el nivel: tiene ${lecciones} lección(es) asociada(s). Reasígnelas o elimínelas primero (RN-20).`
    );
    err.status = 409;
    throw err;
  }
  await nivel.destroy();
  return { message: 'Nivel eliminado correctamente', archivado: false };
}

module.exports = { getLevels, getLevelById, createLevel, updateLevel, deleteLevel };
