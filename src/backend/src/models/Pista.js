// src/models/Pista.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pista = sequelize.define('Pista', {
  id_pista: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  id_ejercicio: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  numero_pista: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    validate: {
      isIn: [[1, 2]],
    },
  },
  texto_pista: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'pistas',
  timestamps: false,
});

module.exports = Pista;
