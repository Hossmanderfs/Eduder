// src/models/index.js
// =============================================
// Registro central de modelos y RELACIONES
// entre entidades — EduDer
// =============================================

const sequelize = require('../config/database');

const Usuario           = require('./Usuario');
const PerfilEstudiante  = require('./PerfilEstudiante');
const TokenRecuperacion = require('./TokenRecuperacion');
const Nivel             = require('./Nivel');
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


// Usuario (1) ——— (1) PerfilEstudiante
Usuario.hasOne(PerfilEstudiante, { foreignKey: 'id_usuario', as: 'perfil', onDelete: 'CASCADE' });
PerfilEstudiante.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Usuario (1) ——— (N) TokenRecuperacion
Usuario.hasMany(TokenRecuperacion, { foreignKey: 'id_usuario', as: 'tokens', onDelete: 'CASCADE' });
TokenRecuperacion.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Nivel (1) ——— (N) Leccion
Nivel.hasMany(Leccion, { foreignKey: 'id_nivel', as: 'lecciones', onDelete: 'RESTRICT' });
Leccion.belongsTo(Nivel, { foreignKey: 'id_nivel', as: 'nivel' });


// Leccion (1) ——— (N) ContenidoLeccion
Leccion.hasMany(ContenidoLeccion, { foreignKey: 'id_leccion', as: 'contenidos', onDelete: 'CASCADE' });
ContenidoLeccion.belongsTo(Leccion, { foreignKey: 'id_leccion', as: 'leccion' });

// Leccion (1) ——— (N) Ejercicio
Leccion.hasMany(Ejercicio, { foreignKey: 'id_leccion', as: 'ejercicios', onDelete: 'CASCADE' });
Ejercicio.belongsTo(Leccion, { foreignKey: 'id_leccion', as: 'leccion' });

// Ejercicio (1) ——— (N) Pista  [max 2]
Ejercicio.hasMany(Pista, { foreignKey: 'id_ejercicio', as: 'pistas', onDelete: 'CASCADE' });
Pista.belongsTo(Ejercicio, { foreignKey: 'id_ejercicio', as: 'ejercicio' });

// Nota: PERFIL_ESTUDIANTE.nivel_actual es el N.º de nivel (TINYINT, 1..N), no una FK a NIVEL.id_nivel;
// por eso el DDL aprobado (Línea Base 1) no declara clave foránea y no se asocia aquí.
// Las FK sin cláusula en el DDL usan RESTRICT; se declara igual en Sequelize.

// Usuario (1) ——— (N) ProgresoLeccion
Usuario.hasMany(ProgresoLeccion, { foreignKey: 'id_usuario', as: 'progresos', onDelete: 'RESTRICT' });
ProgresoLeccion.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Leccion (1) ——— (N) ProgresoLeccion
Leccion.hasMany(ProgresoLeccion, { foreignKey: 'id_leccion', as: 'progresos', onDelete: 'RESTRICT' });
ProgresoLeccion.belongsTo(Leccion, { foreignKey: 'id_leccion', as: 'leccion' });

// MedallaCatalogo (1) ——— (N) MedallaUsuario  [N:M con tabla intermedia]
MedallaCatalogo.hasMany(MedallaUsuario, { foreignKey: 'id_medalla', as: 'otorgadas', onDelete: 'RESTRICT' });
MedallaUsuario.belongsTo(MedallaCatalogo, { foreignKey: 'id_medalla', as: 'medalla' });

Usuario.hasMany(MedallaUsuario, { foreignKey: 'id_usuario', as: 'medallas', onDelete: 'RESTRICT' });
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
Usuario.hasMany(Notificacion, { foreignKey: 'id_usuario', as: 'notificaciones', onDelete: 'RESTRICT' });
Notificacion.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Usuario (1) ——— (N) RankingSemanal
Usuario.hasMany(RankingSemanal, { foreignKey: 'id_usuario', as: 'rankings', onDelete: 'RESTRICT' });
RankingSemanal.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Nivel (1) ——— (N) RankingSemanal
Nivel.hasMany(RankingSemanal, { foreignKey: 'id_nivel', as: 'rankings', onDelete: 'RESTRICT' });
RankingSemanal.belongsTo(Nivel, { foreignKey: 'id_nivel', as: 'nivel' });

// -----------------------------------------------
// EXPORTAR
// -----------------------------------------------
module.exports = {
  sequelize,
  Usuario,
  PerfilEstudiante,
  TokenRecuperacion,
  Nivel,
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
