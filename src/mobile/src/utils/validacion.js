// src/utils/validacion.js — EduDer
// Regla de contraseña del wireframe WF-04: mínimo 8 caracteres con al menos una letra y un número.
export function errorClave(v) {
  if (!v || v.length < 8) return 'Mínimo 8 caracteres.';
  if (!/[a-zA-ZñÑ]/.test(v) || !/\d/.test(v)) return 'Incluye al menos una letra y un número.';
  return '';
}
