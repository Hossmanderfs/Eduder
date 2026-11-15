// src/config/database.js
// Configuración de conexión a MySQL con Sequelize

require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '30', 10), // RNF-04: 400 usuarios concurrentes
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: false,
      underscored: true,
    },
  }
);

module.exports = sequelize;
