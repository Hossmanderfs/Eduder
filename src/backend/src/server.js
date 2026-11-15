// src/server.js — EduDer Backend
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { sequelize } = require('./models');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────
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

// ── Arranque ─────────────────────────────────
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión a MySQL establecida');
    return sequelize.sync({ alter: false }); // usar DDL para crear tablas
  })
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 EduDer API corriendo en http://localhost:${PORT}`)
    );
    require('./jobs/scheduler').start();
  })
  .catch(err => {
    console.error('❌ Error al conectar con la base de datos:', err.message);
    process.exit(1);
  });

module.exports = app;
