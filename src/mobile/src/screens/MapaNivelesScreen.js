// src/screens/MapaNivelesScreen.js — EduDer
// CU-03 | RF-07, RF-08 | Camino visual de niveles: bloqueado / disponible / completado.
import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import { useProgresoNiveles } from '../hooks/useProgresoNiveles';
import ErrorBanner from '../components/ErrorBanner';
import { COLORS } from '../theme/colors';

export default function MapaNivelesScreen({ navigation }) {
  const { niveles, resumen, loading, refreshing, error, cargar } = useProgresoNiveles();

  // Recargar cada vez que la pantalla vuelve a tener foco (tras completar una lección)
  useEffect(() => {
    cargar();
    const unsub = navigation.addListener('focus', () => cargar(true));
    return unsub;
  }, [cargar, navigation]);

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color={COLORS.rojo} /></View>
  );

  return (
    <View style={styles.flex}>
      <StatusBar backgroundColor={COLORS.azul} barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.titulo}>Mapa de niveles</Text>
        <Text style={styles.xp}>⚡ {resumen?.xp_total ?? 0}</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => cargar(true)} colors={[COLORS.rojo]} />}
      >
        {!!error && <ErrorBanner mensaje={error} />}
        {niveles.map((n, idx) => {
          const color = !n.desbloqueado ? COLORS.muted_light : n.aprobado ? COLORS.success : COLORS.azul;
          const pct = n.total ? Math.round((n.completadas / n.total) * 100) : 0;
          return (
            <View key={n.id_nivel} style={styles.fila}>
              <View style={styles.camino}>
                <View style={[styles.nodo, { backgroundColor: color }]}>
                  <Text style={styles.nodoText}>{!n.desbloqueado ? '🔒' : n.aprobado ? '✓' : n.orden}</Text>
                </View>
                {idx < niveles.length - 1 && <View style={[styles.linea, { backgroundColor: n.aprobado ? COLORS.success : COLORS.borde }]} />}
              </View>
              <TouchableOpacity
                style={[styles.card, !n.desbloqueado && styles.cardBloq]}
                disabled={!n.desbloqueado}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ListaLecciones', { nivel: n })}
              >
                <Text style={styles.cardTitulo}>{n.nombre}</Text>
                {!!n.descripcion && <Text style={styles.cardDesc} numberOfLines={2}>{n.descripcion}</Text>}
                <View style={styles.barra}><View style={[styles.barraFill, { width: `${pct}%`, backgroundColor: color }]} /></View>
                <Text style={styles.cardMeta}>
                  {n.completadas}/{n.total} lecciones · aprobación {n.umbral_aprobacion}%
                  {!n.desbloqueado ? ' · Completa el nivel anterior' : ''}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
        {niveles.length === 0 && !error && <Text style={styles.vacio}>No hay niveles disponibles aún.</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.azul, paddingTop: 44, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  back: { color: COLORS.blanco, fontSize: 22, fontWeight: '700', paddingRight: 10 },
  titulo: { flex: 1, color: COLORS.blanco, fontSize: 17, fontWeight: '700' },
  xp: { color: COLORS.blanco, fontWeight: '700' },
  scroll: { padding: 16 },
  fila: { flexDirection: 'row' },
  camino: { width: 44, alignItems: 'center' },
  nodo: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  nodoText: { color: COLORS.blanco, fontWeight: '800' },
  linea: { width: 4, flex: 1, minHeight: 24, borderRadius: 2 },
  card: { flex: 1, backgroundColor: COLORS.superficie, borderRadius: 14, padding: 14, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  cardBloq: { opacity: 0.55 },
  cardTitulo: { fontSize: 16, fontWeight: '700', color: COLORS.texto },
  cardDesc: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  barra: { height: 6, borderRadius: 3, backgroundColor: COLORS.borde, marginTop: 10 },
  barraFill: { height: 6, borderRadius: 3 },
  cardMeta: { fontSize: 11, color: COLORS.muted, marginTop: 6 },
  vacio: { textAlign: 'center', color: COLORS.muted, marginTop: 40 },
});
