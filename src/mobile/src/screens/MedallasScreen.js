// src/screens/MedallasScreen.js — EduDer
// CU-04 | RF-14, RF-18 | Catálogo de medallas: obtenidas a color con fecha; pendientes en gris.
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import ErrorBanner from '../components/ErrorBanner';
import { COLORS } from '../theme/colors';

const CONDICION = {
  nivel_completado: (v) => `Completa ${v} nivel(es)`,
  puntaje_perfecto: (v) => `Saca 100% en ${v} lección(es)`,
  streak: (v) => `Racha de ${v} día(s)`,
  xp_acumulado: (v) => `Acumula ${v} XP`,
};

export default function MedallasScreen() {
  const [medallas, setMedallas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async (esRefresh = false) => {
    esRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const res = await api.get('/gamification/medals');
      setMedallas(res.data);
    } catch {
      setError('No se pudieron cargar las medallas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const obtenidas = medallas.filter(m => m.obtenida).length;
  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.rojo} /></View>;

  return (
    <View style={styles.flex}>
      <StatusBar backgroundColor={COLORS.rojo} barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.titulo}>Medallas</Text>
        <Text style={styles.sub}>{obtenidas} de {medallas.length} obtenidas</Text>
      </View>
      <FlatList
        data={medallas}
        keyExtractor={(m) => m.id_medalla}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => cargar(true)} colors={[COLORS.rojo]} />}
        ListHeaderComponent={<ErrorBanner mensaje={error} />}
        ListEmptyComponent={!error && <Text style={styles.vacio}>Aún no hay medallas en el catálogo.</Text>}
        renderItem={({ item: m }) => (
          <View style={[styles.card, !m.obtenida && styles.gris]}>
            <Text style={[styles.icono, !m.obtenida && { opacity: 0.35 }]}>{m.obtenida ? '🏅' : '🔒'}</Text>
            <Text style={styles.nombre}>{m.nombre}</Text>
            <Text style={styles.desc} numberOfLines={3}>{m.descripcion || CONDICION[m.condicion_tipo]?.(m.condicion_valor) || ''}</Text>
            <Text style={[styles.fecha, m.obtenida && { color: COLORS.success }]}>
              {m.obtenida ? `Obtenida ${new Date(m.fecha_obtencion).toLocaleDateString('es-CO')}` : CONDICION[m.condicion_tipo]?.(m.condicion_valor)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.rojo, paddingTop: 48, paddingBottom: 18, paddingHorizontal: 20 },
  titulo: { color: COLORS.blanco, fontSize: 26, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  card: { flex: 1, backgroundColor: COLORS.superficie, borderRadius: 14, padding: 14, alignItems: 'center' },
  gris: { backgroundColor: '#EEF0F3' },
  icono: { fontSize: 40, marginBottom: 6 },
  nombre: { fontWeight: '700', color: COLORS.texto, textAlign: 'center' },
  desc: { fontSize: 12, color: COLORS.muted, textAlign: 'center', marginTop: 4 },
  fecha: { fontSize: 11, color: COLORS.muted_light, marginTop: 8, textAlign: 'center' },
  vacio: { textAlign: 'center', color: COLORS.muted, marginTop: 40 },
});
