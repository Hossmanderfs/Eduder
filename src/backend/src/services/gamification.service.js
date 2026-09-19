// src/services/gamification.service.js
const {
  MedallaCatalogo,
  MedallaUsuario,
  RankingSemanal,
  PerfilEstudiante,
  Usuario,
} = require('../models');
const { v4: uuidv4 } = require('uuid');

// ── CU-04 | RF-14 | E12 - verificarCondicion() / obtenerResumen() ─────────────
// Devuelve el catálogo completo de medallas indicando cuáles obtuvo el usuario
// autenticado y la fecha en que las obtuvo. Permite mostrar el perfil de logros (RF-18).
async function getMedals(id_usuario) {
  const catalogo  = await MedallaCatalogo.findAll({ order: [['condicion_valor', 'ASC']] });
  const obtenidas = await MedallaUsuario.findAll({ where: { id_usuario }, attributes: ['id_medalla', 'fecha_obtencion'] });
  const mapObtenidas = new Map(obtenidas.map(m => [m.id_medalla, m.fecha_obtencion]));

  return catalogo.map(m => ({
    ...m.toJSON(),
    obtenida:        mapObtenidas.has(m.id_medalla),
    fecha_obtencion: mapObtenidas.get(m.id_medalla) ?? null,
  }));
}

// ── CU-04 | RF-17 | E12 - obtenerTop() / actualizar() ────────────────────────
// Devuelve el ranking semanal por nivel (top 20) para la semana en curso.
// Si el usuario autenticado no aparece en el top 20, se agrega al final.
// El ranking se reinicia cada lunes a las 00:00 mediante cron job (RF-17).
// Solo posición y XP son visibles para otros usuarios — privacidad (RNF-09).
async function getRanking(id_nivel, id_usuario) {
  const semana = inicioSemana();

  // RF-17: sincronizar xp_semana_actual del perfil con la tabla ranking
  const perfil = await PerfilEstudiante.findOne({ where: { id_usuario } });
  if (perfil && perfil.xp_semana_actual > 0) {
    await RankingSemanal.findOrCreate({
      where: { semana_inicio: semana, id_usuario, id_nivel: Number(id_nivel) },
      defaults: {
        id_ranking: uuidv4(),
        xp_semana:  perfil.xp_semana_actual,
        posicion:   0,
      },
    });
    await RankingSemanal.update(
      { xp_semana: perfil.xp_semana_actual },
      { where: { semana_inicio: semana, id_usuario, id_nivel: Number(id_nivel) } }
    );
  }

  const todos = await RankingSemanal.findAll({
    where: { semana_inicio: semana, id_nivel: Number(id_nivel) },
    order: [['xp_semana', 'DESC']],
    include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'apellido'] }],
  });

  const ranking = todos.map((r, i) => ({
    posicion:   i + 1,
    id_usuario: r.id_usuario,
    nombre:     r.usuario ? `${r.usuario.nombre} ${r.usuario.apellido}` : 'Desconocido',
    xp_semana:  r.xp_semana,
    es_yo:      r.id_usuario === id_usuario,
  }));

  const top20   = ranking.slice(0, 20);
  const yoEnTop = top20.some(r => r.es_yo);
  if (!yoEnTop) {
    const yo = ranking.find(r => r.es_yo);
    if (yo) top20.push(yo);
  }

  return { semana_inicio: semana, id_nivel: Number(id_nivel), ranking: top20 };
}

// ── Sistema (cron) | RF-17 | E12 - reiniciarSemanal() ────────────────────────
// Reinicia el XP semanal de todos los perfiles cada lunes a las 00:00.
// Debe ser invocado por el cron job definido en server.js.
async function resetWeeklyXP() {
  await PerfilEstudiante.update(
    { xp_semana_actual: 0 },
    { where: {} }
  );
  return { message: 'XP semanal reiniciado correctamente' };
}

// ── util ──────────────────────────────────────────────────────────────────────
// Calcula la fecha del lunes de la semana actual (inicio de semana para ranking)
function inicioSemana() {
  const hoy   = new Date();
  const dia   = hoy.getDay();
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - ((dia + 6) % 7));
  return lunes.toISOString().split('T')[0];
}

module.exports = { getMedals, getRanking, resetWeeklyXP };
