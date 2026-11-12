// src/config/dominios.js — dominios de correo institucional permitidos (RF-01).
// Estudiantes: @miremington.edu.co · Administración/docentes: @uniremington.edu.co
// Se puede sobrescribir con DOMINIOS_PERMITIDOS="a.edu.co,b.edu.co" en .env.
const DOMINIOS = (process.env.DOMINIOS_PERMITIDOS || 'miremington.edu.co,uniremington.edu.co')
  .split(',').map(d => d.trim().toLowerCase()).filter(Boolean);

function esCorreoInstitucional(correo) {
  if (typeof correo !== 'string') return false;
  const m = /^[^\s@]+@([^\s@]+)$/.exec(correo.trim().toLowerCase());
  return !!m && DOMINIOS.includes(m[1]);
}

module.exports = { DOMINIOS, esCorreoInstitucional };
