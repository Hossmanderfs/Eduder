// src/screens/MedallasScreen.js — WF-13 · Medallas · RF-14, RF-15 | GET /gamification/medals
import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import api from '../services/api';
import { num, fechaLarga, mensajeError } from '../utils/formato';
import { Screen, AppBar, Card, Txt, Bar, Icon, Loading, ErrorState, Row } from '../ui';
import { useTheme } from '../theme';

const ICONO = { nivel_completado: 'shield-star', puntaje_perfecto: 'target', streak: 'flame', xp_acumulado: 'bolt' };
function condicion(m) {
  const v = m.condicion_valor;
  switch (m.condicion_tipo) {
    case 'nivel_completado': return `Aprueba el nivel ${v}`;
    case 'puntaje_perfecto': return `Saca ${v}% en una lección`;
    case 'streak': return `Racha de ${v} días`;
    case 'xp_acumulado': return `Acumula ${num(v)} XP`;
    default: return m.descripcion || '';
  }
}

export default function MedallasScreen({ navigation }) {
  const { c } = useTheme();
  const [lista, setLista] = useState(null);
  const [error, setError] = useState('');
  const cargar = useCallback(async () => {
    setError('');
    try { const { data } = await api.get('/gamification/medals'); setLista(Array.isArray(data) ? data : []); }
    catch (err) { setError(mensajeError(err, 'No se pudieron cargar las medallas.')); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);
  const ganadas = (lista || []).filter((m) => m.obtenida).length;

  return (
    <Screen bar={<AppBar onBack={() => navigation.goBack()} title="Medallas" />} onRefresh={cargar}>
      {error ? <ErrorState message={error} onRetry={cargar} /> : !lista ? <Loading /> : (
        <>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: c.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="award" size={26} color={c.goldText} />
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <Txt><Txt w="semibold">{ganadas} de {lista.length}</Txt> medallas obtenidas</Txt>
              <Bar pct={(ganadas / Math.max(1, lista.length)) * 100} tone="gold" height={8} />
            </View>
          </Card>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {lista.map((m) => (
              <View key={m.id_medalla} accessibilityLabel={`${m.nombre}${m.obtenida ? `, obtenida el ${fechaLarga(m.fecha_obtencion)}` : `, pendiente: ${condicion(m)}`}`}
                style={{ width: '48%', padding: 14, borderRadius: 16, alignItems: 'center', gap: 6, backgroundColor: m.obtenida ? c.goldSoft : c.surface2, borderWidth: 1, borderColor: m.obtenida ? c.gold : c.line }}>
                <View style={{ width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: m.obtenida ? c.gold : c.surface3 }}>
                  <Icon name={m.obtenida ? (ICONO[m.condicion_tipo] || 'award') : 'lock'} size={26} color={m.obtenida ? c.onGold : c.text3} />
                </View>
                <Txt w="semibold" size={14} style={{ textAlign: 'center' }}>{m.nombre}</Txt>
                <Txt size={12} color={c.text3} style={{ textAlign: 'center' }}>{m.obtenida ? fechaLarga(m.fecha_obtencion) : condicion(m)}</Txt>
              </View>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}
