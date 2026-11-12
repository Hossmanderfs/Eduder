// src/screens/EjercicioScreen.js — WF-02 (ejercicio) + WF-10 (feedback) · RF-10, RF-11 | CU-03 | DS-02
// POST /exercise/answer · GET /exercise/:id/hint?numero=1|2
// Tres interacciones: selección múltiple, completar y arrastrar (tocar pieza → siguiente espacio libre).
// Máximo 2 pistas; "Saltar este ejercicio" aparece tras 2 intentos fallidos.
import React, { useState, useMemo, useEffect } from 'react';
import { View, Pressable, Alert, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../services/api';
import { sesionLeccion, SEP } from '../utils/leccion';
import { mensajeError } from '../utils/formato';
import { Screen, Txt, Btn, Bar, IconBtn, Icon, Banner, BottomBar, Row } from '../ui';
import { useTheme, FONT, RADIUS } from '../theme';

const MAX_PISTAS = 2;
const KIND = {
  seleccion_multiple: ['list-check', 'Elige una respuesta'],
  completar: ['puzzle', 'Completa el espacio'],
  arrastrar: ['grip-vertical', 'Ordena las piezas'],
};

export default function EjercicioScreen({ navigation }) {
  const { c } = useTheme();
  const S = sesionLeccion.get();
  const [, forzar] = useState(0);
  const refrescar = () => forzar((n) => n + 1);

  const total = S ? S.ejercicios.length : 0;
  const ej = S ? S.ejercicios[S.idx] : null;
  useEffect(() => {
    if (!S) navigation.replace('Main');
    else if (!ej) navigation.replace('Resumen');
  }, [S, ej, navigation]);
  if (!S || !ej) return null;

  return <Pantalla key={`${S.idx}-${S.ultimo ? 'f' : 'e'}`} S={S} ej={ej} total={total} c={c} navigation={navigation} refrescar={refrescar} />;
}

function Pantalla({ S, ej, total, c, navigation, refrescar }) {
  const res = S.resultados[ej.id_ejercicio] || (S.resultados[ej.id_ejercicio] = { intentos: 0, primer_intento: null, correcto: false, pistas: [] });
  const [respuesta, setRespuesta] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [pidiendoPista, setPidiendoPista] = useState(false);
  const [error, setError] = useState('');
  const feedback = S.ultimo;

  const esBlanco = ej.tipo_interaccion === 'completar' && ej.enunciado.includes('___');
  const kind = KIND[ej.tipo_interaccion] || KIND.seleccion_multiple;
  const maxPistas = MAX_PISTAS;
  const quedan = maxPistas - res.pistas.length;

  function salir() {
    Alert.alert('¿Salir de la lección?', 'Tu avance queda guardado como "en progreso" y podrás retomarla después.', [
      { text: 'Seguir aquí', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => { sesionLeccion.clear(); navigation.goBack(); } },
    ]);
  }

  async function pedirPista() {
    setPidiendoPista(true); setError('');
    try {
      const { data } = await api.get(`/exercise/${ej.id_ejercicio}/hint`, { params: { numero: res.pistas.length + 1 } });
      res.pistas.push(data.texto_pista);
      refrescar();
    } catch (err) {
      setError(mensajeError(err, 'No hay más pistas para este ejercicio.'));
    } finally { setPidiendoPista(false); }
  }

  async function enviar() {
    if (respuesta === null || respuesta === '') return;
    setEnviando(true); setError('');
    try {
      const { data } = await api.post('/exercise/answer', { id_ejercicio: ej.id_ejercicio, respuesta });
      res.intentos += 1;
      if (res.primer_intento === null) res.primer_intento = !!data.correcto;
      res.correcto = !!data.correcto;
      const items = S.ejercicios.length;
      S.ultimo = {
        id_ejercicio: ej.id_ejercicio, correcto: !!data.correcto, explicacion: data.explicacion || null,
        respuesta, primer_intento: res.intentos === 1,
        xp: data.correcto && res.intentos === 1 ? Math.round(S.xp_base / items) : 0,
      };
      refrescar();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo evaluar la respuesta.'));
    } finally { setEnviando(false); }
  }

  const esUltimo = S.idx >= total - 1;
  function avanzar() {
    S.idx += 1; S.ultimo = null;
    if (esUltimo) navigation.replace('Resumen'); else refrescar();
  }
  function reintentar() { S.ultimo = null; refrescar(); }

  // ── Barra superior de progreso ──
  const pct = ((S.idx + (feedback?.correcto ? 1 : 0)) / total) * 100;
  const top = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, minHeight: 56, borderBottomWidth: 1, borderBottomColor: c.line, backgroundColor: c.surface }}>
      {feedback ? <View style={{ width: 12 }} /> : <IconBtn name="x" label="Salir de la lección" onPress={salir} />}
      <View style={{ flex: 1, gap: 4 }}>
        <Bar pct={pct} height={8} tone={feedback && !feedback.correcto ? 'blue' : 'ok'} />
        <Txt size={12} color={c.text3} numberOfLines={1}>Ejercicio {S.idx + 1} de {total} · {S.titulo}</Txt>
      </View>
    </View>
  );

  // ── Feedback (WF-10) ──
  if (feedback) {
    const ok = feedback.correcto;
    const intentos = res.intentos;
    const siguienteTxt = !esUltimo ? 'Siguiente ejercicio' : 'Ver resumen';
    return (
      <Screen bar={top} contentStyle={{ gap: 16 }}
        footer={<BottomBar>
          {ok ? <Btn title={siguienteTxt} kind="ok" size="lg" onPress={avanzar} />
            : <>
              <Btn title="Intentar de nuevo" icon="arrow-back-up" size="lg" onPress={reintentar} />
              {intentos >= 2 ? <Btn title="Saltar este ejercicio" kind="ghost" onPress={avanzar} /> : null}
            </>}
        </BottomBar>}>
        <View accessibilityLiveRegion="assertive" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: RADIUS.l, backgroundColor: ok ? c.okSoft : c.errSoft }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: ok ? c.ok : c.err }}>
            <Icon name={ok ? 'check' : 'x'} size={24} color="#fff" />
          </View>
          <Txt w="bold" size={20} color={ok ? c.okText : c.errText}>{ok ? '¡Correcto!' : 'Incorrecto'}</Txt>
        </View>
        {ok && feedback.xp > 0 ? (
          <Row style={{ gap: 8 }}>
            <Icon name="bolt" size={28} color={c.gold} />
            <Txt w="bold" size={28}>+{feedback.xp} XP</Txt>
          </Row>
        ) : null}
        {ok ? <Txt size={13} color={c.text2}>{feedback.xp > 0 ? 'Los XP se suman a tu perfil al terminar la lección.' : 'Bien resuelto. Los XP solo cuentan cuando aciertas en el primer intento.'}</Txt> : null}
        <Txt size={13}><Txt size={13} color={c.text2}>Tu respuesta: </Txt><Txt w="semibold" size={13}>{feedback.respuesta}</Txt></Txt>
        {!ok && feedback.explicacion ? (
          <View style={{ padding: 14, borderRadius: RADIUS.m, backgroundColor: c.surface2, gap: 6 }}>
            <Row style={{ gap: 8 }}><Icon name="bulb" size={18} color={c.goldText} /><Txt w="semibold">Explicación paso a paso</Txt></Row>
            <Txt size={14} style={{ lineHeight: 22 }}>{feedback.explicacion}</Txt>
          </View>
        ) : null}
      </Screen>
    );
  }

  // ── Ejercicio (WF-02) ──
  return (
    <Screen bar={top}
      footer={<BottomBar><Btn title="Enviar respuesta" size="lg" onPress={enviar} loading={enviando} disabled={respuesta === null || respuesta === ''} /></BottomBar>}>
      <Row style={{ gap: 6 }}>
        <Icon name={kind[0]} size={16} color={c.blueText} />
        <Txt w="medium" size={13} color={c.blueText}>{kind[1]}{res.intentos ? ` · Intento ${res.intentos + 1}` : ''}</Txt>
      </Row>
      {!esBlanco ? <Txt w="semibold" size={22} style={{ lineHeight: 30 }} accessibilityRole="header">{ej.enunciado}</Txt> : null}
      {error ? <Banner tone="error">{error}</Banner> : null}

      {ej.tipo_interaccion === 'arrastrar' && ej.piezas?.length ? <Arrastrar piezas={ej.piezas} onChange={setRespuesta} c={c} />
        : esBlanco ? <Blanco ej={ej} onChange={setRespuesta} c={c} />
        : ej.opciones?.length ? <Opciones opciones={ej.opciones} onChange={setRespuesta} c={c} />
        : <Libre onChange={setRespuesta} c={c} />}

      <View style={{ gap: 10 }} accessibilityLiveRegion="polite">
        {res.pistas.map((t, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 10, padding: 12, borderRadius: RADIUS.m, backgroundColor: c.goldSoft }}>
            <Icon name="bulb" size={18} color={c.goldText} />
            <Txt size={14} color={c.goldText} style={{ flex: 1 }}><Txt w="semibold" size={14} color={c.goldText}>Pista {i + 1}: </Txt>{t}</Txt>
          </View>
        ))}
      </View>
      {quedan > 0 ? (
        <Btn kind="ghost" block={false} icon="bulb" loading={pidiendoPista} onPress={pedirPista}
          title={res.pistas.length ? `¿Otra pista? (queda ${quedan})` : `¿Necesitas una pista? (${quedan} disponibles)`} />
      ) : null}
    </Screen>
  );
}

// ── Selección múltiple ──
function Opciones({ opciones, onChange, c }) {
  const [sel, setSel] = useState(-1);
  return (
    <View accessibilityRole="radiogroup" style={{ gap: 10 }}>
      {opciones.map((o, i) => {
        const on = sel === i;
        return (
          <Pressable key={i} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => { setSel(i); onChange(o); }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, padding: 12, borderRadius: RADIUS.m, borderWidth: 2, borderColor: on ? c.blue : c.line, backgroundColor: on ? c.blueSoft : c.surface }}>
            <View style={{ width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.blue : c.surface3 }}>
              <Txt w="semibold" size={13} color={on ? c.onBlue : c.text2}>{String.fromCharCode(65 + i)}</Txt>
            </View>
            <Txt style={{ flex: 1 }} size={15}>{o}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Completar ──
function Blanco({ ej, onChange, c }) {
  const partes = ej.enunciado.split('___');
  const [valor, setValor] = useState(null);
  const [libre, setLibre] = useState('');
  const hayBanco = ej.opciones && ej.opciones.length;
  const mostrado = hayBanco ? valor : libre.trim();
  return (
    <View style={{ gap: 18 }}>
      <Txt w="medium" size={20} style={{ lineHeight: 34 }} accessibilityRole="header">
        {partes[0]}
        <Txt w="semibold" size={20} color={mostrado ? c.blueText : c.text3} style={{ backgroundColor: c.blueSoft }}>{` ${mostrado || '____'} `}</Txt>
        {partes.slice(1).join('___')}
      </Txt>
      {hayBanco ? (
        <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {ej.opciones.map((o, i) => {
            const on = valor === o;
            return (
              <Pressable key={i} accessibilityState={{ selected: on }} onPress={() => { const v = on ? null : o; setValor(v); onChange(v); }}
                style={{ minHeight: 44, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 999, borderWidth: 2, borderColor: on ? c.blue : c.line, backgroundColor: on ? c.blue : c.surface }}>
                <Txt w="medium" color={on ? c.onBlue : c.text}>{o}</Txt>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Libre onChange={(v) => { setLibre(v || ''); onChange(v); }} c={c} />
      )}
    </View>
  );
}

// ── Respuesta libre ──
function Libre({ onChange, c }) {
  const [v, setV] = useState('');
  return (
    <View style={{ gap: 6 }}>
      <Txt w="medium" size={13}>Tu respuesta</Txt>
      <TextInput value={v} onChangeText={(t) => { setV(t); onChange(t.trim() || null); }} autoCapitalize="none" autoCorrect={false} accessibilityLabel="Tu respuesta"
        style={{ minHeight: 48, paddingHorizontal: 14, borderRadius: RADIUS.m, borderWidth: 1.5, borderColor: c.lineStrong, backgroundColor: c.surface, fontFamily: FONT.regular, fontSize: 15, color: c.text }} />
    </View>
  );
}

// ── Arrastrar / ordenar: tocar una pieza la coloca en el siguiente espacio libre; tocar una colocada la devuelve ──
function Arrastrar({ piezas, onChange, c }) {
  const n = piezas.length;
  const [colocadas, setColocadas] = useState(() => new Array(n).fill(null));
  const libres = useMemo(() => piezas.map((_, i) => i).filter((i) => !colocadas.includes(i)), [piezas, colocadas]);

  function toca(i) {
    const next = colocadas.slice();
    const en = next.indexOf(i);
    if (en >= 0) next[en] = null;
    else { const libre = next.indexOf(null); if (libre >= 0) next[libre] = i; }
    setColocadas(next);
    onChange(next.every((p) => p !== null) ? next.map((p) => piezas[p]).join(SEP) : null);
  }
  const Pieza = ({ i, dentro }) => (
    <Pressable onPress={() => toca(i)} accessibilityRole="button" accessibilityLabel={dentro ? `${piezas[i]}, colocada. Toca para devolver` : `${piezas[i]}. Toca para colocar`}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 10, borderRadius: RADIUS.s, borderWidth: 1.5, borderColor: dentro ? 'transparent' : c.lineStrong, backgroundColor: dentro ? 'transparent' : c.surface, flexShrink: 1 }}>
      <Icon name="grip-vertical" size={16} color={c.text3} />
      <Txt w="medium" style={{ flexShrink: 1 }}>{piezas[i]}</Txt>
    </Pressable>
  );
  return (
    <View style={{ gap: 12 }}>
      <Txt size={13} color={c.text2}>Toca cada pieza para colocarla en el siguiente espacio libre. Toca una pieza colocada para devolverla.</Txt>
      <View accessibilityLabel="Orden de tu respuesta" style={{ gap: 8 }}>
        {colocadas.map((p, s) => (
          <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, paddingHorizontal: 10, borderRadius: RADIUS.m, borderWidth: 1.5, borderStyle: p !== null ? 'solid' : 'dashed', borderColor: p !== null ? c.blue : c.lineStrong, backgroundColor: p !== null ? c.surface : c.surface2 }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surface3 }}>
              <Txt w="semibold" size={12} color={c.text2}>{s + 1}</Txt>
            </View>
            {p !== null ? <View style={{ flex: 1 }}><Pieza i={p} dentro /></View> : <Txt size={13} color={c.text3}>Posición {s + 1}</Txt>}
          </View>
        ))}
      </View>
      <Txt size={12} color={c.text3}>Piezas disponibles</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, minHeight: 52, padding: 8, borderRadius: RADIUS.m, backgroundColor: c.surface2 }}>
        {libres.length ? libres.map((i) => <Pieza key={i} i={i} />) : <Txt size={12} color={c.text3} style={{ padding: 10 }}>Todas las piezas están colocadas.</Txt>}
      </View>
    </View>
  );
}
