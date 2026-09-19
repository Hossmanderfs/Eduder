// src/screens/LessonScreen.js — EduDer
// CU-03 | RF-08, RF-10, RF-11, RF-12 | E12 - cargarContenido() / evaluar() / obtenerPista()
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, StatusBar, Alert,
} from 'react-native';
import api from '../services/api';
import { COLORS } from '../theme/colors';

export default function LessonScreen({ route, navigation }) {
  const { id_leccion, titulo } = route.params ?? {};

  const [leccion,    setLeccion]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  // Estado del ejercicio activo
  const [ejIdx,      setEjIdx]      = useState(0);
  const [respuesta,  setRespuesta]  = useState('');
  const [resultado,  setResultado]  = useState(null); // { correcto, explicacion }
  const [pista,      setPista]      = useState(null);
  const [enviando,   setEnviando]   = useState(false);
  const [fase,       setFase]       = useState('contenido'); // 'contenido' | 'ejercicios' | 'fin'

  // RF-08: cargar contenido completo de la lección al montar
  useEffect(() => {
    async function cargar() {
      try {
        const res = await api.get(`/lessons/${id_leccion}/content`);
        setLeccion(res.data);
      } catch {
        setError('No se pudo cargar la lección.');
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, [id_leccion]);

  // RF-10: evaluar respuesta del estudiante
  async function enviarRespuesta() {
    if (!respuesta.trim()) return;
    setEnviando(true);
    try {
      const ejercicio = leccion.ejercicios[ejIdx];
      const res = await api.post('/exercise/evaluate', {
        id_ejercicio: ejercicio.id_ejercicio,
        respuesta: respuesta.trim(),
      });
      setResultado(res.data);
    } catch {
      setResultado({ correcto: false, explicacion: 'Error al evaluar. Intenta de nuevo.' });
    } finally {
      setEnviando(false);
    }
  }

  // RF-11: solicitar pista bajo demanda
  async function pedirPista(numero) {
    try {
      const ejercicio = leccion.ejercicios[ejIdx];
      const res = await api.get(`/exercise/${ejercicio.id_ejercicio}/hint/${numero}`);
      setPista(res.data.texto_pista);
    } catch {
      setPista('No hay más pistas para este ejercicio.');
    }
  }

  function siguienteEjercicio() {
    const total = leccion.ejercicios?.length ?? 0;
    setResultado(null);
    setRespuesta('');
    setPista(null);
    if (ejIdx + 1 >= total) {
      marcarCompletada();
      setFase('fin');
    } else {
      setEjIdx(ejIdx + 1);
    }
  }

  // RF-12: registrar lección como completada con el puntaje
  async function marcarCompletada() {
    try {
      await api.put(`/progress/${id_leccion}`, { estado: 'completada', puntaje: 100 });
    } catch {}
  }

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={COLORS.rojo} />
    </View>
  );

  if (error) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.btnVolver} onPress={() => navigation.goBack()}>
        <Text style={styles.btnVolverText}>← Volver</Text>
      </TouchableOpacity>
    </View>
  );

  // ── Pantalla de finalización ──────────────────────────────
  if (fase === 'fin') return (
    <View style={[styles.center, { backgroundColor: COLORS.bg }]}>
      <StatusBar backgroundColor={COLORS.azul} barStyle="light-content" />
      <Text style={{ fontSize: 64 }}>🎉</Text>
      <Text style={styles.finTitulo}>¡Lección completada!</Text>
      <Text style={styles.finSub}>+{leccion?.xp_base ?? 50} XP ganados</Text>
      <TouchableOpacity style={styles.btnFin} onPress={() => navigation.goBack()}>
        <Text style={styles.btnFinText}>Volver al menú</Text>
      </TouchableOpacity>
    </View>
  );

  const ejercicios = leccion?.ejercicios ?? [];
  const contenidos = leccion?.contenidos ?? [];

  // ── Fase de contenido ─────────────────────────────────────
  if (fase === 'contenido') return (
    <View style={styles.flex}>
      <StatusBar backgroundColor={COLORS.azul} barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitulo} numberOfLines={1}>{titulo}</Text>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{leccion.xp_base} XP</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16 }}>
        {contenidos.map((bloque, i) => (
          <View key={i} style={styles.bloqueContenido}>
            {bloque.tipo_contenido === 'titulo' && (
              <Text style={styles.bloqueTitle}>{bloque.contenido}</Text>
            )}
            {bloque.tipo_contenido === 'texto' && (
              <Text style={styles.bloqueTexto}>{bloque.contenido}</Text>
            )}
            {bloque.tipo_contenido === 'ejemplo' && (
              <View style={styles.bloqueEjemplo}>
                <Text style={styles.bloqueEjemploLabel}>Ejemplo</Text>
                <Text style={styles.bloqueEjemploTexto}>{bloque.contenido}</Text>
              </View>
            )}
            {bloque.tipo_contenido === 'nota' && (
              <View style={styles.bloqueNota}>
                <Text style={styles.bloqueNotaTexto}>💡 {bloque.contenido}</Text>
              </View>
            )}
          </View>
        ))}

        {contenidos.length === 0 && (
          <Text style={{ color: COLORS.muted, textAlign: 'center', marginTop: 40 }}>
            Esta lección no tiene contenido teórico.
          </Text>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.footer}>
        {ejercicios.length > 0 ? (
          <TouchableOpacity style={styles.btnPrimario} onPress={() => setFase('ejercicios')}>
            <Text style={styles.btnPrimarioText}>Ir a los ejercicios →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.btnPrimario} onPress={() => { marcarCompletada(); setFase('fin'); }}>
            <Text style={styles.btnPrimarioText}>Completar lección ✓</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // ── Fase de ejercicios ────────────────────────────────────
  const ejercicio = ejercicios[ejIdx];
  const totalEj   = ejercicios.length;

  return (
    <View style={styles.flex}>
      <StatusBar backgroundColor={COLORS.rojo} barStyle="light-content" />
      <View style={[styles.header, { backgroundColor: COLORS.rojo }]}>
        <TouchableOpacity onPress={() => setFase('contenido')}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Ejercicio {ejIdx + 1} de {totalEj}</Text>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{leccion.xp_base} XP</Text>
        </View>
      </View>

      {/* Barra de progreso */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((ejIdx) / totalEj) * 100}%` }]} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 20 }}>
        {/* Enunciado */}
        <View style={styles.enunciadoBox}>
          <Text style={styles.enunciadoLabel}>Pregunta</Text>
          <Text style={styles.enunciadoText}>{ejercicio.enunciado}</Text>
        </View>

        {/* Pista */}
        {pista && (
          <View style={styles.pistaBox}>
            <Text style={styles.pistaText}>💡 {pista}</Text>
          </View>
        )}

        {/* Resultado */}
        {resultado && (
          <View style={[styles.resultadoBox, resultado.correcto ? styles.resultadoCorrecto : styles.resultadoIncorrecto]}>
            <Text style={styles.resultadoIcon}>{resultado.correcto ? '✅' : '❌'}</Text>
            <Text style={styles.resultadoTexto}>
              {resultado.correcto ? '¡Correcto!' : `Incorrecto. ${resultado.explicacion ?? ''}`}
            </Text>
          </View>
        )}

        {/* Input de respuesta */}
        {!resultado && (
          <>
            <TextInput
              style={styles.inputRespuesta}
              placeholder="Escribe tu respuesta aquí..."
              placeholderTextColor={COLORS.muted_light}
              value={respuesta}
              onChangeText={setRespuesta}
              multiline
              returnKeyType="done"
            />

            {/* Pistas disponibles */}
            {(ejercicio.pistas?.length ?? 0) > 0 && !pista && (
              <TouchableOpacity style={styles.btnPista} onPress={() => pedirPista(1)}>
                <Text style={styles.btnPistaText}>💡 Ver pista</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.footer}>
        {resultado ? (
          <TouchableOpacity style={styles.btnPrimario} onPress={siguienteEjercicio}>
            <Text style={styles.btnPrimarioText}>
              {ejIdx + 1 >= totalEj ? 'Finalizar lección ✓' : 'Siguiente ejercicio →'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btnPrimario, (!respuesta.trim() || enviando) && styles.btnDisabled]}
            onPress={enviarRespuesta}
            disabled={!respuesta.trim() || enviando}
          >
            {enviando
              ? <ActivityIndicator color={COLORS.blanco} />
              : <Text style={styles.btnPrimarioText}>Verificar respuesta</Text>
            }
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex:   { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg, padding: 24 },
  scroll: { flex: 1 },

  header: {
    backgroundColor: COLORS.azul,
    paddingTop: 44,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn:       { color: COLORS.blanco, fontSize: 22, fontWeight: '700', paddingRight: 4 },
  headerTitulo:  { flex: 1, color: COLORS.blanco, fontSize: 15, fontWeight: '700' },
  xpBadge:       { backgroundColor: COLORS.xp, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  xpText:        { color: COLORS.blanco, fontSize: 11, fontWeight: '700' },

  progressBar:   { height: 4, backgroundColor: COLORS.borde },
  progressFill:  { height: 4, backgroundColor: COLORS.rojo },

  // Contenido
  bloqueContenido: { marginBottom: 16 },
  bloqueTitle:   { fontSize: 18, fontWeight: '700', color: COLORS.texto, marginBottom: 4 },
  bloqueTexto:   { fontSize: 15, color: COLORS.texto, lineHeight: 24 },
  bloqueEjemplo: {
    backgroundColor: COLORS.azul_light,
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.azul,
  },
  bloqueEjemploLabel: { fontSize: 11, fontWeight: '700', color: COLORS.azul, textTransform: 'uppercase', marginBottom: 4 },
  bloqueEjemploTexto: { fontSize: 14, color: COLORS.azul_oscuro, fontFamily: 'monospace' },
  bloqueNota: {
    backgroundColor: COLORS.xp_light,
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.xp,
  },
  bloqueNotaTexto: { fontSize: 14, color: COLORS.warning },

  // Ejercicios
  enunciadoBox: {
    backgroundColor: COLORS.superficie,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  enunciadoLabel: { fontSize: 11, fontWeight: '700', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
  enunciadoText:  { fontSize: 16, color: COLORS.texto, lineHeight: 24 },

  pistaBox: {
    backgroundColor: COLORS.xp_light,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.xp,
  },
  pistaText: { fontSize: 14, color: COLORS.warning },

  resultadoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  resultadoCorrecto:   { backgroundColor: COLORS.success_light },
  resultadoIncorrecto: { backgroundColor: COLORS.danger_light },
  resultadoIcon:       { fontSize: 20 },
  resultadoTexto:      { flex: 1, fontSize: 14, lineHeight: 22, color: COLORS.texto },

  inputRespuesta: {
    backgroundColor: COLORS.superficie,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borde,
    padding: 14,
    fontSize: 15,
    color: COLORS.texto,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  btnPista: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  btnPistaText: { color: COLORS.azul, fontSize: 13, fontWeight: '600' },

  // Fin
  finTitulo: { fontSize: 26, fontWeight: '800', color: COLORS.texto, marginTop: 16, marginBottom: 8 },
  finSub:    { fontSize: 16, color: COLORS.xp, fontWeight: '700', marginBottom: 32 },
  btnFin:    { backgroundColor: COLORS.azul, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40 },
  btnFinText:{ color: COLORS.blanco, fontSize: 16, fontWeight: '700' },

  // Footer
  footer: {
    padding: 16,
    backgroundColor: COLORS.superficie,
    borderTopWidth: 1,
    borderTopColor: COLORS.borde,
  },
  btnPrimario: {
    backgroundColor: COLORS.rojo,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled:    { opacity: 0.5 },
  btnPrimarioText:{ color: COLORS.blanco, fontSize: 16, fontWeight: '700' },
  btnVolver:      { marginTop: 16 },
  btnVolverText:  { color: COLORS.azul, fontSize: 15, fontWeight: '600' },
  errorText:      { color: COLORS.danger, fontSize: 15, textAlign: 'center', marginBottom: 8 },
});
