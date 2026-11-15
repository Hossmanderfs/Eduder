// src/cluster.js — Arranque multiproceso opcional (RNF-04: escalar a 400+ usuarios concurrentes)
// Uso: npm run start:cluster            (un proceso por núcleo de CPU)
//      WORKERS=4 npm run start:cluster  (número fijo de procesos)
// Cada proceso atiende peticiones HTTP en el mismo puerto; las tareas programadas (cron:
// ranking, recordatorios y backup) solo se ejecutan en el primer proceso para no duplicarse.
const cluster = require('cluster');
const os = require('os');

if (cluster.isPrimary) {
  const n = Math.max(1, parseInt(process.env.WORKERS || String(os.cpus().length), 10));
  console.log(`🧩 Proceso principal: iniciando ${n} procesos de la API`);
  for (let i = 0; i < n; i++) {
    cluster.fork({ DISABLE_CRON: i === 0 ? (process.env.DISABLE_CRON || 'false') : 'true' });
  }
  cluster.on('exit', (w, code) => {
    console.error(`⚠️  Proceso ${w.process.pid} terminó (código ${code}); se reinicia`);
    cluster.fork({ DISABLE_CRON: 'true' });
  });
} else {
  require('./server');
}
