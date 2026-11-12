// src/screens/ListaLeccionesScreen.js — WF-09 · Selección de lección · RF-08, RF-09
import React from 'react';
import { View } from 'react-native';
import { useDashboard } from '../hooks/useDashboard';
import { TIPOS } from '../utils/progreso';
import { Screen, AppBar, Card, Txt, Bar, Chip, ListRow, Empty, Btn, Loading, ErrorState, Row } from '../ui';
import { useTheme } from '../theme';

const ESTADO = {
  no_iniciada: ['neutral', 'No iniciada'],
  en_progreso: ['blue', 'En progreso'],
  completada: ['ok', 'Completada'],
};

export default function ListaLeccionesScreen({ route, navigation }) {
  const { c } = useTheme();
  const { id_nivel } = route.params ?? {};
  const { data, error, cargando, recargar } = useDashboard();
  const n = data?.state.niveles.find((x) => x.id_nivel === id_nivel);

  return (
    <Screen bar={<AppBar onBack={() => navigation.goBack()} title={n ? `Nivel ${n.orden} · ${n.nombre}` : 'Lecciones'} />}>
      {cargando && !data ? <Loading /> : error && !data ? <ErrorState message={error} onRetry={recargar} /> : !n ? (
        <ErrorState message="Ese nivel no existe." />
      ) : n.estado === 'bloqueado' ? (
        <Empty icon="lock" title="Nivel bloqueado" text={`Completa el nivel anterior con ${n.umbral_aprobacion}% de promedio para desbloquearlo.`}>
          <Btn title="Ver niveles" kind="secondary" block={false} onPress={() => navigation.goBack()} />
        </Empty>
      ) : (
        <>
          <Card>
            <Txt size={13} color={c.text2}>{n.descripcion || ''}</Txt>
            <Row style={{ gap: 8 }}><Bar pct={n.porcentaje} tone={n.aprobado ? 'ok' : 'blue'} style={{ flex: 1 }} /><Txt size={12} color={c.text3}>{n.completadas}/{n.total}</Txt></Row>
            {n.promedio !== null ? (
              <Txt size={12} color={c.text3}>Promedio del nivel: <Txt w="semibold" size={12} color={n.promedio >= n.umbral_aprobacion ? c.okText : c.errText}>{n.promedio}%</Txt> · se necesita {n.umbral_aprobacion}%</Txt>
            ) : null}
          </Card>
          {n.lecciones.length === 0 ? <Empty icon="book" title="Sin lecciones" text="Este nivel aún no tiene lecciones publicadas." /> : (
            <View style={{ gap: 10 }}>
              {n.lecciones.map((l) => {
                const t = TIPOS[l.tipo] || TIPOS.ejercicio;
                const e = ESTADO[l.estado] || ESTADO.no_iniciada;
                if (!l.desbloqueada) return <ListRow key={l.id_leccion} locked icon="lock" iconTone="neutral" title={l.titulo} sub="Completa la lección anterior" />;
                const sub = `${t.label} · ${l.estado === 'completada' ? `${l.puntaje}% · ${Math.round((l.xp_base * l.puntaje) / 100)} XP ganados` : `+${l.xp_base} XP`}`;
                return (
                  <ListRow key={l.id_leccion} icon={l.estado === 'completada' ? 'check' : t.icon} iconTone={l.estado === 'completada' ? 'ok' : 'blue'}
                    title={l.titulo} sub={sub} right={<Chip tone={e[0]} text={e[1]} />}
                    onPress={() => navigation.navigate('Teoria', { id_leccion: l.id_leccion })} />
                );
              })}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}
