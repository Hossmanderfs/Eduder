// src/models/Ejercicio.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ejercicio = sequelize.define('Ejercicio', {
  id_ejercicio: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  id_leccion: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  enunciado: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  tipo_interaccion: {
    type: DataTypes.ENUM('seleccion_multiple', 'completar', 'arrastrar'),
    allowNull: false,
  },
  orden: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  respuesta_correcta: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  explicacion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'ejercicios',
  timestamps: false,
});

module.exports = Ejercicio;
