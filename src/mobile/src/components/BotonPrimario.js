// src/components/BotonPrimario.js — EduDer
// Botón principal reutilizable con estado de carga.
// Usado en LoginScreen, RegisterScreen, LessonScreen.
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export default function BotonPrimario({ texto, onPress, cargando = false, disabled = false, color = COLORS.rojo }) {
  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: color }, (disabled || cargando) && styles.disabled]}
      onPress={onPress}
      disabled={disabled || cargando}
      accessibilityRole="button"
    >
      {cargando
        ? <ActivityIndicator color={COLORS.blanco} />
        : <Text style={styles.texto}>{texto}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.55 },
  texto: { color: COLORS.blanco, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
