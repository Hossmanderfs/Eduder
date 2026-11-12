// src/screens/LoginScreen.js — WF-05 · Iniciar sesión · CU-02 | RF-03, RF-04, RF-05, RF-06, RF-20
import React, { useState } from 'react';
import { View } from 'react-native';
import { login } from '../services/auth.service';
import { irAMain } from '../utils/sesion';
import { DOMINIO_EJEMPLO } from '../config';
import { Screen, AppBar, Logo, Txt, Field, Btn, Banner, LinkBtn } from '../ui';
import { useTheme } from '../theme';

export default function LoginScreen({ navigation }) {
  const { c } = useTheme();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function entrar() {
    setError('');
    if (!correo.trim() || !clave) { setError('Escribe tu correo y tu contraseña.'); return; }
    setCargando(true);
    try {
      await login({ correo_institucional: correo.trim().toLowerCase(), contrasena: clave });
      await irAMain(navigation);
    } catch (err) {
      const st = err?.response?.status;
      const msg = err?.response?.data?.message;
      setClave('');
      if (!err?.response) setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo y que el celular esté en la misma red Wi-Fi.');
      else if (st === 403) setError('Tu cuenta está desactivada. Contacta al administrador.');
      else setError(msg || 'Credenciales incorrectas.'); // 401 y 429 (bloqueo 15 min, RF-05)
    } finally {
      setCargando(false);
    }
  }

  return (
    <Screen bar={<AppBar onBack={() => (navigation.canGoBack() ? navigation.goBack() : navigation.replace('Splash'))} title="" />}>
      <View style={{ alignItems: 'center', gap: 8, paddingTop: 4 }}>
        <Logo size={52} />
        <Txt w="semibold" size={24} accessibilityRole="header">Iniciar sesión</Txt>
        <Txt size={13} color={c.text2}>Entra con tu correo institucional.</Txt>
      </View>
      {error ? <Banner tone="error">{error}</Banner> : null}
      <View style={{ gap: 14 }}>
        <Field label="Correo institucional" value={correo} onChangeText={setCorreo} placeholder={`nombre.apellido@${DOMINIO_EJEMPLO}`}
          keyboardType="email-address" autoCapitalize="none" autoCorrect={false} textContentType="username" autoComplete="email" />
        <Field label="Contraseña" value={clave} onChangeText={setClave} secure autoCapitalize="none" textContentType="password"
          onSubmitEditing={entrar} returnKeyType="go" />
        <Btn title="Entrar" size="lg" onPress={entrar} loading={cargando} />
      </View>
      <View style={{ alignItems: 'center' }}>
        <LinkBtn title="¿Olvidaste tu contraseña?" onPress={() => navigation.navigate('Recover')} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Txt size={13}>¿No tienes cuenta? </Txt>
          <LinkBtn title="Crear cuenta" onPress={() => navigation.navigate('Register')} />
        </View>
      </View>
    </Screen>
  );
}
