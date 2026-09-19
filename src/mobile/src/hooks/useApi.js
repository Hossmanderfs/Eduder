// src/hooks/useApi.js — EduDer
// Hook reutilizable para llamadas al backend con manejo automático
// de estado de carga, error y datos. Evita repetir el patrón
// loading/error/data en cada pantalla.
// RF-03 | RNF-02 | E12 - todas las llamadas autenticadas
import { useState, useCallback } from 'react';
import api from '../services/api';

export function useApi(endpoint, opciones = {}) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const ejecutar = useCallback(async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const metodo = opciones.metodo ?? 'get';
      const res = await api[metodo](endpoint, params);
      setData(res.data);
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Error de conexión. Intenta de nuevo.';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [endpoint, opciones.metodo]);

  return { data, loading, error, ejecutar };
}
