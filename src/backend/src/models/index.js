// src/models/index.js
// =============================================
// Registro central de modelos y RELACIONES
// entre entidades — EduDer
// =============================================

const sequelize = require('../config/database');

const Rol               = require('./Rol');
const Usuario           = require('./Usuario');
const PerfilEstudiante  = require('./PerfilEstudiante');
const TokenRecuperacion = require('./TokenRecuperacion');
const Nivel             = require('./Nivel');
const TipoLeccion       = require('./TipoLeccion');
const Leccion           = require('./Leccion');
const ContenidoLeccion  = require('./ContenidoLeccion');
const Ejercicio         = require('./Ejercicio');
const Pista             = require('./Pista');
const ProgresoLeccion   = require('./ProgresoLeccion');
const MedallaCatalogo   = require('./MedallaCatalogo');
const MedallaUsuario    = require('./MedallaUsuario');
const Notificacion      = require('./Notificacion');
const RankingSemanal    = require('./RankingSemanal');

// -----------------------------------------------
// RELACIONES
// -----------------------------------------------

// Rol (1) ——— (N) Usuario
Rol.hasMany(Usuario, { foreignKey: 'id_rol', as: 'usuarios' });
Usuario.belongsTo(Rol, { foreignKey: 'id_rol', as: 'rol' });

// Usuario (1) ——— (1) PerfilEstudiante
Usuario.hasOne(PerfilEstudiante, { foreignKey: 'id_usuario', as: 'perfil', onDelete: 'CASCADE' });
PerfilEstudiante.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Usuario (1) ——— (N) TokenRecuperacion
Usuario.hasMany(TokenRecuperacion, { foreignKey: 'id_usuario', as: 'tokens', onDelete: 'CASCADE' });
TokenRecuperacion.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Nivel (1) ——— (N) Leccion
Nivel.hasMany(Leccion, { foreignKey: 'id_nivel', as: 'lecciones', onDelete: 'RESTRICT' });
Leccion.belongsTo(Nivel, { foreignKey: 'id_nivel', as: 'nivel' });

// TipoLeccion (1) ——— (N) Leccion
TipoLeccion.hasMany(Leccion, { foreignKey: 'tipo', as: 'lecciones' });
Leccion.belongsTo(TipoLeccion, { foreignKey: 'tipo', as: 'tipoLeccion' });

// Leccion (1) ——— (N) ContenidoLeccion
Leccion.hasMany(ContenidoLeccion, { foreignKey: 'id_leccion', as: 'contenidos', onDelete: 'CASCADE' });
ContenidoLeccion.belongsTo(Leccion, { foreignKey: 'id_leccion', as: 'leccion' });

// Leccion (1) ——— (N) Ejercicio
Leccion.hasMany(Ejercicio, { foreignKey: 'id_leccion', as: 'ejercicios', onDelete: 'CASCADE' });
Ejercicio.belongsTo(Leccion, { foreignKey: 'id_leccion', as: 'leccion' });

// Ejercicio (1) ——— (N) Pista  [max 2]
Ejercicio.hasMany(Pista, { foreignKey: 'id_ejercicio', as: 'pistas', onDelete: 'CASCADE' });
Pista.belongsTo(Ejercicio, { foreignKey: 'id_ejercicio', as: 'ejercicio' });

// Usuario (1) ——— (N) ProgresoLeccion
Usuario.hasMany(ProgresoLeccion, { foreignKey: 'id_usuario', as: 'progresos' });
ProgresoLeccion.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Leccion (1) ——— (N) ProgresoLeccion
Leccion.hasMany(ProgresoLeccion, { foreignKey: 'id_leccion', as: 'progresos' });
ProgresoLeccion.belongsTo(Leccion, { foreignKey: 'id_leccion', as: 'leccion' });

// MedallaCatalogo (1) ——— (N) MedallaUsuario  [N:M con tabla intermedia]
MedallaCatalogo.hasMany(MedallaUsuario, { foreignKey: 'id_medalla', as: 'otorgadas' });
MedallaUsuario.belongsTo(MedallaCatalogo, { foreignKey: 'id_medalla', as: 'medalla' });

Usuario.hasMany(MedallaUsuario, { foreignKey: 'id_usuario', as: 'medallas' });
MedallaUsuario.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Relación N:M directa (alias para consultas)
Usuario.belongsToMany(MedallaCatalogo, {
  through: MedallaUsuario,
  foreignKey: 'id_usuario',
  otherKey: 'id_medalla',
  as: 'medallasObtenidas',
});
MedallaCatalogo.belongsToMany(Usuario, {
  through: MedallaUsuario,
  foreignKey: 'id_medalla',
  otherKey: 'id_usuario',
  as: 'ganadoresMedalla',
});

// Usuario (1) ——— (N) Notificacion
Usuario.hasMany(Notificacion, { foreignKey: 'id_usuario', as: 'notificaciones' });
Notificacion.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Usuario (1) ——— (N) RankingSemanal
Usuario.hasMany(RankingSemanal, { foreignKey: 'id_usuario', as: 'rankings' });
RankingSemanal.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Nivel (1) ——— (N) RankingSemanal
Nivel.hasMany(RankingSemanal, { foreignKey: 'id_nivel', as: 'rankings' });
RankingSemanal.belongsTo(Nivel, { foreignKey: 'id_nivel', as: 'nivel' });

// -----------------------------------------------
// EXPORTAR
// -----------------------------------------------
module.exports = {
  sequelize,
  Rol,
  Usuario,
  PerfilEstudiante,
  TokenRecuperacion,
  Nivel,
  TipoLeccion,
  Leccion,
  ContenidoLeccion,
  Ejercicio,
  Pista,
  ProgresoLeccion,
  MedallaCatalogo,
  MedallaUsuario,
  Notificacion,
  RankingSemanal,
};
