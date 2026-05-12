// src/services/progress.service.js
const { v4: uuidv4 } = require('uuid');
const {
  ProgresoLeccion,
  Leccion,
  PerfilEstudiante,
  MedallaCatalogo,
  MedallaUsuario,
  Notificacion,
} = require('../models');

// ── CU-03 | RF-09 | E12 - registrar() / actualizarEstado() ──────────────────
// Crea o actualiza el registro de progreso de un estudiante en una lección.
// Transición de estados unidireccional: NO_INICIADA → EN_PROGRESO → COMPLETADA.
// Al completar, delega el cálculo de XP, streak y medallas a actualizarPerfil().
async function updateProgress(id_leccion, body, id_usuario) {
  const { estado, puntaje } = body;

  const ESTADOS_VALIDOS = ['no_iniciada', 'en_progreso', 'completada'];
  if (estado && !ESTADOS_VALIDOS.includes(estado)) {
    const err = new Error(`estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
    err.status = 400;
    throw err;
  }

  // RF-09: puntaje válido entre 0 y 100 (CHECK constraint del DDL)
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

  let progreso = await ProgresoLeccion.findOne({ where: { id_usuario, id_leccion } });

  const ahora = new Date();
  const datos  = {};

  if (estado)               datos.estado   = estado;
  if (puntaje !== undefined) datos.puntaje  = puntaje;
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

  // RF-12: al completar, calcular XP y actualizar perfil del estudiante
  if (estado === 'completada' && datos.puntaje >= 0) {
    const xp_ganado = Math.round(leccion.xp_base * (datos.puntaje / 100));
    await actualizarPerfil(id_usuario, xp_ganado, leccion, ahora);
  }

  return progreso;
}

// ── CU-03 | RF-12, RF-13 | E12 - sumarXP() / calcularStreak() ───────────────
// Suma el XP ganado al perfil del estudiante y recalcula el streak.
// Si la última actividad fue ayer → streak + 1.
// Si fue hoy → streak sin cambio.
// Si fue antes de ayer → streak reinicia a 1 (RF-13).
async function actualizarPerfil(id_usuario, xp_ganado, leccion, ahora) {
  const perfil = await PerfilEstudiante.findOne({ where: { id_usuario } });
  if (!perfil) return;

  const hoy           = ahora.toISOString().split('T')[0];
  const ultimaAct     = perfil.ultima_actividad;
  const esConsecutivo = ultimaAct && diffDias(ultimaAct, hoy) === 1;
  const mismodia      = ultimaAct && diffDias(ultimaAct, hoy) === 0;

  // RF-13: cálculo de racha de días consecutivos
  const nuevaRacha = mismodia
    ? perfil.streak_dias
    : esConsecutivo
    ? perfil.streak_dias + 1
    : 1;

  await perfil.update({
    xp_total:         perfil.xp_total         + xp_ganado,
    xp_semana_actual: perfil.xp_semana_actual  + xp_ganado,
    ultima_actividad: hoy,
    streak_dias:      nuevaRacha,
  });

  // RF-14, RF-15: evaluar medallas automáticamente al finalizar la lección
  await evaluarMedallas(id_usuario, {
    ...perfil.dataValues,
    xp_total:    perfil.xp_total + xp_ganado,
    streak_dias: nuevaRacha,
  });
}

// ── CU-04 | RF-18 | E12 - obtenerResumen() ───────────────────────────────────
// Devuelve el resumen completo del progreso del estudiante autenticado:
// XP total, streak, XP semanal, conteo de lecciones y detalle por lección.
async function getSummary(id_usuario) {
  const perfil = await PerfilEstudiante.findOne({ where: { id_usuario } });

  const progresos = await ProgresoLeccion.findAll({
    where: { id_usuario },
    include: [{ model: Leccion, as: 'leccion', attributes: ['id_leccion', 'titulo', 'id_nivel', 'xp_base'] }],
  });

  const completadas = progresos.filter(p => p.estado === 'completada').length;
  const en_progreso = progresos.filter(p => p.estado === 'en_progreso').length;

  return {
    xp_total:         perfil?.xp_total         ?? 0,
    streak_dias:      perfil?.streak_dias       ?? 0,
    xp_semana_actual: perfil?.xp_semana_actual  ?? 0,
    lecciones: {
      completadas,
      en_progreso,
      total: progresos.length,
    },
    detalle: progresos,
  };
}

// ── CU-03 | RF-14, RF-15 | E12 - verificarCondicion() ───────────────────────
// Evalúa cada medalla del catálogo contra el perfil actual del estudiante.
// Las medallas se otorgan solo una vez por usuario (idempotente).
// Crea una notificación de logro al otorgar una medalla.
async function evaluarMedallas(id_usuario, perfil) {
  const catalogo    = await MedallaCatalogo.findAll();
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
      default:
        break;
    }

    if (cumple) {
      await MedallaUsuario.create({
        id_med_usuario: uuidv4(),
        id_usuario,
        id_medalla: medalla.id_medalla,
      });
      // RF-16: notificación de logro al obtener medalla
      await Notificacion.create({
        id_notificacion: uuidv4(),
        id_usuario,
        tipo:    'logro',
        mensaje: `🏅 ¡Obtuviste la medalla "${medalla.nombre}"!`,
      });
    }
  }
}

// ── util ──────────────────────────────────────────────────────────────────────
function diffDias(fecha1, fecha2) {
  const d1 = new Date(fecha1);
  const d2 = new Date(fecha2);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

module.exports = { updateProgress, getSummary };
