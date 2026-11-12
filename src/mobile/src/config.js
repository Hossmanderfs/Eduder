// src/config.js — EduDer Mobile
// URL base del backend. 10.0.2.2 = localhost desde el emulador Android.
// Para dispositivo físico usa la IP de tu computador (p. ej. http://192.168.1.20:3000).
// Dominios de correo institucional permitidos (RF-01): estudiantes y administración.
export const DOMINIOS_PERMITIDOS = ['miremington.edu.co', 'uniremington.edu.co'];
export const DOMINIO_EJEMPLO = 'miremington.edu.co';
export function esCorreoInstitucional(correo) {
  const m = /^[^\s@]+@([^\s@]+)$/.exec(String(correo || '').trim().toLowerCase());
  return !!m && DOMINIOS_PERMITIDOS.includes(m[1]);
}
export const TEXTO_DOMINIOS = DOMINIOS_PERMITIDOS.map(d => '@' + d).join(' o ');

export const API_BASE_URL = 'http://10.0.2.2:3000';
