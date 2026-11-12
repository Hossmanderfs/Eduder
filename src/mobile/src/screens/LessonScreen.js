// src/screens/LessonScreen.js — EduDer
// CU-03 | RF-08, RF-10, RF-11, RF-12 | E12 - cargarContenido() / evaluar() / obtenerPista()
// Contenido → ejercicios con feedback inmediato → registro de progreso → Resumen.
// Lecciones de tipo mini_juego se delegan a la pantalla MiniJuego.
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, StatusBar, Image, Linking,
} from 'react-native';
import api from '../services/api';
import FeedbackModal from '../components/FeedbackModal';
import { COLORS } from '../theme/colors';

// Si el enunciado trae opciones tipo "a) ...", "1. ..." las muestra como atajos de respuesta.
function extraerOpciones(enunciado = '') {
  const ops = [];
  enunciado.split('\n').forEach((l) => {
    const m = l.match(/^\s*(?:[A-Da-d]|[1-4])[).]\s+(.+)$/);
    if (m) ops.push(m[1].trim());
  });
  return ops.length >= 2 ? ops : [];
}

export default function LessonScreen({ route, navigation }) {
  const { id_leccion, titulo } = route.params ?? {};

  const [leccion,    setLeccion]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [ejIdx,      setEjIdx]      = useState(0);
  const [respuesta,  setRespuesta]  = useState('');
  const [resultado,  setResultado]  = useState(null); // { correcto, explicacion, respuesta_correcta }
  const [pistas,     setPistas]     = useState([]);   // textos de pistas ya pedidas
  const [enviando,   setEnviando]   = useState(false);
  const [guardando,  setGuardando]  = useState(false);
  const [fase,       setFase]       = useState('contenido'); // 'contenido' | 'ejercicios'
  const aciertos = useRef(0);

  // RF-08: cargar contenido completo de la lección al montar
  useEffect(() => {
    async function cargar() {
      try {
        const res = await api.get(`/lessons/${id_leccion}/content`);
        setLeccion(res.data);
        if (res.data?.tipo === 'mini_juego' && (res.data.ejercicios?.length ?? 0) > 0) {
          navigation.replace('MiniJuego', { id_leccion, titulo: res.data.titulo, leccion: res.data });
        }
      } catch {
        setError('No se pudo cargar la lección.');
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, [id_leccion, navigation]);

  // RF-10: evaluar respuesta del estudiante
  async function enviarRespuesta() {
    if (!respuesta.trim()) return;
    setEnviando(true);
    try {
      const ejercicio = leccion.ejercicios[ejIdx];
      const res = await api.post('/exercise/answer', {
        id_ejercicio: ejercicio.id_ejercicio,
        respuesta: respuesta.trim(),
      });
      if (res.data.correcto) aciertos.current += 1;
      setResultado(res.data);
    } catch {
      setError('No se pudo evaluar la respuesta. Revisa tu conexión e intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  // RF-11: solicitar pista bajo demanda (1 y luego 2)
  async function pedirPista() {
    const numero = pistas.length + 1;
    try {
      const ejercicio = leccion.ejercicios[ejIdx];
      const res = await api.get(`/exercise/${ejercicio.id_ejercicio}/hint`, { params: { numero } });
      setPistas(p => [...p, res.data.texto_pista]);
    } catch {
      setPistas(p => [...p, 'No hay más pistas para este ejercicio.']);
    }
  }

  async function siguienteEjercicio() {
    const total = leccion.ejercicios?.length ?? 0;
    setResultado(null);
    setRespuesta('');
    setPistas([]);
    if (ejIdx + 1 >= total) {
      await finalizar(total > 0 ? Math.round((aciertos.current / total) * 100) : 100);
    } else {
      setEjIdx(ejIdx + 1);
    }
  }

  // RF-12: registrar lección como completada con el puntaje real y mostrar el resumen
  async function finalizar(puntaje) {
    setGuardando(true);
    try {
      const res = await api.put(`/progress/${id_leccion}`, { estado: 'completada', puntaje });
      navigation.replace('Resumen', {
        titulo: leccion?.titulo ?? titulo,
        puntaje,
        resumen: res.data?.resumen ?? { xp_ganado: 0, nuevas_medallas: [] },
        id_leccion,
      });
    } catch {
      setError('No se pudo guardar tu progreso. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={COLORS.rojo} />
    </View>
  );

  if (!leccion) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>{error || 'Lección no disponible.'}</Text>
      <TouchableOpacity style={styles.btnVolver} onPress={() => navigation.goBack()}>
        <Text style={styles.btnVolverText}>← Volver</Text>
      </TouchableOpacity>
    </View>
  );

  const ejercicios = leccion.ejercicios ?? [];
  const contenidos = leccion.contenidos ?? [];

  // ── Fase de contenido ─────────────────────────────────────
  if (fase === 'contenido') return (
    <View style={styles.flex}>
      <StatusBar backgroundColor={COLORS.azul} barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitulo} numberOfLines={1}>{leccion.titulo ?? titulo}</Text>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{leccion.xp_base} XP</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16 }}>
        {contenidos.map((bloque) => (
          <View key={bloque.id_bloque} style={styles.bloqueContenido}>
            {bloque.tipo_bloque === 'texto' && (
              <Text style={styles.bloqueTexto}>{bloque.contenido}</Text>
            )}
            {bloque.tipo_bloque === 'imagen' && (
              <Image source={{ uri: bloque.contenido }} style={styles.imagen} resizeMode="contain" />
            )}
            {(bloque.tipo_bloque === 'video' || bloque.tipo_bloque === 'animacion') && (
              <TouchableOpacity style={styles.enlace} onPress={() => Linking.openURL(bloque.contenido).catch(() => {})}>
                <Text style={styles.enlaceText}>
                  {bloque.tipo_bloque === 'video' ? '▶️ Ver video' : '✨ Ver animación'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {contenidos.length === 0 && (
          <Text style={{ color: COLORS.muted, textAlign: 'center', marginTop: 40 }}>
            Esta lección no tiene contenido teórico.
          </Text>
        )}
        {!!error && <Text style={styles.errorText}>{error}</Text>}
        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.footer}>
        {ejercicios.length > 0 ? (
          <TouchableOpacity style={styles.btnPrimario} onPress={() => setFase('ejercicios')}>
            <Text style={styles.btnPrimarioText}>Ir a los ejercicios →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btnPrimario, guardando && styles.btnDisabled]}
            disabled={guardando}
            onPress={() => finalizar(100)}
          >
            {guardando
              ? <ActivityIndicator color={COLORS.blanco} />
              : <Text style={styles.btnPrimarioText}>Completar lección ✓</Text>}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // ── Fase de ejercicios ────────────────────────────────────
  const ejercicio = ejercicios[ejIdx];
  const totalEj   = ejercicios.length;
  const opciones  = ejercicio.tipo_interaccion === 'seleccion_multiple' ? extraerOpciones(ejercicio.enunciado) : [];
  const maxPistas = ejercicio.pistas?.length ?? 0;

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

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(ejIdx / totalEj) * 100}%` }]} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        <View style={styles.enunciadoBox}>
          <Text style={styles.enunciadoLabel}>Pregunta</Text>
          <Text style={styles.enunciadoText}>{ejercicio.enunciado}</Text>
        </View>

        {pistas.map((p, i) => (
          <View key={i} style={styles.pistaBox}>
            <Text style={styles.pistaText}>💡 Pista {i + 1}: {p}</Text>
          </View>
        ))}

        {opciones.map((op) => (
          <TouchableOpacity
            key={op}
            style={[styles.opcion, respuesta === op && styles.opcionSel]}
            onPress={() => setRespuesta(op)}
          >
            <Text style={styles.opcionText}>{op}</Text>
          </TouchableOpacity>
        ))}

        <TextInput
          style={[styles.inputRespuesta, { marginTop: 12 }]}
          placeholder="Escribe tu respuesta aquí..."
          placeholderTextColor={COLORS.muted_light}
          value={respuesta}
          onChangeText={setRespuesta}
          multiline
        />

        {pistas.length < Math.min(maxPistas, 2) && (
          <TouchableOpacity style={styles.btnPista} onPress={pedirPista}>
            <Text style={styles.btnPistaText}>💡 Ver pista {pistas.length + 1}</Text>
          </TouchableOpacity>
        )}
        {!!error && <Text style={styles.errorText}>{error}</Text>}
        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btnPrimario, (!respuesta.trim() || enviando) && styles.btnDisabled]}
          onPress={() => { setError(''); enviarRespuesta(); }}
          disabled={!respuesta.trim() || enviando}
        >
          {enviando
            ? <ActivityIndicator color={COLORS.blanco} />
            : <Text style={styles.btnPrimarioText}>Verificar respuesta</Text>}
        </TouchableOpacity>
      </View>

      <FeedbackModal
        visible={!!resultado}
        correcto={!!resultado?.correcto}
        explicacion={resultado?.explicacion}
        respuestaCorrecta={resultado?.respuesta_correcta}
        textoBoton={ejIdx + 1 >= totalEj ? 'Finalizar lección ✓' : 'Siguiente ejercicio →'}
        onContinuar={siguienteEjercicio}
      />
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

  opcion: { backgroundColor: COLORS.superficie, borderRadius: 10, borderWidth: 1, borderColor: COLORS.borde, padding: 12, marginTop: 8 },
  opcionSel: { borderColor: COLORS.azul, backgroundColor: COLORS.azul_light },
  opcionText: { fontSize: 14, color: COLORS.texto },
  imagen: { width: '100%', height: 200, borderRadius: 10, backgroundColor: COLORS.borde },
  enlace: { backgroundColor: COLORS.azul_light, borderRadius: 10, padding: 12 },
  enlaceText: { color: COLORS.azul, fontWeight: '700', fontSize: 14 },
});
