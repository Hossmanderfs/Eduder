// src/services/progress.service.js
const { v4: uuidv4 } = require('uuid');
const { Op }         = require('sequelize');
const {
  ProgresoLeccion,
  Leccion,
  PerfilEstudiante,
  MedallaCatalogo,
  MedallaUsuario,
  Notificacion,
} = require('../models');

/**
 * Actualiza (o crea) el progreso de un estudiante en una lección.
 * Params: id_leccion
 * Body:   { estado, puntaje }
 * El id_usuario viene del JWT.
 */
async function updateProgress(id_leccion, body, id_usuario) {
  const { estado, puntaje } = body;

  const ESTADOS_VALIDOS = ['no_iniciada', 'en_progreso', 'completada'];
  if (estado && !ESTADOS_VALIDOS.includes(estado)) {
    const err = new Error(`estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
    err.status = 400;
    throw err;
  }
  if (puntaje !== undefined && (puntaje < 0 || puntaje > 100)) {
    const err = new Error('puntaje debe estar entre 0 y 100');
    err.status = 400;
    throw err;
  }

  const leccion = await Leccion.findByPk(id_leccion, { attributes: ['id_leccion', 'xp_base', 'id_nivel'] });
  if (!leccion) {
    const err = new Error('Lección no encontrada');
    err.status = 404;
    throw err;
  }

  // Buscar progreso existente
  let progreso = await ProgresoLeccion.findOne({ where: { id_usuario, id_leccion } });

  const ahora = new Date();
  const datos  = {};

  if (estado)   datos.estado   = estado;
  if (puntaje !== undefined) datos.puntaje = puntaje;
  if (estado === 'completada') datos.fecha_completado = ahora;

  if (progreso) {
    datos.intentos = (progreso.intentos || 1) + (estado === 'completada' && progreso.estado !== 'completada' ? 0 : 1);
    await progreso.update(datos);
  } else {
    progreso = await ProgresoLeccion.create({
      id_progreso: uuidv4(),
      id_usuario,
      id_leccion,
      ...datos,
    });
  }

  // ── Actualizar perfil si se completó ─────────────────────────────────────
  if (estado === 'completada' && datos.puntaje >= 0) {
    const xp_ganado = Math.round(leccion.xp_base * (datos.puntaje / 100));
    await actualizarPerfil(id_usuario, xp_ganado, leccion, ahora);
  }

  return progreso;
}

async function actualizarPerfil(id_usuario, xp_ganado, leccion, ahora) {
  const perfil = await PerfilEstudiante.findOne({ where: { id_usuario } });
  if (!perfil) return;

  const hoy            = ahora.toISOString().split('T')[0];
  const ultimaAct      = perfil.ultima_actividad;
  const esConsecutivo  = ultimaAct && diffDias(ultimaAct, hoy) === 1;
  const mismodia       = ultimaAct && diffDias(ultimaAct, hoy) === 0;

  const nuevaRacha = mismodia
    ? perfil.streak_dias
    : esConsecutivo
    ? perfil.streak_dias + 1
    : 1;

  await perfil.update({
    xp_total:        perfil.xp_total        + xp_ganado,
    xp_semana_actual: perfil.xp_semana_actual + xp_ganado,
    ultima_actividad: hoy,
    streak_dias:      nuevaRacha,
  });

  // Evaluar y otorgar medallas
  await evaluarMedallas(id_usuario, { ...perfil.dataValues, xp_total: perfil.xp_total + xp_ganado, streak_dias: nuevaRacha });
}

/**
 * Devuelve el resumen de progreso del usuario autenticado.
 */
async function getSummary(id_usuario) {
  const perfil = await PerfilEstudiante.findOne({ where: { id_usuario } });

  const progresos = await ProgresoLeccion.findAll({
    where: { id_usuario },
    include: [{ model: Leccion, as: 'leccion', attributes: ['id_leccion', 'titulo', 'id_nivel', 'xp_base'] }],
  });

  const completadas   = progresos.filter(p => p.estado === 'completada').length;
  const en_progreso   = progresos.filter(p => p.estado === 'en_progreso').length;
  const xp_total      = perfil?.xp_total ?? 0;
  const streak_dias   = perfil?.streak_dias ?? 0;

  return {
    xp_total,
    streak_dias,
    xp_semana_actual: perfil?.xp_semana_actual ?? 0,
    lecciones: {
      completadas,
      en_progreso,
      total: progresos.length,
    },
    detalle: progresos,
  };
}

// ── Medallas ──────────────────────────────────────────────────────────────────

async function evaluarMedallas(id_usuario, perfil) {
  const catalogo = await MedallaCatalogo.findAll();
  const yaObtenidas = await MedallaUsuario.findAll({ where: { id_usuario }, attributes: ['id_medalla'] });
  const idsObtenidos = new Set(yaObtenidas.map(m => m.id_medalla));

  for (const medalla of catalogo) {
    if (idsObtenidos.has(medalla.id_medalla)) continue;

    let cumple = false;
    switch (medalla.condicion_tipo) {
      case 'xp_acumulado':
        cumple = perfil.xp_total >= medalla.condicion_valor;
        break;
      case 'streak':
        cumple = perfil.streak_dias >= medalla.condicion_valor;
        break;
      // nivel_completado y puntaje_perfecto se evalúan en contexto específico
      default:
        break;
    }

    if (cumple) {
      await MedallaUsuario.create({
        id_med_usuario: uuidv4(),
        id_usuario,
        id_medalla: medalla.id_medalla,
      });
      // Notificación de logro
      await Notificacion.create({
        id_notificacion: uuidv4(),
        id_usuario,
        tipo: 'logro',
        mensaje: `🏅 ¡Obtuviste la medalla "${medalla.nombre}"!`,
      });
    }
  }
}

// ── Util ──────────────────────────────────────────────────────────────────────
function diffDias(fecha1, fecha2) {
  const d1 = new Date(fecha1);
  const d2 = new Date(fecha2);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

module.exports = { updateProgress, getSummary };
