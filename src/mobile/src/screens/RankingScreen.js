// src/screens/RankingScreen.js — EduDer
// CU-04 | RF-17 | E12 - obtenerTop() / actualizar()
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import api from '../services/api';
import { COLORS } from '../theme/colors';

export default function RankingScreen() {
  const [niveles,    setNiveles]    = useState([]);
  const [nivelSel,   setNivelSel]   = useState(null);
  const [ranking,    setRanking]    = useState([]);
  const [semana,     setSemana]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar niveles disponibles para el selector de tabs
  useEffect(() => {
    api.get('/levels')
      .then(res => {
        const activos = res.data.filter(n => n.estado === 'activo');
        setNiveles(activos);
        if (activos.length) setNivelSel(activos[0].id_nivel);
      })
      .catch(() => {});
  }, []);

  // RF-17: cargar ranking semanal cuando cambia el nivel seleccionado
  const cargarRanking = useCallback(async (esRefresh = false) => {
    if (!nivelSel) return;
    esRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const res = await api.get(`/gamification/ranking/${nivelSel}`);
      setRanking(res.data.ranking ?? []);
      setSemana(res.data.semana_inicio ?? '');
    } catch {
      setRanking([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [nivelSel]);

  useEffect(() => { cargarRanking(); }, [cargarRanking]);

  const medalla = (pos) => pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : null;

  return (
    <View style={styles.flex}>
      <StatusBar backgroundColor={COLORS.azul} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ranking semanal</Text>
        {semana && <Text style={styles.headerSub}>Semana del {semana}</Text>}
      </View>

      {/* Tabs de niveles */}
      {niveles.length > 0 && (
        <View style={styles.tabs}>
          <FlatList
            data={niveles}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={n => String(n.id_nivel)}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.tab, nivelSel === item.id_nivel && styles.tabActivo]}
                onPress={() => setNivelSel(item.id_nivel)}
              >
                <Text style={[styles.tabText, nivelSel === item.id_nivel && styles.tabTextActivo]}>
                  {item.nombre}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Lista */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.rojo} />
        </View>
      ) : (
        <FlatList
          data={ranking}
          keyExtractor={(_, i) => String(i)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => cargarRanking(true)} colors={[COLORS.rojo]} />
          }
          contentContainerStyle={{ padding: 16, gap: 8 }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ fontSize: 36 }}>🏆</Text>
              <Text style={{ color: COLORS.muted, marginTop: 10 }}>
                Aún no hay participantes esta semana.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[
              styles.rankItem,
              item.es_yo && styles.rankItemYo,
              item.posicion <= 3 && styles.rankItemTop,
            ]}>
              {/* Posición */}
              <View style={[styles.posBox, item.posicion <= 3 && styles.posBoxTop]}>
                {medalla(item.posicion)
                  ? <Text style={{ fontSize: 20 }}>{medalla(item.posicion)}</Text>
                  : <Text style={styles.posText}>{item.posicion}</Text>
                }
              </View>

              {/* Avatar */}
              <View style={[styles.rankAvatar, item.es_yo && { backgroundColor: COLORS.rojo }]}>
                <Text style={styles.rankAvatarText}>
                  {(item.nombre ?? 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </Text>
              </View>

              {/* Nombre */}
              <View style={styles.rankInfo}>
                <Text style={styles.rankNombre}>
                  {item.nombre}{item.es_yo ? ' (Tú)' : ''}
                </Text>
              </View>

              {/* XP */}
              <View style={styles.rankXPBox}>
                <Text style={styles.rankXP}>{item.xp_semana}</Text>
                <Text style={styles.rankXPLabel}>XP</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex:   { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 },

  header: {
    backgroundColor: COLORS.azul,
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: { color: COLORS.blanco, fontSize: 22, fontWeight: '800' },
  headerSub:   { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 4 },

  tabs: { backgroundColor: COLORS.superficie, borderBottomWidth: 1, borderBottomColor: COLORS.borde },
  tab: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: COLORS.bg,
    borderWidth: 1, borderColor: COLORS.borde,
  },
  tabActivo:     { backgroundColor: COLORS.azul, borderColor: COLORS.azul },
  tabText:       { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  tabTextActivo: { color: COLORS.blanco },

  rankItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.superficie,
    borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: COLORS.borde,
  },
  rankItemYo: {
    borderColor: COLORS.rojo,
    backgroundColor: COLORS.rojo_light,
  },
  rankItemTop: {
    shadowColor: '#000', shadowOpacity: 0.06,
    shadowRadius: 6, elevation: 2,
  },

  posBox: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.borde,
  },
  posBoxTop:  { backgroundColor: COLORS.xp_light, borderColor: COLORS.xp },
  posText:    { fontSize: 13, fontWeight: '700', color: COLORS.muted },

  rankAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.azul,
    justifyContent: 'center', alignItems: 'center',
  },
  rankAvatarText: { color: COLORS.blanco, fontSize: 13, fontWeight: '700' },
  rankInfo:       { flex: 1 },
  rankNombre:     { fontSize: 14, fontWeight: '600', color: COLORS.texto },

  rankXPBox:  { alignItems: 'flex-end' },
  rankXP:     { fontSize: 16, fontWeight: '800', color: COLORS.azul },
  rankXPLabel:{ fontSize: 10, color: COLORS.muted },
});
