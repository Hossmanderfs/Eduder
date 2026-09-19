// src/hooks/useAuth.js — EduDer
// CU-02 | RF-03, RF-04 | E12 - iniciarSesion(): JWT
// Hook reutilizable para acceder a la sesión del usuario autenticado.
// Encapsula la lectura de AsyncStorage para no repetirla en cada pantalla.
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAuth() {
  const [usuario,  setUsuario]  = useState(null);
  const [token,    setToken]    = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const t = await AsyncStorage.getItem('eduder_token');
        const u = await AsyncStorage.getItem('eduder_user');
        setToken(t);
        setUsuario(u ? JSON.parse(u) : null);
      } catch {
        setUsuario(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  const estaAutenticado = !!token && !!usuario;
  const esAdmin         = usuario?.rol === 'admin';

  return { usuario, token, loading, estaAutenticado, esAdmin };
}
