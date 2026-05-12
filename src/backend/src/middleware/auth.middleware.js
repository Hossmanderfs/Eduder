// src/middleware/auth.middleware.js

const jwt = require('jsonwebtoken');

// ── RF-03 | RNF-03 | E12 - iniciarSesion(): JWT ───────────────────────────────
// Verifica que el token JWT sea válido y no haya expirado.
// Agrega req.usuario = { id_usuario, correo, rol } para uso en los servicios.
// Si el usuario fue desactivado (RF-20), la próxima request falla aquí
// porque el estado se valida en AuthService.login al regenerar token.
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { id_usuario, correo, rol }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
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
