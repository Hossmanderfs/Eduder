// src/screens/TeoriaScreen.js — Lección: teoría previa · RF-08, RF-09
// GET /lessons/:id/content · al empezar marca la lección EN_PROGRESO y prepara la sesión.
import React, { useEffect, useState, useCallback } from 'react';
import { View, Image, Linking } from 'react-native';
import api from '../services/api';
import { cargarDashboard } from '../utils/progreso';
import { normalizarLeccion, sesionLeccion } from '../utils/leccion';
import { TIPOS } from '../utils/progreso';
import { mensajeError } from '../utils/formato';
import { Screen, AppBar, Txt, Chip, Btn, Banner, Empty, Loading, ErrorState, BottomBar, Card } from '../ui';
import { useTheme } from '../theme';

export default function TeoriaScreen({ route, navigation }) {
  const { c } = useTheme();
  const { id_leccion } = route.params ?? {};
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  const [iniciando, setIniciando] = useState(false);

  const cargar = useCallback(async () => {
    setError('');
    try {
      const [lec, dash, med] = await Promise.all([
        api.get(`/lessons/${id_leccion}/content`),
        cargarDashboard(),
        api.get('/gamification/medals').catch(() => ({ data: [] })),
      ]);
      const l = normalizarLeccion(lec.data);
      let nivel = null; let item = null;
      dash.state.niveles.forEach((n) => n.lecciones.forEach((x) => { if (x.id_leccion === id_leccion) { nivel = n; item = x; } }));
      if (!nivel) throw new Error('No encontramos esta lección.');
      setD({ l, nivel, item, st: dash.state, medallas: Array.isArray(med.data) ? med.data : [] });
    } catch (err) {
      setError(mensajeError(err, 'No se pudo cargar la lección.'));
    }
  }, [id_leccion]);

  useEffect(() => { cargar(); }, [cargar]);

  async function comenzar() {
    const { l, nivel, item, st, medallas } = d;
    setIniciando(true);
    try {
      if (item.estado !== 'completada') await api.put(`/progress/${id_leccion}`, { estado: 'en_progreso' });
      sesionLeccion.set({
        id_leccion: l.id_leccion, titulo: l.titulo, tipo: l.tipo, xp_base: l.xp_base,
        id_nivel: nivel.id_nivel, nivel_nombre: nivel.nombre, nivel_orden: nivel.orden,
        ejercicios: l.ejercicios, idx: 0, resultados: {}, ultimo: null, mg: null,
        // Fotografía previa para detectar desbloqueos y medallas nuevas en el resumen (WF-11)
        previo: {
          niveles_desbloqueados: st.niveles.filter((n) => n.desbloqueado).length,
          medallas: medallas.filter((m) => m.obtenida).map((m) => m.id_medalla),
        },
      });
      navigation.replace(l.tipo === 'mini_juego' ? 'MiniJuego' : 'Ejercicio');
    } catch (err) {
      setIniciando(false);
      setError(mensajeError(err, 'No se pudo iniciar la lección.'));
    }
  }

  const l = d?.l; const item = d?.item;
  const nEj = l?.ejercicios.length || 0;
  const t = l ? TIPOS[l.tipo] || TIPOS.ejercicio : null;
  const boton = item?.estado === 'completada' ? 'Repetir ejercicios' : item?.estado === 'en_progreso' ? 'Continuar con los ejercicios' : l?.tipo === 'mini_juego' ? 'Empezar mini-juego' : 'Comenzar ejercicios';

  return (
    <Screen
      bar={<AppBar onBack={() => navigation.goBack()} title={l?.titulo || 'Lección'} />}
      footer={d && item.desbloqueada && nEj ? <BottomBar><Btn title={boton} size="lg" onPress={comenzar} loading={iniciando} /></BottomBar> : null}
    >
      {error && !d ? <ErrorState message={error} onRetry={cargar} /> : !d ? <Loading /> : !item.desbloqueada ? (
        <Empty icon="lock" title="Lección bloqueada" text="Completa la lección anterior para continuar.">
          <Btn title="Ver lecciones" kind="secondary" block={false} onPress={() => navigation.goBack()} />
        </Empty>
      ) : (
        <>
          <View style={{ gap: 6 }}>
            <Chip tone="blue" icon={t.icon} text={`${t.label} · Nivel ${d.nivel.orden}`} />
            <Txt w="semibold" size={22} accessibilityRole="header">{l.titulo}</Txt>
            <Txt size={13} color={c.text2}>
              {nEj} {nEj === 1 ? 'ejercicio' : 'ejercicios'} · hasta {l.xp_base} XP{item.estado === 'completada' ? ` · Mejor puntaje: ${item.puntaje}%` : ''}
            </Txt>
          </View>
          {error ? <Banner tone="error">{error}</Banner> : null}
          {l.contenidos.length ? l.contenidos.map((b, i) => (
            <Card key={b.id_contenido || i} style={{ padding: 16, gap: 8 }}>
              <Txt size={12} color={c.text3}>{i + 1} de {l.contenidos.length}</Txt>
              {b.tipo_bloque === 'imagen' ? (
                <Image source={{ uri: b.contenido }} accessibilityLabel="Ilustración de la lección" style={{ width: '100%', height: 200, borderRadius: 12 }} resizeMode="contain" />
              ) : b.tipo_bloque === 'video' ? (
                <Btn title="Ver video" icon="player-play" kind="secondary" onPress={() => Linking.openURL(b.contenido).catch(() => {})} />
              ) : (
                <Txt size={16} style={{ lineHeight: 26 }}>{b.contenido}</Txt>
              )}
            </Card>
          )) : <Txt color={c.text2}>Esta lección no tiene teoría previa.</Txt>}
          {!nEj ? <Banner tone="warn">Esta lección aún no tiene ejercicios cargados.</Banner> : null}
        </>
      )}
    </Screen>
  );
}
