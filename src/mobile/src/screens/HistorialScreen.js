// src/screens/HistorialScreen.js — Historial de lecciones · RF-18 (nombre, fecha y puntaje)
// GET /profile/progress → detalle[] con estado 'completada'
import React from 'react';
import { View } from 'react-native';
import { useDashboard } from '../hooks/useDashboard';
import { TIPOS } from '../utils/progreso';
import { fechaLarga } from '../utils/formato';
import { Screen, AppBar, Stat, ListRow, Chip, Empty, Btn, Loading, ErrorState, Row } from '../ui';
import { UMBRAL } from '../utils/progreso';

export default function HistorialScreen({ navigation }) {
  const { data, error, cargando, recargar } = useDashboard();
  const meta = {};
  data?.state.niveles.forEach((n) => n.lecciones.forEach((l) => { meta[l.id_leccion] = { ...l, nivel: n.nombre }; }));
  const hechas = (data?.progreso?.detalle || []).filter((p) => p.estado === 'completada')
    .sort((a, b) => String(b.fecha_completado).localeCompare(String(a.fecha_completado)));
  const prom = hechas.length ? Math.round(hechas.reduce((a, p) => a + (Number(p.puntaje) || 0), 0) / hechas.length) : 0;

  return (
    <Screen bar={<AppBar onBack={() => navigation.goBack()} title="Historial de lecciones" />}>
      {cargando && !data ? <Loading /> : error && !data ? <ErrorState message={error} onRetry={recargar} /> : !hechas.length ? (
        <Empty icon="history" title="Aún no completas lecciones" text="Cuando termines tu primera lección, aparecerá aquí con su fecha y puntaje.">
          <Btn title="Empezar una lección" block={false} onPress={() => navigation.navigate('Main')} />
        </Empty>
      ) : (
        <>
          <Row style={{ gap: 10, alignItems: 'stretch' }}>
            <Stat value={hechas.length} label="Lecciones completadas" />
            <Stat value={`${prom}%`} label="Puntaje promedio" />
          </Row>
          <View style={{ gap: 10 }}>
            {hechas.map((p) => {
              const m = meta[p.id_leccion] || {};
              const t = TIPOS[m.tipo] || TIPOS.ejercicio;
              const pt = Number(p.puntaje) || 0;
              return (
                <ListRow key={p.id_leccion} icon={t.icon} title={m.titulo || p.leccion?.titulo || 'Lección'} sub={`${m.nivel || ''} · ${fechaLarga(p.fecha_completado)}`}
                  right={<Chip tone={pt >= 85 ? 'ok' : pt >= UMBRAL ? 'gold' : 'err'} text={`${pt}%`} />}
                  onPress={() => navigation.navigate('Teoria', { id_leccion: p.id_leccion })} />
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}
