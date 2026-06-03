// src/components/AvatarInicial.js — EduDer
// Avatar circular con las iniciales del usuario.
// Usado en PerfilScreen y RankingScreen.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export default function AvatarInicial({ nombre = '', apellido = '', size = 44, color = COLORS.rojo }) {
  const iniciales = ((nombre[0] ?? '') + (apellido[0] ?? '')).toUpperCase();

  return (
    <View style={[
      styles.avatar,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: color }
    ]}>
      <Text style={[styles.texto, { fontSize: size * 0.35 }]}>{iniciales}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  texto: { color: COLORS.blanco, fontWeight: '800' },
});
