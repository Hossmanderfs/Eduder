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
  const todas     = await MedallaCatalogo.findAll({ order: [['condicion_valor', 'ASC']] });
  const obtenidas = await MedallaUsuario.findAll({ where: { id_usuario }, attributes: ['id_medalla', 'fecha_obtencion'] });
  const mapObtenidas = new Map(obtenidas.map(m => [m.id_medalla, m.fecha_obtencion]));
  // RN-22: una medalla inactiva solo se muestra a quien ya la obtuvo
  const catalogo = todas.filter(m => m.estado === 'activo' || mapObtenidas.has(m.id_medalla));

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

// ── Admin | RF-28 | RN-22 | E12 - Medalla CRUD ───────────────────────────────
const CONDICIONES = ['nivel_completado', 'puntaje_perfecto', 'streak', 'xp_acumulado'];

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function validarMedalla(b, parcial) {
  if (!parcial || b.nombre !== undefined) {
    if (!b.nombre || !String(b.nombre).trim()) throw httpError(400, 'nombre es obligatorio');
  }
  if (!parcial || b.condicion_tipo !== undefined) {
    if (!CONDICIONES.includes(b.condicion_tipo)) {
      throw httpError(400, `condicion_tipo debe ser uno de: ${CONDICIONES.join(', ')}`);
    }
  }
  if (!parcial || b.condicion_valor !== undefined) {
    if (!Number.isInteger(b.condicion_valor) || b.condicion_valor <= 0) {
      throw httpError(400, 'condicion_valor debe ser un entero positivo');
    }
  }
  if (!parcial || b.icono_url !== undefined) {
    if (!b.icono_url || !String(b.icono_url).trim()) throw httpError(400, 'icono_url es obligatorio');
  }
  if (b.estado !== undefined && !['activo', 'inactivo'].includes(b.estado)) {
    throw httpError(400, "estado debe ser 'activo' o 'inactivo'");
  }
}

// Lista todo el catálogo (activas e inactivas) con el número de veces otorgada.
async function listCatalog() {
  const catalogo = await MedallaCatalogo.findAll({ order: [['condicion_valor', 'ASC']] });
  const otorgadas = await MedallaUsuario.findAll({ attributes: ['id_medalla'], raw: true });
  const conteo = {};
  otorgadas.forEach(o => { conteo[o.id_medalla] = (conteo[o.id_medalla] || 0) + 1; });
  return catalogo.map(m => ({ ...m.toJSON(), veces_otorgada: conteo[m.id_medalla] || 0 }));
}

async function createMedal(body) {
  validarMedalla(body, false);
  return MedallaCatalogo.create({
    id_medalla: uuidv4(),
    nombre: String(body.nombre).trim(),
    descripcion: body.descripcion || null,
    condicion_tipo: body.condicion_tipo,
    condicion_valor: body.condicion_valor,
    icono_url: body.icono_url,
    estado: 'activo',
  });
}

async function updateMedal(id, body) {
  const medalla = await MedallaCatalogo.findByPk(id);
  if (!medalla) throw httpError(404, 'Medalla no encontrada');
  validarMedalla(body, true);
  const campos = {};
  for (const k of ['nombre', 'descripcion', 'condicion_tipo', 'condicion_valor', 'icono_url', 'estado']) {
    if (body[k] !== undefined) campos[k] = body[k];
  }
  if (!Object.keys(campos).length) throw httpError(400, 'No se enviaron campos válidos para actualizar');
  await medalla.update(campos);
  return medalla;
}

// RN-22: una medalla ya otorgada no se elimina; se marca inactiva en el catálogo.
async function deleteMedal(id) {
  const medalla = await MedallaCatalogo.findByPk(id);
  if (!medalla) throw httpError(404, 'Medalla no encontrada');
  const otorgadas = await MedallaUsuario.count({ where: { id_medalla: id } });
  if (otorgadas > 0) {
    await medalla.update({ estado: 'inactivo' });
    return { message: 'La medalla ya fue otorgada: se marcó como inactiva (RN-22)', archivado: true };
  }
  await medalla.destroy();
  return { message: 'Medalla eliminada correctamente', archivado: false };
}

module.exports = { getMedals, getRanking, resetWeeklyXP, listCatalog, createMedal, updateMedal, deleteMedal };
