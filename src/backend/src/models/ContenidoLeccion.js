// src/models/ContenidoLeccion.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContenidoLeccion = sequelize.define('ContenidoLeccion', {
  id_bloque: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  id_leccion: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  tipo_bloque: {
    type: DataTypes.ENUM('texto', 'imagen', 'video', 'animacion'),
    allowNull: false,
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  orden: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  },
}, {
  tableName: 'contenido_leccion',
  timestamps: false,
});

module.exports = ContenidoLeccion;
