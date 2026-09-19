// src/models/MedallaUsuario.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MedallaUsuario = sequelize.define('MedallaUsuario', {
  id_med_usuario: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  id_usuario: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  id_medalla: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  fecha_obtencion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'medallas_usuario',
  timestamps: false,
  indexes: [{ unique: true, fields: ['id_usuario', 'id_medalla'] }],
});

module.exports = MedallaUsuario;
