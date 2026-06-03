// src/components/ErrorBanner.js — EduDer
// Banner de error inline reutilizable.
// Usado en LoginScreen, RegisterScreen y RecoverScreen.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export default function ErrorBanner({ mensaje }) {
  if (!mensaje) return null;
  return (
    <View style={styles.box}>
      <Text style={styles.texto}>⚠️  {mensaje}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: COLORS.danger_light,
    borderRadius: 8,
    padding: 10,
    marginTop: 14,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger,
  },
  texto: { fontSize: 13, color: COLORS.danger },
});
