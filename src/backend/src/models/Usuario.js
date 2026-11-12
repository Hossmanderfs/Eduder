// src/models/Usuario.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { esCorreoInstitucional, DOMINIOS } = require('../config/dominios');

const Usuario = sequelize.define('Usuario', {
  id_usuario: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  correo_institucional: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      isInstitucional(value) {
        if (!esCorreoInstitucional(value)) {
          throw new Error(`El correo debe ser institucional (${DOMINIOS.map(d => '@' + d).join(' o ')})`);
        }
      },
    },
  },
  nombre: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  contrasena_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  rol: {
    type: DataTypes.ENUM('estudiante', 'admin'),
    allowNull: false,
    defaultValue: 'estudiante',
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    allowNull: false,
    defaultValue: 'activo',
  },
  fecha_registro: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  intentos_login: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
  bloqueado_hasta: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'usuarios',
  timestamps: false,
});

module.exports = Usuario;
