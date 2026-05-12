// src/models/Notificacion.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notificacion = sequelize.define('Notificacion', {
  id_notificacion: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  id_usuario: {
    type: DataTypes.CHAR(36),
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM('racha', 'logro', 'sistema'),
    allowNull: false,
  },
  mensaje: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  leida: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  fecha_envio: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'notificaciones',
  timestamps: false,
});

module.exports = Notificacion;
