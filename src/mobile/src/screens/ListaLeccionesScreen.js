// src/screens/ListaLeccionesScreen.js — EduDer
// CU-03 | RF-08 | Lecciones de un nivel con su estado (completada / disponible / bloqueada) y tipo.
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { COLORS } from '../theme/colors';
import { ICONO_TIPO, NOMBRE_TIPO } from '../utils/progreso';

export default function ListaLeccionesScreen({ route, navigation }) {
  const { nivel } = route.params;
  const lecciones = nivel.lecciones ?? [];

  function abrir(l) {
    if (l.estado_ui === 'bloqueada') return;
    navigation.navigate('Lesson', { id_leccion: l.id_leccion, titulo: l.titulo });
  }

  return (
    <View style={styles.flex}>
      <StatusBar backgroundColor={COLORS.azul} barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.sub}>Nivel {nivel.orden}</Text>
          <Text style={styles.titulo} numberOfLines={1}>{nivel.nombre}</Text>
        </View>
      </View>
      <FlatList
        data={lecciones}
        keyExtractor={(l) => l.id_leccion}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.vacio}>Este nivel aún no tiene lecciones.</Text>}
        renderItem={({ item: l }) => {
          const bloq = l.estado_ui === 'bloqueada';
          const hecha = l.estado_ui === 'completada';
          return (
            <TouchableOpacity style={[styles.item, bloq && { opacity: 0.5 }]} disabled={bloq} onPress={() => abrir(l)} activeOpacity={0.8}>
              <View style={styles.icono}><Text style={{ fontSize: 18 }}>{bloq ? '🔒' : ICONO_TIPO[l.tipo] ?? '📘'}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nombre}>{l.titulo}</Text>
                <Text style={styles.meta}>
                  {NOMBRE_TIPO[l.tipo] ?? l.tipo} · +{l.xp_base} XP{hecha && l.puntaje != null ? ` · mejor puntaje ${l.puntaje}%` : ''}
                </Text>
              </View>
              <Text style={[styles.estado, hecha && { color: COLORS.success }]}>{hecha ? '✓' : bloq ? '' : '›'}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.azul, paddingTop: 44, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  back: { color: COLORS.blanco, fontSize: 22, fontWeight: '700', paddingRight: 12 },
  sub: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  titulo: { color: COLORS.blanco, fontSize: 18, fontWeight: '700' },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.superficie, borderRadius: 12, padding: 12, marginBottom: 10, gap: 12 },
  icono: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.azul_light, justifyContent: 'center', alignItems: 'center' },
  nombre: { fontSize: 15, fontWeight: '600', color: COLORS.texto },
  meta: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  estado: { fontSize: 20, color: COLORS.muted },
  vacio: { textAlign: 'center', color: COLORS.muted, marginTop: 40 },
});
