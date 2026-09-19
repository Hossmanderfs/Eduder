// src/models/Nivel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Nivel = sequelize.define('Nivel', {
  id_nivel: {
    type: DataTypes.TINYINT.UNSIGNED,
    primaryKey: true,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  orden: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  umbral_aprobacion: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 70,
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    allowNull: false,
    defaultValue: 'activo',
  },
}, {
  tableName: 'niveles',
  timestamps: false,
});

module.exports = Nivel;
