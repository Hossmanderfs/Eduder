// src/screens/PerfilScreen.js — EduDer
// CU-04 | RF-18 | E12 - obtenerResumen(): PerfilDTO
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { COLORS } from '../theme/colors';

export default function PerfilScreen({ navigation }) {
  const [perfil,     setPerfil]     = useState(null);
  const [medallas,   setMedallas]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usuario,    setUsuario]    = useState(null);

  // RF-18: cargar perfil completo del estudiante autenticado
  const cargar = useCallback(async (esRefresh = false) => {
    esRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const stored = await AsyncStorage.getItem('eduder_user');
      if (stored) setUsuario(JSON.parse(stored));

      const [perfilRes, medallasRes] = await Promise.all([
        api.get('/profile'),
        api.get('/gamification/medals').catch(() => ({ data: [] })),
      ]);
      setPerfil(perfilRes.data?.perfil ?? null);
      setMedallas(medallasRes.data ?? []);
    } catch {
      // Mostrar datos del cache si falla la red
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
    </View>
  );

  const medallasObtenidas = medallas.filter(m => m.obtenida);
  const medallasPendientes = medallas.filter(m => !m.obtenida).slice(0, 3);
  const iniciales = usuario
    ? ((usuario.nombre?.[0] ?? '') + (usuario.apellido?.[0] ?? '')).toUpperCase()
    : 'U';

  return (
    <View style={styles.flex}>
      <StatusBar backgroundColor={COLORS.azul} barStyle="light-content" />

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => cargar(true)} colors={[COLORS.rojo]} />}
      >
        {/* ── Header de perfil ────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{iniciales}</Text>
          </View>
          <Text style={styles.nombre}>
            {usuario?.nombre ?? ''} {usuario?.apellido ?? ''}
          </Text>
          <Text style={styles.correo}>{usuario?.correo_institucional ?? ''}</Text>
        </View>

        {/* ── Estadísticas ─────────────────────────────── */}
        <View style={styles.statsRow}>
          <StatBox label="XP Total"   valor={perfil?.xp_total ?? 0}    emoji="⚡" color={COLORS.xp} />
          <StatBox label="Racha"      valor={`${perfil?.streak_dias ?? 0}d`} emoji="🔥" color={COLORS.rojo} />
          <StatBox label="Medallas"   valor={medallasObtenidas.length}  emoji="🏅" color={COLORS.azul} />
        </View>

        {/* ── Barra de XP semanal ──────────────────────── */}
        {perfil?.xp_semana_actual !== undefined && (
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>XP esta semana</Text>
            <View style={styles.xpBarContainer}>
              <View style={styles.xpBarBg}>
                <View style={[styles.xpBarFill, {
                  width: `${Math.min((perfil.xp_semana_actual / 500) * 100, 100)}%`
                }]} />
              </View>
              <Text style={styles.xpBarLabel}>{perfil.xp_semana_actual} / 500 XP</Text>
            </View>
          </View>
        )}

        {/* ── Medallas obtenidas ───────────────────────── */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Mis medallas ({medallasObtenidas.length})</Text>
          {medallasObtenidas.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🎯</Text>
              <Text style={styles.emptyText}>¡Completa lecciones para ganar medallas!</Text>
            </View>
          ) : (
            <View style={styles.medallasGrid}>
              {medallasObtenidas.map(m => (
                <View key={m.id_medalla} style={styles.medallaChip}>
                  <Text style={styles.medallaCicle}>{m.icono ?? '🏅'}</Text>
                  <Text style={styles.medallaNombre}>{m.nombre}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── Próximas medallas ────────────────────────── */}
        {medallasPendientes.length > 0 && (
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>Próximas medallas</Text>
            {medallasPendientes.map(m => (
              <View key={m.id_medalla} style={styles.pendienteItem}>
                <Text style={styles.pendienteIcono}>🔒</Text>
                <View style={styles.pendienteInfo}>
                  <Text style={styles.pendienteNombre}>{m.nombre}</Text>
                  <Text style={styles.pendienteMeta}>
                    {m.condicion_tipo === 'xp_acumulado'
                      ? `Alcanza ${m.condicion_valor} XP`
                      : `${m.condicion_valor} días de racha`}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Botón cerrar sesión ──────────────────────── */}
        <View style={{ padding: 20 }}>
          <TouchableOpacity style={styles.btnLogout} onPress={cerrarSesion}>
            <Text style={styles.btnLogoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function StatBox({ label, valor, emoji, color }) {
  return (
    <View style={[styles.statBox, { borderTopColor: color, borderTopWidth: 3 }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValor, { color }]}>{valor}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex:   { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    backgroundColor: COLORS.azul,
    paddingTop: 50,
    paddingBottom: 32,
    alignItems: 'center',
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.rojo,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { color: COLORS.blanco, fontSize: 26, fontWeight: '800' },
  nombre:     { color: COLORS.blanco, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  correo:     { color: 'rgba(255,255,255,0.7)', fontSize: 12 },

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: -20,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.superficie,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  statEmoji: { fontSize: 20, marginBottom: 4 },
  statValor: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, color: COLORS.muted, marginTop: 2 },

  seccion: { marginHorizontal: 16, marginTop: 20 },
  seccionTitulo: {
    fontSize: 13, fontWeight: '700', color: COLORS.muted,
    textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10,
  },

  xpBarContainer: { gap: 6 },
  xpBarBg: {
    height: 10, backgroundColor: COLORS.borde,
    borderRadius: 5, overflow: 'hidden',
  },
  xpBarFill: {
    height: 10, backgroundColor: COLORS.xp, borderRadius: 5,
  },
  xpBarLabel: { fontSize: 12, color: COLORS.muted, textAlign: 'right' },

  medallasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  medallaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.azul_light,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  medallaCicle:  { fontSize: 16 },
  medallaNombre: { fontSize: 12, fontWeight: '600', color: COLORS.azul },

  pendienteItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.superficie, borderRadius: 12,
    padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.borde,
  },
  pendienteIcono:  { fontSize: 22 },
  pendienteInfo:   { flex: 1 },
  pendienteNombre: { fontSize: 14, fontWeight: '600', color: COLORS.texto },
  pendienteMeta:   { fontSize: 12, color: COLORS.muted, marginTop: 2 },

  emptyCard: {
    backgroundColor: COLORS.superficie, borderRadius: 12,
    padding: 24, alignItems: 'center', borderWidth: 1, borderColor: COLORS.borde,
  },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { color: COLORS.muted, fontSize: 14, textAlign: 'center' },

  btnLogout: {
    backgroundColor: COLORS.rojo_light,
    borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1,
    borderColor: '#FECACA',
  },
  btnLogoutText: { color: COLORS.rojo, fontSize: 15, fontWeight: '700' },
});
