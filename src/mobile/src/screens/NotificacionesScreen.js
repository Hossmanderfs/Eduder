// src/screens/NotificacionesScreen.js — WF-16 · Notificaciones · RF-16 (racha / logro / sistema)
// GET /notifications · PATCH /notifications/read-all · PATCH /notifications/:id/read
import React, { useEffect, useState, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import api from '../services/api';
import { hace, mensajeError } from '../utils/formato';
import { Screen, AppBar, Txt, Btn, Icon, Empty, Loading, ErrorState, Row } from '../ui';
import { useTheme } from '../theme';

const TIPO = {
  racha: { icon: 'flame', fondo: 'goldSoft', fg: 'goldText', label: 'Racha' },
  logro: { icon: 'award', fondo: 'okSoft', fg: 'okText', label: 'Logro' },
  sistema: { icon: 'info-circle', fondo: 'blueSoft', fg: 'blueText', label: 'Sistema' },
};

export default function NotificacionesScreen({ navigation }) {
  const { c } = useTheme();
  const [lista, setLista] = useState(null);
  const [error, setError] = useState('');
  const [marcando, setMarcando] = useState(false);

  const cargar = useCallback(async () => {
    setError('');
    try { const { data } = await api.get('/notifications'); setLista(data.items || []); }
    catch (err) { setError(mensajeError(err, 'No se pudieron cargar las notificaciones.')); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const sinLeer = (lista || []).filter((n) => !n.leida).length;

  async function marcarTodo() {
    setMarcando(true);
    try { await api.patch('/notifications/read-all'); setLista((l) => l.map((n) => ({ ...n, leida: true }))); }
    catch (err) { setError(mensajeError(err)); }
    finally { setMarcando(false); }
  }
  async function marcar(n) {
    if (n.leida) return;
    setLista((l) => l.map((x) => (x.id_notificacion === n.id_notificacion ? { ...x, leida: true } : x)));
    api.patch(`/notifications/${n.id_notificacion}/read`).catch(() => {});
  }

  return (
    <Screen bar={<AppBar onBack={() => navigation.goBack()} title="Notificaciones" />} onRefresh={cargar}>
      {error && !lista ? <ErrorState message={error} onRetry={cargar} /> : !lista ? <Loading /> : !lista.length ? (
        <Empty icon="bell" title="Sin notificaciones" text="Aquí verás tus logros y recordatorios de racha." />
      ) : (
        <>
          <Row>
            <Txt size={13} color={c.text2} style={{ flex: 1 }}>{sinLeer ? `${sinLeer} sin leer` : 'Todo al día'}</Txt>
            <Btn block={false} size="sm" kind="secondary" icon="check" title="Marcar todo como leído" disabled={!sinLeer} loading={marcando} onPress={marcarTodo} />
          </Row>
          <View style={{ gap: 8 }}>
            {lista.map((n) => {
              const t = TIPO[n.tipo] || TIPO.sistema;
              return (
                <Pressable key={n.id_notificacion} onPress={() => marcar(n)} accessibilityLabel={`${n.mensaje}${n.leida ? '' : ', sin leer'}`}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, backgroundColor: n.leida ? c.surface : c.blueSoft, borderWidth: 1, borderColor: c.line }}>
                  <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: c[t.fondo] }}>
                    <Icon name={t.icon} size={20} color={c[t.fg]} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt w={n.leida ? 'regular' : 'medium'}>{n.mensaje}</Txt>
                    <Txt size={12} color={c.text3}>{t.label} · {hace(n.fecha_envio)}</Txt>
                  </View>
                  {!n.leida ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.blue }} /> : null}
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}
