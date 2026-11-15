// src/middleware/auth.middleware.js

const jwt = require('jsonwebtoken');

// Caché breve del estado/rol de cada usuario (RNF-02, RNF-04): evita una consulta a la BD en
// cada petición. Dura SESSION_CACHE_MS (15 s por defecto) y se invalida al instante cuando el
// administrador cambia al usuario (RF-20), de modo que desactivar una cuenta sigue siendo inmediato.
const TTL_MS = parseInt(process.env.SESSION_CACHE_MS || '15000', 10);
const cacheSesion = new Map(); // id_usuario -> { estado, rol, vence }
function invalidarSesion(id_usuario) { cacheSesion.delete(id_usuario); }
function limpiarCacheSesiones() { cacheSesion.clear(); }

// ── RF-03 | RNF-03 | RF-20 ────────────────────────────────────────────────────
// Verifica el JWT y que la cuenta siga activa: si el administrador desactivó al
// usuario, su sesión se invalida en la siguiente petición (RF-20).
// Agrega req.usuario = { id_usuario, correo, rol } para uso en los servicios.
async function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  const token = authHeader.split(' ')[1];
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }

  try {
    const ahora = Date.now();
    let u = cacheSesion.get(payload.id_usuario);
    if (!u || u.vence < ahora) {
      const { Usuario } = require('../models');
      const fila = await Usuario.findByPk(payload.id_usuario, { attributes: ['id_usuario', 'estado', 'rol'] });
      u = fila ? { estado: fila.estado, rol: fila.rol, vence: ahora + TTL_MS } : null;
      if (u && TTL_MS > 0) cacheSesion.set(payload.id_usuario, u); else cacheSesion.delete(payload.id_usuario);
    }
    if (!u || u.estado !== 'activo') {
      cacheSesion.delete(payload.id_usuario);
      return res.status(401).json({ message: 'Sesión inválida: cuenta inexistente o desactivada' });
    }
    // el rol se toma de la BD (o de la caché de 15 s), no del token
    req.usuario = { ...payload, rol: u.rol };
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Error al validar la sesión' });
  }
}

// ── CU-06 | RF-20 | E12 - Gestión de Usuarios (Administrador) ────────────────
// Restringe el acceso a rutas exclusivas del administrador.
// Si el rol del token no es 'admin', responde 403 Forbidden.
function requireAdmin(req, res, next) {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({ message: 'Acceso solo para administradores' });
  }
  next();
}

module.exports = { verifyToken, requireAdmin, invalidarSesion, limpiarCacheSesiones };
