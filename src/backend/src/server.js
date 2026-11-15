// src/server.js — EduDer Backend: conecta a la BD, sincroniza y arranca el servidor HTTP
require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const PORT = process.env.PORT || 3000;

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
