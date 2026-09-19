// src/models/ProgresoLeccion.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProgresoLeccion = sequelize.define('ProgresoLeccion', {
  id_progreso: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  id_usuario: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  id_leccion: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('no_iniciada', 'en_progreso', 'completada'),
    allowNull: false,
    defaultValue: 'no_iniciada',
  },
  puntaje: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0, max: 100 },
  },
  intentos: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 1,
  },
  fecha_completado: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'progreso_leccion',
  timestamps: false,
  indexes: [{ unique: true, fields: ['id_usuario', 'id_leccion'] }],
});

module.exports = ProgresoLeccion;
