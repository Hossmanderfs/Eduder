// src/screens/SplashScreen.js — WF-00 · Bienvenida · CU-02 | RF-03, RF-04
// Si hay sesión guardada entra directo; si no, muestra "Crear cuenta / Iniciar sesión".
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { getStoredSession } from '../services/auth.service';
import { irAMain } from '../utils/sesion';
import { Screen, Logo, Txt, Btn } from '../ui';
import { useTheme } from '../theme';

export default function SplashScreen({ navigation }) {
  const { c } = useTheme();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const s = await getStoredSession();
        if (s) { await irAMain(navigation); return; }
      } catch { /* sin sesión */ }
      if (vivo) setVerificando(false);
    })();
    return () => { vivo = false; };
  }, [navigation]);

  return (
    <Screen scroll={false} contentStyle={{ justifyContent: 'space-between', paddingVertical: 32 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <Logo size={72} />
        <Txt w="bold" size={34} accessibilityRole="header">EduDer</Txt>
        <Txt color={c.text2} style={{ textAlign: 'center', maxWidth: 300 }}>
          Lógica matemática en lecciones cortas, con retos, rachas y medallas.
        </Txt>
        <Txt w="medium" size={22} color={c.blueText} style={{ letterSpacing: 6, marginTop: 8 }}>¬ ∧ ∨ → ↔</Txt>
        <Txt size={12} color={c.text3}>Corporación Universitaria Remington</Txt>
      </View>
      <View style={{ gap: 12, minHeight: 124, justifyContent: 'center' }}>
        {verificando ? <ActivityIndicator color={c.blue} /> : (
          <>
            <Btn title="Crear cuenta" size="lg" onPress={() => navigation.navigate('Register')} />
            <Btn title="Iniciar sesión" size="lg" kind="secondary" onPress={() => navigation.navigate('Login')} />
          </>
        )}
      </View>
    </Screen>
  );
}
