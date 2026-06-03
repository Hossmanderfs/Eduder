// src/hooks/useNiveles.js — EduDer
// CU-03 | RF-07, RF-08 | E12 - obtenerLecciones()
// Hook reutilizable para cargar y cachear la lista de niveles activos.
// Usado en MenuScreen y RankingScreen para no duplicar la lógica de carga.
import { useState, useEffect } from 'react';
import api from '../services/api';

export function useNiveles() {
  const [niveles,    setNiveles]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [refreshing, setRefreshing] = useState(false);

  async function cargar(esRefresh = false) {
    esRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const res = await api.get('/levels');
      setNiveles(res.data.filter(n => n.estado === 'activo'));
    } catch {
      setError('No se pudieron cargar los niveles.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  return { niveles, loading, error, refreshing, recargar: () => cargar(true) };
}
