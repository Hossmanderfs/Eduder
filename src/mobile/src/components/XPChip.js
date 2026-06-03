// src/components/XPChip.js — EduDer
// Componente reutilizable para mostrar XP o streak en el header.
// Usado en MenuScreen y PerfilScreen.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export default function XPChip({ emoji, valor, label }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.valor}>{valor}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emoji: { fontSize: 14 },
  valor: { color: COLORS.blanco, fontWeight: '700', fontSize: 14 },
  label: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
});
