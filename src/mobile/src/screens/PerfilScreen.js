// src/screens/PerfilScreen.js — WF-03 · Perfil del estudiante · RF-18 | CU-04
// GET /profile/summary · GET /profile/progress · GET /gamification/medals
import React, { useEffect, useState, useCallback } from 'react';
import { View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { useDashboard } from '../hooks/useDashboard';
import { num, fecha } from '../utils/formato';
import { Screen, Carne, CarneTop, IconBtn, Avatar, Txt, Chip, Btn, Bar, Stat, SectionHead, ListRow, Icon, Loading, ErrorState, Row } from '../ui';
import { useTheme } from '../theme';

const ICONO_MEDALLA = { nivel_completado: 'shield-star', puntaje_perfecto: 'target', streak: 'flame', xp_acumulado: 'bolt' };

export default function PerfilScreen({ navigation }) {
  const { c, modo, alternar } = useTheme();
  const { data, error, cargando, recargar } = useDashboard();
  const [medallas, setMedallas] = useState([]);
  const nav = useNavigation();

  useEffect(() => {
    const cargar = () => api.get('/gamification/medals').then((r) => setMedallas(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    cargar();
    return nav.addListener('focus', cargar);
  }, [nav]);

  function cerrarSesion() {
    Alert.alert('¿Cerrar sesión?', undefined, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: async () => {
        await AsyncStorage.multiRemove(['eduder_token', 'eduder_user']);
        navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
      } },
    ]);
  }

  const u = data?.perfilData || {};
  const p = data?.perfil || {};
  const st = data?.state;
  const ganadas = medallas.filter((m) => m.obtenida);
  const preview = ganadas.concat(medallas.filter((m) => !m.obtenida)).slice(0, 4);

  const header = (
    <Carne top={
      <CarneTop titulo="Uniremington · Carné EduDer">
        <IconBtn name={modo === 'dark' ? 'sun' : 'moon'} color="#fff" size={22} label={modo === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} onPress={alternar} />
      </CarneTop>
    }>
      <Row style={{ gap: 14 }}>
        <Avatar nombre={u.nombre} apellido={u.apellido} size={64} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt w="semibold" size={18} color="#fff" numberOfLines={1}>{u.nombre ? `${u.nombre} ${u.apellido}` : 'Cargando…'}</Txt>
          <Txt size={13} color={c.onCarne2} numberOfLines={1}>{u.correo_institucional || ' '}</Txt>
          {st ? <View style={{ marginTop: 4 }}><Chip icon="shield-star" text={`Nivel ${st.nivel_actual} · ${st.niveles[st.nivel_actual - 1]?.nombre || ''}`} style={{ backgroundColor: 'rgba(255,255,255,.16)' }} tone="blue" /></View> : null}
        </View>
      </Row>
    </Carne>
  );

  return (
    <Screen header={header} onRefresh={recargar}>
      {cargando && !data ? <Loading /> : error && !data ? <ErrorState message={error} onRetry={recargar} /> : st ? (
        <>
          <Row style={{ gap: 10, alignItems: 'stretch' }}>
            <Stat icon="shield-star" value={`${st.nivel_actual} / ${st.niveles.length}`} label="Nivel actual" />
            <Stat icon="bolt" tone="gold" value={num(p.xp_total || 0)} label="XP total" />
            <Stat icon="flame" tone="gold" value={p.streak_dias || 0} label={(p.streak_dias || 0) === 1 ? 'Día de racha' : 'Días de racha'} />
          </Row>

          <View style={{ gap: 12 }}>
            <SectionHead title="Mi progreso" />
            <Txt size={12} color={c.text3} style={{ marginTop: -8 }}>{st.porcentaje_global}% del curso</Txt>
            {st.niveles.map((n) => {
              const bloq = n.estado === 'bloqueado';
              return (
                <View key={n.id_nivel} style={{ opacity: bloq ? 0.6 : 1, gap: 6 }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Txt size={13}>{bloq ? '🔒 ' : ''}Nivel {n.orden} · {n.nombre}</Txt>
                    <Txt size={13} color={c.text2}>{n.porcentaje}%</Txt>
                  </Row>
                  <Bar pct={n.porcentaje} height={8} tone={n.aprobado ? 'ok' : n.porcentaje ? 'gold' : 'blue'} />
                </View>
              );
            })}
          </View>

          <View style={{ gap: 10 }}>
            <SectionHead title="Mis medallas" action={`Ver todas (${ganadas.length}/${medallas.length})`} onAction={() => navigation.navigate('Medallas')} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {preview.map((m) => (
                <View key={m.id_medalla} style={{ width: '48%', padding: 12, borderRadius: 14, alignItems: 'center', gap: 4, backgroundColor: m.obtenida ? c.goldSoft : c.surface2, opacity: m.obtenida ? 1 : 0.7 }}>
                  <Icon name={m.obtenida ? (ICONO_MEDALLA[m.condicion_tipo] || 'award') : 'lock'} size={26} color={m.obtenida ? c.goldText : c.text3} />
                  <Txt w="semibold" size={13} style={{ textAlign: 'center' }}>{m.nombre}</Txt>
                  <Txt size={11} color={c.text3} style={{ textAlign: 'center' }} numberOfLines={2}>{m.obtenida ? `Obtenida ${fecha(m.fecha_obtencion)}` : m.descripcion || ''}</Txt>
                </View>
              ))}
            </View>
          </View>

          <Btn title="Ver historial de lecciones" icon="history" size="lg" onPress={() => navigation.navigate('Historial')} />
          <View style={{ gap: 10 }}>
            <ListRow icon="bell" title="Notificaciones" right={<Icon name="chevron-right" size={18} color={c.text3} />} onPress={() => navigation.navigate('Notificaciones')} />
            <ListRow icon="logout" iconTone="red" title="Cerrar sesión" onPress={cerrarSesion} />
          </View>
        </>
      ) : null}
    </Screen>
  );
}
