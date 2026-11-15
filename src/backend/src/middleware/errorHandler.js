// src/middleware/errorHandler.js — RNF-03/RNF-07 · Auditoría Bloque 3, pregunta 6
// Convierte rutas inexistentes y errores no controlados en respuestas JSON
// { "error": "mensaje" } con código HTTP coherente, sin exponer trazas técnicas.

// 404: ninguna ruta atendió la petición.
function notFound(req, res) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
}

// Manejador global (firma de 4 parámetros: Express lo reconoce como middleware de errores).
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // JSON mal formado en el cuerpo de la petición
  if (err && (err.type === 'entity.parse.failed' || err instanceof SyntaxError)) {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
  // Errores de negocio lanzados por los servicios con err.status (400, 401, 403, 404, 409, 429)
  const status = Number.isInteger(err && err.status) ? err.status : 500;
  if (status >= 500) {
    console.error('❌ Error no controlado:', err); // la traza queda solo en el log del servidor
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  return res.status(status).json({ error: err.message || 'Solicitud inválida' });
}

module.exports = { notFound, errorHandler };
