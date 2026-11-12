// src/screens/NotificacionesScreen.js — EduDer
// RF-16 | Bandeja de notificaciones (logros, racha, sistema): marcar una o todas como leídas.
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import ErrorBanner from '../components/ErrorBanner';
import { COLORS } from '../theme/colors';

const ICONO = { logro: '🏅', racha: '🔥', sistema: '🔔' };

export default function NotificacionesScreen({ onCambio }) {
  const [items, setItems] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async (esRefresh = false) => {
    esRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const res = await api.get('/notifications');
      setItems(res.data.items ?? []);
      setNoLeidas(res.data.no_leidas ?? 0);
      onCambio?.(res.data.no_leidas ?? 0);
    } catch {
      setError('No se pudieron cargar las notificaciones.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onCambio]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  async function marcar(n) {
    if (n.leida) return;
    try {
      await api.patch(`/notifications/${n.id_notificacion}/read`);
      setItems(prev => prev.map(x => (x.id_notificacion === n.id_notificacion ? { ...x, leida: true } : x)));
      setNoLeidas(c => { onCambio?.(Math.max(c - 1, 0)); return Math.max(c - 1, 0); });
    } catch { setError('No se pudo marcar como leída.'); }
  }

  async function marcarTodas() {
    try {
      await api.patch('/notifications/read-all');
      setItems(prev => prev.map(x => ({ ...x, leida: true })));
      setNoLeidas(0);
      onCambio?.(0);
    } catch { setError('No se pudieron marcar como leídas.'); }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.rojo} /></View>;

  return (
    <View style={styles.flex}>
      <StatusBar backgroundColor={COLORS.rojo} barStyle="light-content" />
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>Notificaciones</Text>
          <Text style={styles.sub}>{noLeidas} sin leer</Text>
        </View>
        {noLeidas > 0 && (
          <TouchableOpacity onPress={marcarTodas}><Text style={styles.todas}>Marcar todas</Text></TouchableOpacity>
        )}
      </View>
      <FlatList
        data={items}
        keyExtractor={(n) => n.id_notificacion}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => cargar(true)} colors={[COLORS.rojo]} />}
        ListHeaderComponent={<ErrorBanner mensaje={error} />}
        ListEmptyComponent={!error && <Text style={styles.vacio}>No tienes notificaciones.</Text>}
        renderItem={({ item: n }) => (
          <TouchableOpacity style={[styles.item, !n.leida && styles.noLeida]} onPress={() => marcar(n)} activeOpacity={0.8}>
            <Text style={styles.icono}>{ICONO[n.tipo] ?? '🔔'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.msg, !n.leida && { fontWeight: '700' }]}>{n.mensaje}</Text>
              <Text style={styles.fecha}>{new Date(n.fecha_envio).toLocaleString('es-CO')}</Text>
            </View>
            {!n.leida && <View style={styles.punto} />}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.rojo, paddingTop: 48, paddingBottom: 18, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'flex-end' },
  titulo: { color: COLORS.blanco, fontSize: 26, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  todas: { color: COLORS.blanco, fontWeight: '700', fontSize: 13 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.superficie, borderRadius: 12, padding: 14, marginBottom: 10, gap: 12 },
  noLeida: { borderLeftWidth: 4, borderLeftColor: COLORS.rojo },
  icono: { fontSize: 24 },
  msg: { fontSize: 14, color: COLORS.texto },
  fecha: { fontSize: 11, color: COLORS.muted, marginTop: 3 },
  punto: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.rojo },
  vacio: { textAlign: 'center', color: COLORS.muted, marginTop: 40 },
});
