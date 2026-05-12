// src/models/Usuario.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
        if (!value.endsWith('@uniremington.edu.co')) {
          throw new Error('El correo debe ser institucional (@uniremington.edu.co)');
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
  id_rol: {
    type: DataTypes.CHAR(10),
    allowNull: false,
    defaultValue: 'estudiante',
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
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
