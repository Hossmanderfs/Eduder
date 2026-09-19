// src/models/TipoLeccion.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TipoLeccion = sequelize.define('TipoLeccion', {
  id_tipo: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    allowNull: false,
  },
  nombre_tipo: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  descripcion_tipo: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
}, {
  tableName: 'tipo_leccion',
  timestamps: false,
});

module.exports = TipoLeccion;
