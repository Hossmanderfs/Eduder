// src/hooks/useProgresoNiveles.js — EduDer
// CU-03 | RF-07, RF-08, RF-09 | Carga niveles + progreso y calcula el desbloqueo secuencial.
import { useState, useCallback } from 'react';
import api from '../services/api';
import { calcularEstado } from '../utils/progreso';

export function useProgresoNiveles() {
  const [niveles,    setNiveles]    = useState([]);
  const [resumen,    setResumen]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState('');

  const cargar = useCallback(async (esRefresh = false) => {
    esRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const [nv, pg] = await Promise.all([
        api.get('/levels'),
        api.get('/profile/progress').catch(() => ({ data: { detalle: [] } })),
      ]);
      setResumen(pg.data);
      setNiveles(calcularEstado(nv.data, pg.data?.detalle ?? []));
    } catch {
      setError('No se pudieron cargar los niveles. Verifica tu conexión.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  return { niveles, resumen, loading, refreshing, error, cargar };
}
