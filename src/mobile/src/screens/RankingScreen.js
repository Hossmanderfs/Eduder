// src/screens/RankingScreen.js — WF-12 · Ranking semanal · RF-17 | GET /gamification/ranking/:nivel
import React, { useEffect, useState, useCallback } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import api from '../services/api';
import { useDashboard } from '../hooks/useDashboard';
import { num, mensajeError } from '../utils/formato';
import { Screen, AppBar, Txt, Avatar, Banner, Empty, Loading, ErrorState, Icon, Row } from '../ui';
import { useTheme, RADIUS } from '../theme';

// Cuenta regresiva al próximo lunes 00:00 (reinicio del ranking, RF-17)
function cuentaRegresiva() {
  const ahora = new Date();
  const prox = new Date(ahora);
  prox.setHours(0, 0, 0, 0);
  prox.setDate(prox.getDate() + ((8 - ahora.getDay()) % 7 || 7));
  const s = Math.max(0, Math.floor((prox - ahora) / 1000));
  const d = Math.floor(s / 86400); const h = Math.floor((s % 86400) / 3600); const m = Math.floor((s % 3600) / 60);
  return `${d ? `${d} d ` : ''}${h} h ${m} min`;
}

export default function RankingScreen({ navigation }) {
  const { c } = useTheme();
  const { data } = useDashboard();
  const [nivel, setNivel] = useState(null);
  const [filas, setFilas] = useState(null);
  const [error, setError] = useState('');
  const [cd, setCd] = useState(cuentaRegresiva());
  const niveles = data?.state.niveles || [];

  useEffect(() => { if (data && !nivel) setNivel(data.state.nivel_actual ? data.state.niveles[data.state.nivel_actual - 1]?.id_nivel : null); }, [data, nivel]);
  useEffect(() => { const t = setInterval(() => setCd(cuentaRegresiva()), 30000); return () => clearInterval(t); }, []);

  const cargar = useCallback(async () => {
    if (!nivel) return;
    setFilas(null); setError('');
    try { const { data: r } = await api.get(`/gamification/ranking/${nivel}`); setFilas(r.ranking || []); }
    catch (err) { setError(mensajeError(err, 'No se pudo cargar el ranking.')); }
  }, [nivel]);
  useEffect(() => { cargar(); }, [cargar]);

  const nv = niveles.find((n) => n.id_nivel === nivel);
  const top = (filas || []).filter((r) => r.posicion <= 3);
  const resto = (filas || []).filter((r) => r.posicion > 3);
  const yo = (filas || []).find((r) => r.es_yo);
  const abrir = (r) => { if (!r.es_yo) navigation.navigate('PerfilPublico', { fila: r, nivel: nv ? { orden: nv.orden, nombre: nv.nombre } : null, total: filas.length }); };

  const Podio = ({ pos }) => {
    const r = top.find((x) => x.posicion === pos);
    const alto = pos === 1 ? 92 : pos === 2 ? 68 : 52;
    if (!r) return <View style={{ flex: 1 }} />;
    const partes = r.nombre.split(' ');
    return (
      <Pressable onPress={() => abrir(r)} disabled={r.es_yo} style={{ flex: 1, alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
        <Avatar nombre={partes[0]} apellido={partes.slice(1).join(' ')} size={pos === 1 ? 56 : 46} neutral={!r.es_yo} style={r.es_yo ? { backgroundColor: c.blue } : undefined} />
        <Txt w="semibold" size={13} numberOfLines={1}>{r.es_yo ? 'Tú' : partes[0]}</Txt>
        <Txt size={12} color={c.text3}>{num(r.xp_semana)} XP</Txt>
        <View style={{ width: '100%', height: alto, borderTopLeftRadius: 10, borderTopRightRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: pos === 1 ? c.gold : r.es_yo ? c.blue : c.surface3 }}>
          {pos === 1 ? <Icon name="crown" size={22} color={c.onGold} /> : <Txt w="bold" size={18} color={r.es_yo ? c.onBlue : c.text2}>{pos}</Txt>}
        </View>
      </Pressable>
    );
  };

  return (
    <Screen bar={<AppBar title="Ranking semanal" />} onRefresh={cargar}>
      <View style={{ gap: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} accessibilityLabel="Elegir nivel">
          {niveles.map((n) => {
            const on = n.id_nivel === nivel;
            return (
              <Pressable key={n.id_nivel} onPress={() => setNivel(n.id_nivel)} accessibilityState={{ selected: on }}
                style={{ minHeight: 40, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 999, borderWidth: 1.5, borderColor: on ? c.blue : c.line, backgroundColor: on ? c.blue : c.surface }}>
                <Txt w="medium" size={13} color={on ? c.onBlue : c.text2}>Nivel {n.orden}</Txt>
              </Pressable>
            );
          })}
        </ScrollView>
        <Row style={{ gap: 6 }}>
          <Icon name="clock" size={16} color={c.text3} />
          <Txt size={12} color={c.text2}><Txt w="semibold" size={12}>Semana actual</Txt> · se reinicia el lunes en {cd}</Txt>
        </Row>
      </View>

      {error ? <ErrorState message={error} onRetry={cargar} /> : !filas ? <Loading text="Cargando ranking…" /> : !filas.length ? (
        <Empty icon="trophy" title="Aún no hay posiciones" text={`Nadie ha sumado XP en ${nv ? nv.nombre : 'este nivel'} esta semana. Completa una lección y sé el primero.`} />
      ) : (
        <>
          <Txt size={12} color={c.text3}>{nv?.nombre} · {filas.length} {filas.length === 1 ? 'estudiante' : 'estudiantes'}</Txt>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 4 }}>
            <Podio pos={2} /><Podio pos={1} /><Podio pos={3} />
          </View>
          {resto.length ? (
            <View style={{ gap: 6 }}>
              {resto.map((r) => {
                const partes = r.nombre.split(' ');
                return (
                  <Pressable key={r.id_usuario || r.posicion} onPress={() => abrir(r)} disabled={r.es_yo}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 56, padding: 10, borderRadius: RADIUS.m, backgroundColor: r.es_yo ? c.blueSoft : c.surface, borderWidth: 1, borderColor: r.es_yo ? c.blue : c.line }}>
                    <Txt w="semibold" style={{ width: 28, textAlign: 'center' }} color={c.text2}>{r.posicion}</Txt>
                    <Avatar nombre={partes[0]} apellido={partes.slice(1).join(' ')} size={36} neutral={!r.es_yo} style={r.es_yo ? { backgroundColor: c.blue } : undefined} />
                    <Txt w="medium" style={{ flex: 1 }} numberOfLines={1}>{r.es_yo ? 'Tú · ' : ''}{r.nombre}</Txt>
                    <Txt w="semibold">{num(r.xp_semana)} XP</Txt>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          {!yo ? <Banner tone="info">Completa una lección de este nivel para aparecer en el ranking.</Banner> : null}
        </>
      )}
    </Screen>
  );
}
