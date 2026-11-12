// src/screens/MiniJuegoScreen.js — EduDer
// CU-03 | RF-10, RF-12 | Mini-juego "Reto relámpago": preguntas de la lección con 3 vidas.
// Cada acierto suma al combo; el puntaje final = aciertos / total de preguntas × 100.
// Las respuestas se validan con el mismo endpoint de evaluación (POST /exercise/answer).
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, ActivityIndicator, StatusBar, TouchableOpacity,
} from 'react-native';
import api from '../services/api';
import BotonPrimario from '../components/BotonPrimario';
import FeedbackModal from '../components/FeedbackModal';
import { COLORS } from '../theme/colors';

const VIDAS = 3;

export default function MiniJuegoScreen({ route, navigation }) {
  const { id_leccion, titulo, leccion: leccionParam } = route.params ?? {};
  const [leccion, setLeccion] = useState(leccionParam ?? null);
  const [idx, setIdx] = useState(0);
  const [resp, setResp] = useState('');
  const [vidas, setVidas] = useState(VIDAS);
  const [combo, setCombo] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const aciertos = useRef(0);

  useEffect(() => {
    if (leccion) return;
    api.get(`/lessons/${id_leccion}/content`).then(r => setLeccion(r.data)).catch(() => setError('No se pudo cargar el mini-juego.'));
  }, [id_leccion, leccion]);

  const preguntas = leccion?.ejercicios ?? [];
  const total = preguntas.length;

  async function enviar() {
    if (!resp.trim()) return;
    setEnviando(true);
    setError('');
    try {
      const res = await api.post('/exercise/answer', { id_ejercicio: preguntas[idx].id_ejercicio, respuesta: resp.trim() });
      if (res.data.correcto) { aciertos.current += 1; setCombo(c => c + 1); }
      else { setVidas(v => v - 1); setCombo(0); }
      setResultado(res.data);
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  async function continuar() {
    const sinVidas = vidas <= 0;
    const fin = idx + 1 >= total || sinVidas;
    setResultado(null);
    setResp('');
    if (!fin) { setIdx(idx + 1); return; }
    const puntaje = total ? Math.round((aciertos.current / total) * 100) : 0;
    setGuardando(true);
    try {
      const res = await api.put(`/progress/${id_leccion}`, { estado: 'completada', puntaje });
      navigation.replace('Resumen', { titulo: titulo ?? leccion?.titulo, puntaje, resumen: res.data?.resumen ?? { xp_ganado: 0, nuevas_medallas: [] }, id_leccion });
    } catch {
      setError('No se pudo guardar tu progreso.');
      setGuardando(false);
    }
  }

  if (!leccion) return (
    <View style={styles.center}>
      {error ? <Text style={styles.error}>{error}</Text> : <ActivityIndicator size="large" color={COLORS.rojo} />}
    </View>
  );
  if (total === 0) return (
    <View style={styles.center}>
      <Text style={styles.error}>Este mini-juego aún no tiene preguntas.</Text>
      <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.volver}>← Volver</Text></TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.flex}>
      <StatusBar backgroundColor={COLORS.rojo} barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>✕</Text></TouchableOpacity>
        <Text style={styles.titulo} numberOfLines={1}>🎮 {titulo ?? leccion.titulo}</Text>
        <Text style={styles.vidas}>{'❤️'.repeat(Math.max(vidas, 0))}{'🖤'.repeat(VIDAS - Math.max(vidas, 0))}</Text>
      </View>
      <View style={styles.stats}>
        <Text style={styles.stat}>Pregunta {idx + 1}/{total}</Text>
        <Text style={styles.stat}>🔥 Combo x{combo}</Text>
        <Text style={styles.stat}>✔ {aciertos.current}</Text>
      </View>
      <View style={styles.cuerpo}>
        <View style={styles.pregunta}><Text style={styles.preguntaText}>{preguntas[idx].enunciado}</Text></View>
        <TextInput
          style={styles.input}
          placeholder="Tu respuesta…"
          placeholderTextColor={COLORS.muted_light}
          value={resp}
          onChangeText={setResp}
          autoCapitalize="none"
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
      <View style={styles.footer}>
        <BotonPrimario texto="Responder" onPress={enviar} cargando={enviando || guardando} disabled={!resp.trim()} />
      </View>
      <FeedbackModal
        visible={!!resultado}
        correcto={!!resultado?.correcto}
        explicacion={resultado?.explicacion}
        respuestaCorrecta={resultado?.respuesta_correcta}
        textoBoton={vidas <= 0 || idx + 1 >= total ? 'Ver resultado' : 'Siguiente'}
        onContinuar={continuar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.rojo, paddingTop: 44, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  back: { color: COLORS.blanco, fontSize: 20, fontWeight: '700', paddingRight: 12 },
  titulo: { flex: 1, color: COLORS.blanco, fontSize: 16, fontWeight: '700' },
  vidas: { fontSize: 14 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', padding: 14 },
  stat: { color: COLORS.muted, fontWeight: '600', fontSize: 13 },
  cuerpo: { flex: 1, padding: 18 },
  pregunta: { backgroundColor: COLORS.superficie, borderRadius: 14, padding: 20, marginBottom: 16 },
  preguntaText: { fontSize: 17, color: COLORS.texto, lineHeight: 25 },
  input: { backgroundColor: COLORS.superficie, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borde, padding: 14, fontSize: 16, color: COLORS.texto },
  footer: { padding: 16, backgroundColor: COLORS.superficie, borderTopWidth: 1, borderTopColor: COLORS.borde },
  error: { color: COLORS.danger, textAlign: 'center', marginTop: 8 },
  volver: { color: COLORS.azul, marginTop: 14, fontWeight: '600' },
});
