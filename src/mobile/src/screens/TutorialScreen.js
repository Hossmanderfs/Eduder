// src/screens/TutorialScreen.js — EduDer
// Onboarding de 4 diapositivas la primera vez que el estudiante entra a la app.
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BotonPrimario from '../components/BotonPrimario';
import { COLORS } from '../theme/colors';
import { TUTORIAL_KEY } from '../utils/sesion';

const SLIDES = [
  { icono: '🧠', titulo: 'Aprende lógica jugando', texto: 'EduDer convierte la lógica matemática en un camino de niveles con lecciones cortas.' },
  { icono: '✏️', titulo: 'Practica con ejercicios', texto: 'Responde y recibe feedback inmediato. Si te atascas, puedes pedir hasta 2 pistas.' },
  { icono: '⚡', titulo: 'Gana XP y rachas', texto: 'Cada lección suma XP. Estudia a diario para mantener tu racha 🔥 y desbloquear medallas 🏅.' },
  { icono: '🏆', titulo: 'Compite cada semana', texto: 'Sube en el ranking semanal de tu nivel. Supera el umbral de aprobación para abrir el siguiente nivel.' },
];

export default function TutorialScreen({ navigation }) {
  const [i, setI] = useState(0);
  const ultimo = i === SLIDES.length - 1;

  async function terminar() {
    try { await AsyncStorage.setItem(TUTORIAL_KEY, '1'); } catch { /* ignorar */ }
    navigation.replace('Main');
  }

  const s = SLIDES[i];
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.azul} barStyle="light-content" />
      <TouchableOpacity style={styles.saltar} onPress={terminar}>
        <Text style={styles.saltarText}>Saltar</Text>
      </TouchableOpacity>
      <View style={styles.centro}>
        <Text style={styles.icono}>{s.icono}</Text>
        <Text style={styles.titulo}>{s.titulo}</Text>
        <Text style={styles.texto}>{s.texto}</Text>
      </View>
      <View style={styles.dots}>
        {SLIDES.map((_, k) => <View key={k} style={[styles.dot, k === i && styles.dotOn]} />)}
      </View>
      <View style={styles.footer}>
        <BotonPrimario texto={ultimo ? '¡Empezar!' : 'Siguiente'} onPress={() => (ultimo ? terminar() : setI(i + 1))} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.azul, padding: 24 },
  saltar: { alignSelf: 'flex-end', marginTop: 28, padding: 8 },
  saltarText: { color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  icono: { fontSize: 80, marginBottom: 20 },
  titulo: { color: COLORS.blanco, fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  texto: { color: 'rgba(255,255,255,0.85)', fontSize: 16, lineHeight: 24, textAlign: 'center', paddingHorizontal: 12 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)', marginHorizontal: 4 },
  dotOn: { backgroundColor: COLORS.blanco, width: 22 },
  footer: { paddingBottom: 12 },
});
