// src/models/Leccion.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Leccion = sequelize.define('Leccion', {
  id_leccion: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  id_nivel: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  titulo: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  tipo: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  orden: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  xp_base: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: false,
    defaultValue: 50,
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    allowNull: false,
    defaultValue: 'activo',
  },
}, {
  tableName: 'lecciones',
  timestamps: false,
});

module.exports = Leccion;
