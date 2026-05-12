// src/models/RankingSemanal.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RankingSemanal = sequelize.define('RankingSemanal', {
  id_ranking: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  id_usuario: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  id_nivel: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
  semana_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  xp_semana: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
  posicion: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'ranking_semanal',
  timestamps: false,
  indexes: [{ unique: true, fields: ['semana_inicio', 'id_usuario', 'id_nivel'] }],
});

module.exports = RankingSemanal;
