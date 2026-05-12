// src/services/gamification.service.js
const { Op }           = require('sequelize');
const {
  MedallaCatalogo,
  MedallaUsuario,
  RankingSemanal,
  PerfilEstudiante,
  Usuario,
} = require('../models');
const { v4: uuidv4 } = require('uuid');

/**
 * Devuelve las medallas del catálogo indicando cuáles obtuvo el usuario.
 */
async function getMedals(id_usuario) {
  const catalogo   = await MedallaCatalogo.findAll({ order: [['condicion_valor', 'ASC']] });
  const obtenidas  = await MedallaUsuario.findAll({ where: { id_usuario }, attributes: ['id_medalla', 'fecha_obtencion'] });
  const mapObtenidas = new Map(obtenidas.map(m => [m.id_medalla, m.fecha_obtencion]));

  return catalogo.map(m => ({
    ...m.toJSON(),
    obtenida:        mapObtenidas.has(m.id_medalla),
    fecha_obtencion: mapObtenidas.get(m.id_medalla) ?? null,
  }));
}

/**
 * Ranking semanal por nivel (top 20).
 * Si el usuario autenticado no aparece en el top 20, se agrega al final.
 */
async function getRanking(id_nivel, id_usuario) {
  const semana = inicioSemana();

  // Asegurar que el usuario tenga fila en la tabla (si ya tiene XP esta semana)
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
    // Sincronizar xp
    await RankingSemanal.update(
      { xp_semana: perfil.xp_semana_actual },
      { where: { semana_inicio: semana, id_usuario, id_nivel: Number(id_nivel) } }
    );
  }

  // Recalcular posiciones
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

  const top20 = ranking.slice(0, 20);
  const yoEnTop = top20.some(r => r.es_yo);
  if (!yoEnTop) {
    const yo = ranking.find(r => r.es_yo);
    if (yo) top20.push(yo);
  }

  return { semana_inicio: semana, id_nivel: Number(id_nivel), ranking: top20 };
}

// ── Util ──────────────────────────────────────────────────────────────────────
function inicioSemana() {
  const hoy   = new Date();
  const dia   = hoy.getDay();           // 0=dom, 1=lun …
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - ((dia + 6) % 7)); // retroceder al lunes
  return lunes.toISOString().split('T')[0];
}

module.exports = { getMedals, getRanking };
