// scripts/seed-contenido.js — EduDer
// Carga el contenido semilla: 5 niveles, 15 lecciones (con teoría, ejercicios y pistas) y 12 medallas.
//   npm run seed                → solo si la base no tiene lecciones (no toca datos existentes)
//   npm run seed -- --reiniciar → borra niveles, lecciones, ejercicios, pistas, progreso y medallas
//                                 (NO borra usuarios) y vuelve a cargar todo
//
// Formato de ejercicios en BD (la tabla EJERCICIOS no tiene columnas de opciones/piezas):
//   seleccion_multiple / completar → "Enunciado || opción A | opción B | opción C"
//   arrastrar                      → "Enunciado || pieza 1 | pieza 2 | pieza 3"
//                                    y respuesta_correcta = piezas en orden unidas con " | "
// La app móvil separa el enunciado y las opciones/piezas con ese formato.
// Las lecciones de tipo mini_juego reciben las afirmaciones del "reto relámpago" como ejercicios
// de selección múltiple (Verdadero | Falso).
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
global.window = {};
require('./data/contenido');
const { NIVELES, MEDALLAS } = global.window.EduDer.content;
const sequelize = require('../src/config/database');
const M = require('../src/models');

function enunciadoConOpciones(e) {
  const items = e.tipo_interaccion === 'arrastrar' ? e.piezas : e.opciones;
  return items && items.length ? `${e.enunciado} || ${items.join(' | ')}` : e.enunciado;
}

function ejerciciosDe(l) {
  let lista = l.ejercicios || [];
  if (l.tipo === 'mini_juego') {
    lista = lista.filter((e) => e.tipo_interaccion === 'seleccion_multiple' && e.opciones);
    const items = (l.minijuego && l.minijuego.items) || [];
    lista = lista.concat(items.map((it, i) => ({
      tipo_interaccion: 'seleccion_multiple', enunciado: it.texto, opciones: ['Verdadero', 'Falso'],
      respuesta_correcta: it.valor ? 'Verdadero' : 'Falso',
      explicacion: `La afirmación es ${it.valor ? 'verdadera' : 'falsa'}.`,
      pistas: [], _mg: i,
    })));
  }
  return lista;
}

async function main() {
  const reiniciar = process.argv.includes('--reiniciar');
  await sequelize.authenticate();
  const existentes = await M.Leccion.count();
  if (existentes && !reiniciar) {
    console.log(`La base ya tiene ${existentes} lecciones. No se cargó nada (use --reiniciar para reemplazar el contenido).`);
    return;
  }
  await sequelize.transaction(async (t) => {
    if (reiniciar) {
      for (const modelo of [M.Pista, M.Ejercicio, M.ContenidoLeccion, M.ProgresoLeccion, M.RankingSemanal, M.MedallaUsuario, M.Leccion, M.MedallaCatalogo, M.Nivel]) {
        await modelo.destroy({ where: {}, transaction: t });
      }
    }
    for (const n of NIVELES) {
      const nivel = await M.Nivel.findOne({ where: { orden: n.orden }, transaction: t })
        || await M.Nivel.create({ nombre: n.nombre, descripcion: n.descripcion, orden: n.orden, umbral_aprobacion: n.umbral_aprobacion || 70, estado: 'activo' }, { transaction: t });
      await nivel.update({ nombre: n.nombre, descripcion: n.descripcion, umbral_aprobacion: n.umbral_aprobacion || 70, estado: 'activo' }, { transaction: t });
      for (const l of n.lecciones) {
        const id_leccion = uuidv4();
        await M.Leccion.create({ id_leccion, id_nivel: nivel.id_nivel, titulo: l.titulo, tipo: l.tipo, orden: l.orden, xp_base: l.xp_base, estado: 'activo' }, { transaction: t });
        let o = 1;
        for (const b of l.contenidos || []) {
          await M.ContenidoLeccion.create({ id_contenido: uuidv4(), id_leccion, tipo_bloque: b.tipo_bloque, contenido: b.contenido, orden: o++ }, { transaction: t });
        }
        let k = 1;
        for (const e of ejerciciosDe(l)) {
          const id_ejercicio = uuidv4();
          await M.Ejercicio.create({
            id_ejercicio, id_leccion, enunciado: enunciadoConOpciones(e), tipo_interaccion: e.tipo_interaccion, orden: k++,
            respuesta_correcta: e.respuesta_correcta, explicacion: e.explicacion,
          }, { transaction: t });
          for (const [i, texto] of (e.pistas || []).slice(0, 2).entries()) {
            await M.Pista.create({ id_pista: uuidv4(), id_ejercicio, numero_pista: i + 1, texto_pista: texto }, { transaction: t });
          }
        }
      }
    }
    for (const m of MEDALLAS) {
      const hay = await M.MedallaCatalogo.findOne({ where: { condicion_tipo: m.condicion_tipo, condicion_valor: m.condicion_valor }, transaction: t });
      if (!hay) {
        await M.MedallaCatalogo.create({ id_medalla: uuidv4(), nombre: m.nombre, descripcion: m.descripcion, condicion_tipo: m.condicion_tipo, condicion_valor: m.condicion_valor, icono_url: `medal-${m.condicion_tipo}.svg`, estado: 'activo' }, { transaction: t });
      }
    }
  });
  const c = { niveles: await M.Nivel.count(), lecciones: await M.Leccion.count(), ejercicios: await M.Ejercicio.count(), medallas: await M.MedallaCatalogo.count() };
  console.log('Contenido cargado:', c);
}

main().catch((e) => { console.error('Error al cargar el contenido:', e.message); process.exitCode = 1; }).finally(() => sequelize.close());
