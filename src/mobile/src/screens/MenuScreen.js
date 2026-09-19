// src/screens/MenuScreen.js — EduDer
// CU-03 | RF-07, RF-08 | E12 - obtenerLecciones() / estaDesbloqueado()
// Pantalla principal: lista de niveles con progreso del estudiante.
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { COLORS } from '../theme/colors';

export default function MenuScreen({ navigation }) {
  const [niveles,    setNiveles]    = useState([]);
  const [perfil,     setPerfil]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState('');

  // RF-07: cargar niveles activos con sus lecciones al montar la pantalla
  const cargar = useCallback(async (esRefresh = false) => {
    esRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const [nivelesRes, perfilRes] = await Promise.all([
        api.get('/levels'),
        api.get('/profile').catch(() => ({ data: null })),
      ]);
      setNiveles(nivelesRes.data);
      setPerfil(perfilRes.data?.perfil ?? null);
    } catch {
      setError('No se pudieron cargar los niveles. Verifica tu conexión.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function cerrarSesion() {
    await AsyncStorage.removeItem('eduder_token');
    await AsyncStorage.removeItem('eduder_user');
    navigation.replace('Login');
  }

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={COLORS.rojo} />
      <Text style={styles.loadingText}>Cargando niveles...</Text>
    </View>
  );

  return (
    <View style={styles.flex}>
      <StatusBar backgroundColor={COLORS.rojo} barStyle="light-content" />

      {/* ── Header ───────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>¡Bienvenido a</Text>
          <Text style={styles.headerTitle}>EduDer</Text>
        </View>
        {/* Indicador de XP y streak */}
        {perfil && (
          <View style={styles.headerStats}>
            <View style={styles.statChip}>
              <Text style={styles.statEmoji}>⚡</Text>
              <Text style={styles.statVal}>{perfil.xp_total ?? 0}</Text>
              <Text style={styles.statLbl}>XP</Text>
            </View>
            <View style={[styles.statChip, { marginLeft: 8 }]}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statVal}>{perfil.streak_dias ?? 0}</Text>
              <Text style={styles.statLbl}>días</Text>
            </View>
          </View>
        )}
      </View>

      {/* ── Cuerpo ───────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => cargar(true)} colors={[COLORS.rojo]} />}
      >
        {error !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️  {error}</Text>
          </View>
        )}

        <Text style={styles.seccion}>Camino de aprendizaje</Text>

        {niveles.map((nivel, idx) => (
          <NivelCard
            key={nivel.id_nivel}
            nivel={nivel}
            index={idx}
            navigation={navigation}
          />
        ))}

        {niveles.length === 0 && !error && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyText}>No hay niveles disponibles aún.</Text>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

// ── Tarjeta de nivel ─────────────────────────────────────────────────────────
// RF-07: muestra el nivel con sus lecciones. RF-08: al tocar una lección navega a LessonScreen.
function NivelCard({ nivel, index, navigation }) {
  const [abierto, setAbierto] = useState(index === 0);
  const lecciones = nivel.lecciones ?? [];

  return (
    <View style={styles.card}>
      {/* Encabezado del nivel */}
      <TouchableOpacity style={styles.cardHeader} onPress={() => setAbierto(v => !v)} activeOpacity={0.8}>
        <View style={styles.nivelNumero}>
          <Text style={styles.nivelNumeroText}>{nivel.orden}</Text>
        </View>
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.cardTitle}>{nivel.nombre}</Text>
          <Text style={styles.cardSub}>{lecciones.length} lección{lecciones.length !== 1 ? 'es' : ''}</Text>
        </View>
        <Text style={styles.chevron}>{abierto ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Lista de lecciones */}
      {abierto && (
        <View style={styles.leccionesContainer}>
          {lecciones.length === 0 ? (
            <Text style={styles.sinLecciones}>Sin lecciones en este nivel.</Text>
          ) : (
            lecciones.map((lec, i) => (
              <TouchableOpacity
                key={lec.id_leccion}
                style={styles.leccionItem}
                onPress={() => navigation.navigate('Lesson', { id_leccion: lec.id_leccion, titulo: lec.titulo })}
                activeOpacity={0.75}
              >
                <View style={styles.leccionIcono}>
                  <Text style={styles.leccionIconoText}>
                    {lec.tipo === 'teoria' ? '📖' : lec.tipo === 'ejercicio' ? '✏️' : '🎮'}
                  </Text>
                </View>
                <View style={styles.leccionInfo}>
                  <Text style={styles.leccionTitulo}>{lec.titulo}</Text>
                  <Text style={styles.leccionXP}>+{lec.xp_base} XP</Text>
                </View>
                <Text style={styles.leccionFlecha}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  flex:   { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  loadingText: { marginTop: 12, color: COLORS.muted, fontSize: 14 },

  // Header degradado rojo → azul
  header: {
    backgroundColor: COLORS.rojo,
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerSub:   { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  headerTitle: { color: COLORS.blanco, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  headerStats: { flexDirection: 'row' },
  statChip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  statEmoji: { fontSize: 14 },
  statVal:   { color: COLORS.blanco, fontWeight: '700', fontSize: 14 },
  statLbl:   { color: 'rgba(255,255,255,0.75)', fontSize: 11 },

  // Scroll
  scroll:        { flex: 1 },
  scrollContent: { padding: 16 },
  seccion:       { fontSize: 13, fontWeight: '700', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12, marginLeft: 4 },

  // Error
  errorBox: {
    backgroundColor: COLORS.danger_light,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger,
  },
  errorText: { color: COLORS.danger, fontSize: 13 },

  // Card de nivel
  card: {
    backgroundColor: COLORS.superficie,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  nivelNumero: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.azul,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nivelNumeroText: { color: COLORS.blanco, fontWeight: '800', fontSize: 15 },
  cardHeaderInfo:  { flex: 1 },
  cardTitle:       { fontSize: 15, fontWeight: '700', color: COLORS.texto },
  cardSub:         { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  chevron:         { color: COLORS.muted, fontSize: 14 },

  // Lecciones
  leccionesContainer: { borderTopWidth: 1, borderTopColor: COLORS.borde },
  sinLecciones:       { padding: 14, color: COLORS.muted, fontSize: 13, textAlign: 'center' },
  leccionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borde,
    gap: 10,
  },
  leccionIcono: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.azul_light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leccionIconoText: { fontSize: 16 },
  leccionInfo:     { flex: 1 },
  leccionTitulo:   { fontSize: 14, fontWeight: '600', color: COLORS.texto },
  leccionXP:       { fontSize: 11, color: COLORS.xp, fontWeight: '600', marginTop: 2 },
  leccionFlecha:   { fontSize: 20, color: COLORS.muted },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon:  { fontSize: 40, marginBottom: 10 },
  emptyText:  { color: COLORS.muted, fontSize: 15 },
});
