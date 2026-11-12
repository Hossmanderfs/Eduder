// src/screens/MenuScreen.js — WF-01 · Menú principal · RF-07, RF-09, RF-12, RF-13 | CU-03, CU-04
import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useDashboard } from '../hooks/useDashboard';
import { siguienteLeccion, TIPOS } from '../utils/progreso';
import { num, dias } from '../utils/formato';
import { Screen, Carne, CarneTop, IconBtn, Avatar, Txt, Btn, Bar, Stat, Card, SectionHead, Icon, Loading, ErrorState, Row } from '../ui';
import { useTheme } from '../theme';

export default function MenuScreen({ navigation }) {
  const { c } = useTheme();
  const { data, error, cargando, recargar } = useDashboard();

  const u = data?.perfilData || {};
  const p = data?.perfil || {};
  const st = data?.state;
  const sinLeer = (u.notificaciones || []).filter((n) => !n.leida).length;
  const nivel = st ? st.niveles[st.nivel_actual - 1] : null;
  const max = nivel ? nivel.lecciones.reduce((a, l) => a + l.xp_base, 0) : 0;
  const ganado = nivel ? nivel.lecciones.reduce((a, l) => a + (l.estado === 'completada' ? Math.round((l.xp_base * (l.puntaje || 0)) / 100) : 0), 0) : 0;
  const pct = max ? Math.min(100, Math.round((ganado / max) * 100)) : 0;
  const sig = st ? siguienteLeccion(st) : null;
  const tipo = sig ? TIPOS[sig.leccion.tipo] || TIPOS.ejercicio : null;

  const header = (
    <Carne top={
      <CarneTop titulo="Uniremington · EduDer">
        <View accessibilityLabel={`Racha de ${dias(p.streak_dias || 0)}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,.16)' }}>
          <Icon name="flame" size={18} color={c.gold} />
          <Txt w="semibold" size={14} color="#fff">{p.streak_dias || 0}</Txt>
        </View>
        <IconBtn name="bell" label={sinLeer ? `Notificaciones, ${sinLeer} sin leer` : 'Notificaciones'} color="#fff" size={22} badge={sinLeer ? (sinLeer > 9 ? '9+' : String(sinLeer)) : undefined} onPress={() => navigation.navigate('Notificaciones')} />
      </CarneTop>
    }>
      <Row style={{ gap: 12 }}>
        <Avatar nombre={u.nombre} apellido={u.apellido} size={52} />
        <View style={{ flex: 1 }}>
          <Txt w="semibold" size={18} color="#fff" numberOfLines={1}>{u.nombre ? `${u.nombre} ${u.apellido}` : 'Cargando…'}</Txt>
          <Txt size={13} color={c.onCarne2}>{nivel ? `Nivel ${st.nivel_actual} · ${nivel.nombre}` : ' '}</Txt>
        </View>
      </Row>
      {nivel ? (
        <View style={{ marginTop: 14, gap: 6 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt size={12} color={c.onCarne2}>{st.nivel_actual < st.niveles.length ? `Hacia el nivel ${st.nivel_actual + 1}` : 'Último nivel'}</Txt>
            <Txt w="medium" size={12} color="#fff">{ganado} / {max} XP · Total {num(p.xp_total)}</Txt>
          </Row>
          <View style={{ height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,.2)', overflow: 'hidden' }}>
            <View style={{ width: `${pct}%`, height: '100%', borderRadius: 5, backgroundColor: c.gold }} />
          </View>
        </View>
      ) : null}
    </Carne>
  );

  return (
    <Screen header={header} onRefresh={recargar}>
      {cargando && !data ? <Loading /> : error && !data ? <ErrorState message={error} onRetry={recargar} /> : st ? (
        <>
          {sig ? (
            <View style={{ padding: 16, borderRadius: 18, backgroundColor: c.blueSoft, gap: 10 }}>
              <Row style={{ gap: 6 }}>
                <Icon name={tipo.icon} size={16} color={c.blueText} />
                <Txt w="medium" size={13} color={c.blueText}>
                  {sig.leccion.estado === 'en_progreso' ? 'Lección en progreso' : sig.leccion.estado === 'completada' ? 'Repaso' : 'Siguiente lección'} · Nivel {sig.nivel.orden}
                </Txt>
              </Row>
              <Txt w="semibold" size={18} accessibilityRole="header">{sig.leccion.titulo}</Txt>
              <Txt size={13} color={c.text2}>{tipo.label} · hasta {sig.leccion.xp_base} XP</Txt>
              <Btn title="Continuar lección diaria" icon="player-play" size="lg" onPress={() => navigation.navigate('Teoria', { id_leccion: sig.leccion.id_leccion })} />
            </View>
          ) : null}

          <View style={{ gap: 10 }}>
            <SectionHead title="Tus niveles" action="Ver todos" onAction={() => navigation.navigate('NivelesTab')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {st.niveles.map((n) => {
                const bloq = n.estado === 'bloqueado';
                const done = n.estado === 'completado';
                const label = bloq ? 'Bloqueado' : done ? 'Completado' : `${n.porcentaje}% completado`;
                return (
                  <Pressable key={n.id_nivel} disabled={bloq} onPress={() => navigation.navigate('ListaLecciones', { id_nivel: n.id_nivel })}
                    accessibilityLabel={`Nivel ${n.orden}, ${n.nombre}, ${label}`}
                    style={{ width: 132, padding: 12, borderRadius: 14, gap: 6, backgroundColor: bloq ? c.surface2 : c.surface, borderWidth: 1, borderColor: c.line }}>
                    <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? c.okSoft : bloq ? c.surface3 : c.blueSoft }}>
                      {bloq ? <Icon name="lock" size={18} color={c.text3} /> : done ? <Icon name="check" size={18} color={c.okText} /> : <Txt w="bold" color={c.blueText}>{n.orden}</Txt>}
                    </View>
                    <Txt w="semibold" size={13} color={bloq ? c.text3 : c.text} numberOfLines={2} style={{ minHeight: 36 }}>{n.nombre}</Txt>
                    <Bar pct={n.porcentaje} tone={done ? 'ok' : 'blue'} />
                    <Txt size={12} color={c.text3}>{label}</Txt>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <Row style={{ gap: 10, alignItems: 'stretch' }}>
            <Stat icon="bolt" tone="gold" value={num(p.xp_semana_actual || 0)} label="XP esta semana" />
            <Stat icon="list-check" value={`${st.lecciones_completadas}/${st.lecciones_total}`} label="Lecciones" />
            <Stat icon="award" tone="gold" value={(u.medallas || []).length} label="Medallas" />
          </Row>
        </>
      ) : null}
    </Screen>
  );
}
