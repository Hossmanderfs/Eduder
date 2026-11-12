// src/screens/PerfilPublicoScreen.js — Perfil de otro estudiante (solo lectura), desde WF-12
// Privacidad (RNF-09): solo se muestran nombre, posición y XP semanal.
import React from 'react';
import { View } from 'react-native';
import { num } from '../utils/formato';
import { Screen, AppBar, Avatar, Txt, Chip, Stat, Banner, Row } from '../ui';

export default function PerfilPublicoScreen({ route, navigation }) {
  const { fila: r, nivel, total } = route.params ?? {};
  if (!r) { navigation.goBack(); return null; }
  const partes = r.nombre.split(' ');
  return (
    <Screen bar={<AppBar onBack={() => navigation.goBack()} title="Perfil" />}>
      <View style={{ alignItems: 'center', gap: 10, paddingTop: 12 }}>
        <Avatar nombre={partes[0]} apellido={partes.slice(1).join(' ')} size={84} neutral />
        <Txt w="semibold" size={20}>{r.nombre}</Txt>
        {nivel ? <Chip tone="blue" icon="shield-star" text={`Nivel ${nivel.orden} · ${nivel.nombre}`} /> : null}
      </View>
      <Row style={{ gap: 10, alignItems: 'stretch' }}>
        <Stat icon="trophy" tone="gold" value={`#${r.posicion}`} label={`de ${total} esta semana`} />
        <Stat icon="bolt" tone="gold" value={num(r.xp_semana)} label="XP esta semana" />
      </Row>
      <Banner tone="info" icon="lock">Por privacidad, del resto de estudiantes solo se muestran su posición y sus XP semanales.</Banner>
    </Screen>
  );
}
