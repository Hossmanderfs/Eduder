// src/services/auth.service.js — EduDer Mobile
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const TOKEN_KEY  = 'eduder_token';
const USER_KEY   = 'eduder_user';

// ── CU-01 | RF-01, RF-02 | E12 - registrar() ─────────────────────────────────
// Envía los datos de registro al backend. Si es exitoso, persiste
// el JWT y los datos del usuario en AsyncStorage.
export async function register({ correo_institucional, nombre, apellido, contrasena }) {
  const { data } = await api.post('/auth/register', {
    correo_institucional,
    nombre,
    apellido,
    contrasena,
  });
  await AsyncStorage.setItem(TOKEN_KEY, data.token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
  return data;
}

// ── CU-02 | RF-03, RF-04, RF-05, RF-06 | E12 - iniciarSesion() ───────────────
// Envía credenciales al backend. Persiste el JWT y datos del usuario
// en AsyncStorage para sesión persistente.
// El backend maneja el bloqueo tras 5 intentos fallidos (RF-05).
export async function login({ correo_institucional, contrasena }) {
  const { data } = await api.post('/auth/login', {
    correo_institucional,
    contrasena,
  });
  await AsyncStorage.setItem(TOKEN_KEY, data.token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
  return data;
}

// ── CU-02 | RF-03 | E12 - logout() ───────────────────────────────────────────
// Elimina el token y los datos del usuario del almacenamiento local.
export async function logout() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}

// ── CU-02 | RF-03 | E12 - iniciarSesion(): JWT ────────────────────────────────
// Verifica si hay una sesión activa guardada localmente.
// Devuelve { token, usuario } o null si no hay sesión.
export async function getStoredSession() {
  const token   = await AsyncStorage.getItem(TOKEN_KEY);
  const userRaw = await AsyncStorage.getItem(USER_KEY);
  if (!token || !userRaw) return null;
  return { token, usuario: JSON.parse(userRaw) };
}
