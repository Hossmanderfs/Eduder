// src/screens/MapaNivelesScreen.js — WF-08 · Selección de nivel · RF-07, RF-08 | HU-03
import React from 'react';
import { View } from 'react-native';
import { useDashboard } from '../hooks/useDashboard';
import { UMBRAL } from '../utils/progreso';
import { Screen, AppBar, Card, Txt, Bar, Chip, Icon, Loading, ErrorState, Row } from '../ui';
import { Pressable } from 'react-native';
import { useTheme } from '../theme';

export default function MapaNivelesScreen({ navigation }) {
  const { c } = useTheme();
  const { data, error, cargando, recargar } = useDashboard();
  const st = data?.state;

  return (
    <Screen bar={<AppBar title="Niveles de Lógica Matemática" />}>
      {cargando && !data ? <Loading /> : error && !data ? <ErrorState message={error} onRetry={recargar} /> : st ? (
        <>
          <Card>
            <Row>
              <Txt w="semibold" size={15} style={{ flex: 1 }}>Tu avance en el curso</Txt>
              <Txt w="semibold">{st.porcentaje_global}%</Txt>
            </Row>
            <Bar pct={st.porcentaje_global} height={10} />
            <Txt size={12} color={c.text3}>{st.lecciones_completadas} de {st.lecciones_total} lecciones completadas · Se aprueba un nivel con {UMBRAL}% de promedio.</Txt>
          </Card>
          <View style={{ gap: 10 }}>
            {st.niveles.map((n) => {
              const bloq = n.estado === 'bloqueado';
              const done = n.estado === 'completado';
              const chip = done ? <Chip tone="ok" icon="check" text={`Aprobado · ${n.promedio}%`} />
                : n.completo && !n.aprobado ? <Chip tone="err" text={`Promedio ${n.promedio}% · repasa para aprobar`} />
                : n.estado === 'en_progreso' ? <Chip tone="blue" text="En progreso" /> : <Chip text="Disponible" />;
              return (
                <Pressable key={n.id_nivel} disabled={bloq} onPress={() => navigation.navigate('ListaLecciones', { id_nivel: n.id_nivel })}
                  accessibilityRole="button" accessibilityLabel={`Nivel ${n.orden}, ${n.nombre}${bloq ? ', bloqueado' : ''}`}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 18, borderWidth: 1.5, borderStyle: bloq ? 'dashed' : 'solid', borderColor: done ? c.ok : c.line, backgroundColor: bloq ? c.surface2 : c.surface }}>
                  <View style={{ width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: bloq ? c.surface3 : done ? c.ok : c.blue }}>
                    {bloq ? <Icon name="lock" size={22} color={c.text3} /> : done ? <Icon name="check" size={24} color="#fff" /> : <Txt w="bold" size={20} color={c.onBlue}>{n.orden}</Txt>}
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Txt w="semibold" color={bloq ? c.text3 : c.text}>Nivel {n.orden} · {n.nombre}</Txt>
                    <Txt size={12} color={c.text3}>{bloq ? 'Completa el nivel anterior' : n.descripcion || ''}</Txt>
                    {!bloq ? (
                      <>
                        <Row style={{ gap: 8 }}><Bar pct={n.porcentaje} tone={done ? 'ok' : 'blue'} style={{ flex: 1 }} /><Txt size={12} color={c.text3}>{n.porcentaje}%</Txt></Row>
                        {chip}
                      </>
                    ) : null}
                  </View>
                  {!bloq ? <Icon name="chevron-right" size={20} color={c.text3} /> : null}
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}
    </Screen>
  );
}
