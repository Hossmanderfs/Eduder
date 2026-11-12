// src/services/api.js — EduDer
// Configuración central de Axios para todas las llamadas al backend.
// Inyecta automáticamente el token JWT en cada request (RF-03 | RNF-03) y,
// ante un 401 (token vencido o cuenta desactivada, RF-20), cierra la sesión local
// y lleva al usuario a Login.
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
import { navigationRef } from '../navigation/navigationRef';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: agrega Bearer token a cada request autenticado
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('eduder_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta: 401 con sesión guardada → limpiar y volver a Login.
// Se ignoran los endpoints /auth/* (un 401 en login significa credenciales incorrectas).
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url ?? '';
    if (status === 401 && !url.startsWith('/auth/')) {
      await AsyncStorage.multiRemove(['eduder_token', 'eduder_user']);
      if (navigationRef.isReady()) {
        navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
