// src/middleware/auth.middleware.js

const jwt = require('jsonwebtoken');

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
    const { Usuario } = require('../models');
    const u = await Usuario.findByPk(payload.id_usuario, { attributes: ['id_usuario', 'estado', 'rol'] });
    if (!u || u.estado !== 'activo') {
      return res.status(401).json({ message: 'Sesión inválida: cuenta inexistente o desactivada' });
    }
    // el rol se toma de la BD, no del token (cambios de rol aplican de inmediato)
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

module.exports = { verifyToken, requireAdmin };
