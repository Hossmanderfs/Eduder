// src/models/Rol.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rol = sequelize.define('Rol', {
  id_rol: {
    type: DataTypes.CHAR(10),
    primaryKey: true,
    allowNull: false,
  },
  tipo_rol: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
}, {
  tableName: 'rol',
  timestamps: false,
});

module.exports = Rol;
