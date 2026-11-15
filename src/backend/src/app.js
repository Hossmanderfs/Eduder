// src/app.js — Aplicación Express (middleware, rutas y manejo de errores), sin arrancar el servidor
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app  = express();

// ── Middleware ──────────────────────────────
// RNF-03: cabeceras de seguridad (sin dependencias extra). HSTS solo se envía si la petición llegó por HTTPS (proxy/TLS en producción).
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  next();
});
app.use(cors());
app.use(express.json());

// ── Panel de administración (web) ──────────────
// Disponible en http://localhost:3000/panel/ y dentro de la app móvil para el rol admin.
app.use('/panel', express.static(require('path').join(__dirname, '../../admin')));

// ── Rutas ───────────────────────────────────
app.use('/auth',         require('./controllers/auth.controller'));
app.use('/levels',       require('./controllers/level.controller'));
app.use('/lessons',      require('./controllers/lesson.controller'));
app.use('/exercise',     require('./controllers/exercise.controller'));
app.use('/progress',     require('./controllers/progress.controller'));
app.use('/profile',      require('./controllers/profile.controller'));
app.use('/gamification', require('./controllers/gamification.controller'));
app.use('/admin',        require('./controllers/admin.controller'));
app.use('/notifications', require('./controllers/notification.controller'));

// ── Health check ────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', project: 'EduDer' }));

// ── Errores: 404 y manejador global (siempre al final de las rutas) ──
app.use(notFound);
app.use(errorHandler);

module.exports = app;
