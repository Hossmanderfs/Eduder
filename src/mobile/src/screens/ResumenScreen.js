// src/screens/ResumenScreen.js — WF-11 · Resumen de lección · RF-12, RF-13, RF-14, RF-15 | HU-07 | DS-03
// PUT /progress/:id_leccion { estado: 'completada', puntaje }  (el backend devuelve el resumen de XP/racha/medallas)
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View } from 'react-native';
import api from '../services/api';
import { cargarDashboard, UMBRAL } from '../utils/progreso';
import { sesionLeccion } from '../utils/leccion';
import { num, mensajeError } from '../utils/formato';
import { Screen, AppBar, Txt, Btn, Stat, Banner, ListRow, Loading, ErrorState, Icon, Row, LinkBtn } from '../ui';
import { useTheme } from '../theme';

// Puntaje = % de aciertos (RF-12): un ejercicio cuenta si se acertó al primer intento.
function calcularPuntaje(S) {
  if (S.tipo === 'mini_juego' && S.mg) return S.mg.total ? Math.round((S.mg.aciertos / S.mg.total) * 100) : 0;
  let bien = 0;
  S.ejercicios.forEach((e) => { const r = S.resultados[e.id_ejercicio]; if (r && r.primer_intento === true) bien += 1; });
  return S.ejercicios.length ? Math.round((bien / S.ejercicios.length) * 100) : 0;
}

export default function ResumenScreen({ navigation }) {
  const { c } = useTheme();
  const S = sesionLeccion.get();
  const [r, setR] = useState(S?.completada || null);
  const [error, setError] = useState('');
  const guardando = useRef(false);

  const guardar = useCallback(async () => {
    if (!S || guardando.current) return;
    guardando.current = true; setError('');
    try {
      const puntaje = calcularPuntaje(S);
      const { data: pr } = await api.put(`/progress/${S.id_leccion}`, { estado: 'completada', puntaje });
      const d = await cargarDashboard();
      const st = d.state;
      const nivel = st.niveles.find((n) => n.id_nivel === S.id_nivel);
      const idx = nivel.lecciones.findIndex((l) => l.id_leccion === S.id_leccion);
      const abiertos = st.niveles.filter((n) => n.desbloqueado);
      let nuevoNivel = null;
      if (abiertos.length > S.previo.niveles_desbloqueados) {
        const nn = abiertos[abiertos.length - 1];
        nuevoNivel = { id_nivel: nn.id_nivel, orden: nn.orden, nombre: nn.nombre };
      }
      // DS-03 alternativa 4B: nivel completo con promedio < umbral → lecciones a mejorar
      const repasar = nivel.completo && !nivel.aprobado
        ? nivel.lecciones.filter((l) => l.puntaje < nivel.umbral_aprobacion).map((l) => ({ id_leccion: l.id_leccion, titulo: l.titulo, puntaje: l.puntaje })) : [];
      let sig = null;
      if (idx >= 0 && idx < nivel.lecciones.length - 1 && nivel.lecciones[idx + 1].desbloqueada) sig = nivel.lecciones[idx + 1];
      else if (nuevoNivel) sig = st.niveles[nuevoNivel.orden - 1].lecciones[0] || null;
      const resumen = pr?.resumen || {};
      const out = {
        puntaje,
        xp: resumen.xp_ganado ?? Math.round((S.xp_base * puntaje) / 100),
        streak: resumen.streak_dias ?? d.perfil.streak_dias ?? 0,
        xp_total: resumen.xp_total ?? d.perfil.xp_total ?? 0,
        nuevo_nivel: nuevoNivel,
        medallas: resumen.nuevas_medallas || [],
        repasar, promedio_nivel: nivel.promedio,
        siguiente: sig ? { id_leccion: sig.id_leccion, titulo: sig.titulo } : null,
      };
      S.completada = out;
      setR(out);
    } catch (err) {
      guardando.current = false;
      setError(mensajeError(err, 'No se pudo guardar tu resultado.'));
    }
  }, [S]);

  useEffect(() => {
    if (!S) { navigation.replace('Main'); return; }
    if (!S.completada) guardar();
  }, [S, guardar, navigation]);

  if (!S) return null;
  const salir = (destino, params) => { sesionLeccion.clear(); navigation.reset({ index: destino === 'Main' ? 0 : 1, routes: destino === 'Main' ? [{ name: 'Main' }] : [{ name: 'Main' }, { name: destino, params }] }); };

  return (
    <Screen bar={<AppBar title="Resumen de la lección" />}>
      {error ? <ErrorState message={error} onRetry={guardar} /> : !r ? <Loading text="Guardando tu resultado…" /> : (() => {
        const aprobado = r.puntaje >= UMBRAL;
        const col = aprobado ? c.ok : c.gold;
        return (
          <>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Txt size={13} color={c.text2}>{S.titulo} · Nivel {S.nivel_orden}</Txt>
              <Txt w="semibold" size={22}>{r.puntaje === 100 ? '¡Lección perfecta!' : aprobado ? '¡Buen trabajo!' : 'Lección completada'}</Txt>
            </View>
            <View accessibilityLabel={`Puntaje ${r.puntaje} por ciento`} style={{ alignSelf: 'center', width: 168, height: 168, borderRadius: 84, borderWidth: 14, borderColor: col, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surface2 }}>
              <Txt w="bold" size={40}>{r.puntaje}%</Txt>
              <Txt size={12} color={c.text3}>puntaje</Txt>
            </View>
            <Row style={{ gap: 10, alignItems: 'stretch' }}>
              <Stat icon="bolt" tone="gold" value={`+${r.xp}`} label="XP ganados" />
              <Stat icon="flame" tone="gold" value={r.streak} label={r.streak === 1 ? 'día de racha' : 'días de racha'} />
              <Stat icon="star" value={num(r.xp_total)} label="XP total" />
            </Row>
            {r.nuevo_nivel ? (
              <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 18, backgroundColor: c.okSoft }}>
                <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: c.ok, alignItems: 'center', justifyContent: 'center' }}><Txt w="bold" size={20} color="#fff">{r.nuevo_nivel.orden}</Txt></View>
                <View style={{ flex: 1 }}>
                  <Txt w="medium" size={13} color={c.okText}>¡Nuevo nivel desbloqueado!</Txt>
                  <Txt w="semibold" size={17}>Nivel {r.nuevo_nivel.orden} · {r.nuevo_nivel.nombre}</Txt>
                  <Txt size={12} color={c.okText}>Aprobaste el nivel {S.nivel_orden} con {r.promedio_nivel}% de promedio.</Txt>
                </View>
              </View>
            ) : null}
            {r.medallas.length ? (
              <View style={{ gap: 10 }}>
                <Txt w="semibold" size={16}>Medallas nuevas</Txt>
                {r.medallas.map((m, k) => <ListRow key={m.id_medalla || k} icon="award" iconTone="gold" title={m.nombre || 'Medalla'} sub="Ya está en tu perfil" />)}
              </View>
            ) : null}
            {r.repasar.length ? (
              <Banner tone="warn">Promedio del nivel: {r.promedio_nivel}%. Necesitas {UMBRAL}% para desbloquear el siguiente. Repasa: {r.repasar.map((l) => `${l.titulo} (${l.puntaje}%)`).join(', ')}.</Banner>
            ) : !aprobado ? <Banner tone="info">Puedes repetir la lección cuando quieras: se guarda tu mejor puntaje.</Banner> : null}
            <View style={{ gap: 10 }}>
              {r.siguiente ? <Btn title="Siguiente lección" size="lg" onPress={() => salir('Teoria', { id_leccion: r.siguiente.id_leccion })} /> : null}
              <Btn kind="secondary" title={r.nuevo_nivel ? 'Ir al nuevo nivel' : 'Volver al nivel'} onPress={() => salir('ListaLecciones', { id_nivel: r.nuevo_nivel ? r.nuevo_nivel.id_nivel : S.id_nivel })} />
              <Btn kind="ghost" title="Volver al menú principal" onPress={() => salir('Main')} />
            </View>
          </>
        );
      })()}
    </Screen>
  );
}
