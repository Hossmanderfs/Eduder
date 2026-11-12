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

// URL del backend. En desarrollo con Expo Go se deduce la IP del computador desde el
// servidor de Metro (hostUri), así funciona en un celular físico sin configurar nada.
// Para fijarla a mano, define EXPO_PUBLIC_API_URL (p. ej. http://192.168.1.20:3000).
import Constants from 'expo-constants';

function detectarUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost;
  if (hostUri) return `http://${hostUri.split(':')[0]}:3000`;
  return 'http://10.0.2.2:3000'; // emulador Android
}
export const API_BASE_URL = detectarUrl();
