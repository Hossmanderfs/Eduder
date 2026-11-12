// src/screens/MiniJuegoScreen.js — Mini-juego · RF-10, RF-12
// Ronda contrarreloj sobre las preguntas de la lección; cada acierto cuenta para el puntaje.
// Las respuestas se validan con POST /exercise/answer (mismo endpoint que los ejercicios).
import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, Alert, TextInput } from 'react-native';
import api from '../services/api';
import { sesionLeccion } from '../utils/leccion';
import { mensajeError } from '../utils/formato';
import { Screen, AppBar, IconBtn, Txt, Btn, Bar, Icon, Banner, Row } from '../ui';
import { useTheme, FONT, RADIUS } from '../theme';

const SEGUNDOS_POR_PREGUNTA = 20;

export default function MiniJuegoScreen({ navigation }) {
  const { c } = useTheme();
  const S = sesionLeccion.get();
  const items = S?.ejercicios || [];
  const total = items.length;
  const segundos = Math.max(30, total * SEGUNDOS_POR_PREGUNTA);

  const [fase, setFase] = useState('intro'); // intro | juego | fin
  const [i, setI] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [resto, setResto] = useState(segundos);
  const [flash, setFlash] = useState(null); // 'ok' | 'err'
  const [libre, setLibre] = useState('');
  const [error, setError] = useState('');
  const bloqueado = useRef(false);
  const aciertosRef = useRef(0);
  const timer = useRef(null);

  useEffect(() => { if (!S || !total) navigation.replace('Main'); }, [S, total, navigation]);
  useEffect(() => () => clearInterval(timer.current), []);

  function terminar(porTiempo) {
    clearInterval(timer.current); timer.current = null;
    bloqueado.current = true;
    S.mg = { aciertos: aciertosRef.current, total, por_tiempo: porTiempo };
    setFase('fin');
  }
  function empezar() {
    setFase('juego');
    timer.current = setInterval(() => {
      setResto((r) => {
        if (r <= 1) { terminar(true); return 0; }
        return r - 1;
      });
    }, 1000);
  }
  function salir() {
    Alert.alert('¿Salir de la lección?', 'Perderás el avance del mini-juego. La lección queda "en progreso".', [
      { text: 'Seguir jugando', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => { clearInterval(timer.current); sesionLeccion.clear(); navigation.goBack(); } },
    ]);
  }

  async function responder(valor) {
    if (bloqueado.current || !valor) return;
    bloqueado.current = true; setError('');
    try {
      const { data } = await api.post('/exercise/answer', { id_ejercicio: items[i].id_ejercicio, respuesta: valor });
      if (data.correcto) { aciertosRef.current += 1; setAciertos(aciertosRef.current); }
      setFlash(data.correcto ? 'ok' : 'err');
      setTimeout(() => {
        setFlash(null); setLibre('');
        if (i + 1 >= total) terminar(false); else { setI(i + 1); bloqueado.current = false; }
      }, data.correcto ? 450 : 900);
    } catch (err) {
      bloqueado.current = false;
      setError(mensajeError(err, 'No se pudo evaluar la respuesta.'));
    }
  }

  if (!S || !total) return null;
  const it = items[i];
  const bajo = resto <= 10;

  const barra = (
    <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 56, paddingHorizontal: 8, gap: 4, borderBottomWidth: 1, borderBottomColor: c.line, backgroundColor: c.surface }}>
      <IconBtn name="x" label="Salir de la lección" onPress={salir} />
      <Txt w="semibold" size={17} style={{ flex: 1 }}>Mini-juego</Txt>
      <View accessibilityLabel={`Quedan ${resto} segundos`} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, height: 34, borderRadius: 17, backgroundColor: bajo ? c.errSoft : c.surface2 }}>
        <Icon name="hourglass" size={18} color={bajo ? c.errText : c.text2} />
        <Txt w="semibold" color={bajo ? c.errText : c.text}>{fase === 'intro' ? segundos : resto}</Txt>
      </View>
    </View>
  );

  if (fase === 'intro') {
    return (
      <Screen bar={barra}>
        <View style={{ alignItems: 'center', gap: 14, paddingTop: 24 }}>
          <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: c.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="device-gamepad-2" size={38} color={c.goldText} />
          </View>
          <Txt w="semibold" size={22} style={{ textAlign: 'center' }}>{S.titulo}</Txt>
          <Txt color={c.text2} style={{ textAlign: 'center' }}>{total} preguntas · {segundos} segundos. Cada acierto suma a tu puntaje de la lección.</Txt>
          <Btn title="Empezar" icon="player-play" size="lg" onPress={empezar} />
        </View>
      </Screen>
    );
  }

  if (fase === 'fin') {
    const bien = aciertosRef.current;
    return (
      <Screen bar={barra}>
        <View style={{ alignItems: 'center', gap: 14, paddingTop: 24 }}>
          <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: bien / total >= 0.7 ? c.okSoft : c.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={S.mg?.por_tiempo ? 'clock' : 'flag'} size={38} color={bien / total >= 0.7 ? c.okText : c.goldText} />
          </View>
          <Txt w="semibold" size={22}>{S.mg?.por_tiempo ? '¡Se acabó el tiempo!' : '¡Mini-juego terminado!'}</Txt>
          <Txt size={18}><Txt w="bold" size={18}>{bien} de {total}</Txt> aciertos</Txt>
          <Btn title="Ver resumen de la lección" size="lg" onPress={() => navigation.replace('Resumen')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen bar={barra}>
      <Txt size={13} color={c.text2}>Pregunta {i + 1} de {total} · Aciertos: <Txt w="semibold" size={13}>{aciertos}</Txt></Txt>
      <Bar pct={(i / total) * 100} height={8} />
      {error ? <Banner tone="error">{error}</Banner> : null}
      <View accessibilityLiveRegion="polite" style={{ minHeight: 110, padding: 18, borderRadius: RADIUS.l, alignItems: 'center', justifyContent: 'center', backgroundColor: flash === 'ok' ? c.okSoft : flash === 'err' ? c.errSoft : c.surface2 }}>
        <Txt w="medium" size={flash ? 20 : 18} style={{ textAlign: 'center', lineHeight: 28 }} color={flash === 'ok' ? c.okText : flash === 'err' ? c.errText : c.text}>
          {flash === 'ok' ? '¡Bien!' : flash === 'err' ? 'Respuesta incorrecta' : it.enunciado}
        </Txt>
      </View>
      {it.opciones?.length ? (
        <View style={{ gap: 10 }}>
          {it.opciones.map((o, k) => (
            <Btn key={k} kind="secondary" title={o} disabled={!!flash} onPress={() => responder(o)} />
          ))}
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          <TextInput value={libre} onChangeText={setLibre} autoCapitalize="none" autoCorrect={false} accessibilityLabel="Tu respuesta" placeholder="Tu respuesta" placeholderTextColor={c.text3}
            style={{ minHeight: 48, paddingHorizontal: 14, borderRadius: RADIUS.m, borderWidth: 1.5, borderColor: c.lineStrong, backgroundColor: c.surface, fontFamily: FONT.regular, fontSize: 15, color: c.text }} />
          <Btn title="Responder" disabled={!libre.trim() || !!flash} onPress={() => responder(libre.trim())} />
        </View>
      )}
    </Screen>
  );
}
