// src/models/PerfilEstudiante.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PerfilEstudiante = sequelize.define('PerfilEstudiante', {
  id_perfil: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  id_usuario: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    unique: true,
  },
  nivel_actual: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 1,
  },
  xp_total: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
  streak_dias: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
  ultima_actividad: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  xp_semana_actual: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'perfil_estudiante',
  timestamps: false,
});

module.exports = PerfilEstudiante;
