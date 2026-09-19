// src/components/MedallaChip.js — EduDer
// CU-04 | RF-14, RF-18 | E12 - verificarCondicion() / obtenerResumen()
// Chip reutilizable para mostrar una medalla obtenida o bloqueada.
// Usado en PerfilScreen y en futuras pantallas de logros.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export default function MedallaChip({ nombre, icono = '🏅', obtenida = true }) {
  return (
    <View style={[styles.chip, !obtenida && styles.bloqueada]}>
      <Text style={styles.icono}>{obtenida ? icono : '🔒'}</Text>
      <Text style={[styles.nombre, !obtenida && styles.nombreBloqueado]}>{nombre}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.azul_light,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bloqueada: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.borde,
  },
  icono:          { fontSize: 14 },
  nombre:         { fontSize: 12, fontWeight: '600', color: COLORS.azul },
  nombreBloqueado:{ color: COLORS.muted },
});
