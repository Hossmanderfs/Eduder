// src/services/api.js — EduDer
// Configuración central de Axios para todas las llamadas al backend.
// Inyecta automáticamente el token JWT en cada request (RF-03 | RNF-03).
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.0.2.2:3000'; // 10.0.2.2 = localhost desde emulador Android

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

export default api;
