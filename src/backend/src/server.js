// src/server.js — EduDer Backend
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { sequelize } = require('./models');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────
app.use(cors());
app.use(express.json());

// ── Rutas ───────────────────────────────────
app.use('/auth',         require('./routes/auth.routes'));
app.use('/levels',       require('./routes/level.routes'));
app.use('/lessons',      require('./routes/lesson.routes'));
app.use('/exercise',     require('./routes/exercise.routes'));
app.use('/progress',     require('./routes/progress.routes'));
app.use('/profile',      require('./routes/profile.routes'));
app.use('/gamification', require('./routes/gamification.routes'));
app.use('/admin',        require('./routes/admin.routes'));

// ── Health check ────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', project: 'EduDer' }));

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
  })
  .catch(err => {
    console.error('❌ Error al conectar con la base de datos:', err.message);
    process.exit(1);
  });

module.exports = app;
