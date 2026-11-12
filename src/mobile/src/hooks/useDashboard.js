// src/hooks/useDashboard.js — EduDer
// Carga niveles + progreso + perfil y deriva el estado (desbloqueos, porcentajes, promedios).
// Se refresca cada vez que la pantalla recibe el foco (p. ej. al volver de una lección).
import { useState, useCallback, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { cargarDashboard } from '../utils/progreso';
import { mensajeError } from '../utils/formato';

export function useDashboard() {
  const navigation = useNavigation();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async (silencioso) => {
    if (!silencioso) setCargando(true);
    try {
      setData(await cargarDashboard());
      setError('');
    } catch (err) {
      setError(mensajeError(err, 'No se pudo cargar tu información.'));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    const unsub = navigation.addListener('focus', () => cargar(true));
    return unsub;
  }, [navigation, cargar]);

  return { data, error, cargando, recargar: () => cargar(false) };
}
