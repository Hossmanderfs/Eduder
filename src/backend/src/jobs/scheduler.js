// src/jobs/scheduler.js — tareas programadas (node-cron)
// RF-17 reinicio semanal del ranking · RF-16 recordatorio de racha · RF-23 backup diario.
const cron = require('node-cron');
const { resetWeeklyXP } = require('../services/gamification.service');
const { sendStreakReminders } = require('../services/notification.service');
const { runBackup } = require('./backup');

const TZ = process.env.CRON_TZ || 'America/Bogota';

function safe(nombre, fn) {
  return async () => {
    try {
      const r = await fn();
      console.log(`[cron] ${nombre} OK`, r ? JSON.stringify(r) : '');
    } catch (err) {
      console.error(`[cron] ${nombre} FALLÓ:`, err.message);
    }
  };
}

function start() {
  if (process.env.DISABLE_CRON === 'true') {
    console.log('[cron] deshabilitado por DISABLE_CRON');
    return [];
  }
  return [
    // RF-17: lunes 00:00 — reinicia el XP semanal
    cron.schedule('0 0 * * 1', safe('reinicio ranking semanal', resetWeeklyXP), { timezone: TZ }),
    // RF-16: todos los días 18:00 — recordatorio de racha
    cron.schedule('0 18 * * *', safe('recordatorio de racha', () => sendStreakReminders()), { timezone: TZ }),
    // RF-23: todos los días 02:00 — backup
    cron.schedule('0 2 * * *', safe('backup diario', runBackup), { timezone: TZ }),
  ];
}

module.exports = { start };
