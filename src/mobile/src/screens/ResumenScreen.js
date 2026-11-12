// src/screens/ResumenScreen.js — EduDer
// CU-03 | RF-12, RF-13, RF-14 | Resumen al terminar una lección: puntaje, XP, racha y medallas nuevas.
import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import BotonPrimario from '../components/BotonPrimario';
import { COLORS } from '../theme/colors';

export default function ResumenScreen({ route, navigation }) {
  const { titulo, puntaje = 0, resumen = {} } = route.params ?? {};
  const medallas = resumen.nuevas_medallas ?? [];
  const aprobado = puntaje >= 70;
  const repetida = !resumen.xp_ganado && resumen.streak_dias == null;

  return (
    <View style={styles.flex}>
      <StatusBar backgroundColor={COLORS.azul} barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.emoji}>{aprobado ? '🎉' : '💪'}</Text>
        <Text style={styles.titulo}>{aprobado ? '¡Lección completada!' : '¡Sigue practicando!'}</Text>
        {!!titulo && <Text style={styles.sub}>{titulo}</Text>}

        <View style={styles.fila}>
          <Stat icono="🎯" valor={`${puntaje}%`} label="Puntaje" />
          <Stat icono="⚡" valor={`+${resumen.xp_ganado ?? 0}`} label="XP ganado" />
          <Stat icono="🔥" valor={resumen.streak_dias ?? '—'} label="Racha (días)" />
        </View>
        {resumen.xp_total != null && <Text style={styles.total}>XP total: {resumen.xp_total}</Text>}
        {repetida && <Text style={styles.nota}>Ya habías completado esta lección: el XP solo se suma la primera vez.</Text>}

        {medallas.length > 0 && (
          <View style={styles.medallas}>
            <Text style={styles.medTitulo}>🏅 ¡Nuevas medallas!</Text>
            {medallas.map(m => (
              <View key={m.id_medalla} style={styles.medalla}><Text style={styles.medText}>{m.nombre}</Text></View>
            ))}
          </View>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <BotonPrimario texto="Continuar al mapa" onPress={() => navigation.navigate('MapaNiveles')} color={COLORS.azul} />
        <View style={{ height: 10 }} />
        <BotonPrimario texto="Ir al inicio" onPress={() => navigation.navigate('Main')} />
      </View>
    </View>
  );
}

function Stat({ icono, valor, label }) {
  return (
    <View style={styles.stat}>
      <Text style={{ fontSize: 22 }}>{icono}</Text>
      <Text style={styles.statVal}>{valor}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 24, alignItems: 'center', paddingTop: 70 },
  emoji: { fontSize: 72 },
  titulo: { fontSize: 25, fontWeight: '800', color: COLORS.texto, marginTop: 10, textAlign: 'center' },
  sub: { color: COLORS.muted, marginTop: 4, marginBottom: 18, textAlign: 'center' },
  fila: { flexDirection: 'row', gap: 10, marginTop: 8 },
  stat: { flex: 1, backgroundColor: COLORS.superficie, borderRadius: 14, padding: 14, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: COLORS.texto, marginTop: 4 },
  statLbl: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  total: { marginTop: 14, color: COLORS.xp, fontWeight: '700' },
  nota: { marginTop: 10, color: COLORS.muted, fontSize: 12, textAlign: 'center' },
  medallas: { alignSelf: 'stretch', backgroundColor: COLORS.xp_light, borderRadius: 14, padding: 16, marginTop: 20 },
  medTitulo: { fontWeight: '800', color: COLORS.warning, marginBottom: 8 },
  medalla: { backgroundColor: COLORS.superficie, borderRadius: 10, padding: 10, marginTop: 6 },
  medText: { fontWeight: '600', color: COLORS.texto },
  footer: { padding: 16, backgroundColor: COLORS.superficie, borderTopWidth: 1, borderTopColor: COLORS.borde },
});
