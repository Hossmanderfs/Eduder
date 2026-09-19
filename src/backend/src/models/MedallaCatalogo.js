// src/models/MedallaCatalogo.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MedallaCatalogo = sequelize.define('MedallaCatalogo', {
  id_medalla: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  condicion_tipo: {
    type: DataTypes.ENUM('nivel_completado', 'puntaje_perfecto', 'streak', 'xp_acumulado'),
    allowNull: false,
  },
  condicion_valor: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  icono_url: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  tableName: 'medallas_catalogo',
  timestamps: false,
});

module.exports = MedallaCatalogo;
