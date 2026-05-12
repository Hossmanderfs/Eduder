// src/models/TokenRecuperacion.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TokenRecuperacion = sequelize.define('TokenRecuperacion', {
  id_token: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  id_usuario: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  token_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  expira_en: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  usado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'tokens_recuperacion',
  timestamps: false,
});

module.exports = TokenRecuperacion;
