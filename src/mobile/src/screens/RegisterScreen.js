// src/screens/RegisterScreen.js — WF-04 · Registro · CU-01 | RF-01, RF-02 | HU-01
// Validación en línea; el botón se activa solo cuando el formulario es válido.
import React, { useState } from 'react';
import { View } from 'react-native';
import { register } from '../services/auth.service';
import { irAMain } from '../utils/sesion';
import { esCorreoInstitucional, DOMINIO_EJEMPLO, TEXTO_DOMINIOS } from '../config';
import { errorClave } from '../utils/validacion';
import { Screen, AppBar, Logo, Txt, Field, Btn, Banner, LinkBtn, Row } from '../ui';
import { useTheme } from '../theme';

export default function RegisterScreen({ navigation }) {
  const { c } = useTheme();
  const [f, setF] = useState({ nombre: '', apellido: '', correo: '', clave: '', clave2: '' });
  const [tocado, setTocado] = useState({});
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
  const toca = (k) => () => setTocado((p) => ({ ...p, [k]: true }));

  const reglas = {
    nombre: (v) => (v.trim().length >= 2 ? '' : 'Escribe tu nombre.'),
    apellido: (v) => (v.trim().length >= 2 ? '' : 'Escribe tu apellido.'),
    correo: (v) => (!v.trim() ? 'Escribe tu correo institucional.' : esCorreoInstitucional(v) ? '' : `Debe terminar en ${TEXTO_DOMINIOS}`),
    clave: errorClave,
    clave2: (v) => (v && v === f.clave ? '' : 'Las contraseñas no coinciden.'),
  };
  const errs = Object.fromEntries(Object.keys(reglas).map((k) => [k, reglas[k](f[k])]));
  const valido = Object.values(errs).every((e) => !e);
  const ver = (k) => (tocado[k] ? errs[k] : '');
  const okMsg = (k, t) => (tocado[k] && !errs[k] ? t : '');

  async function enviar() {
    setError('');
    if (!valido) { setTocado({ nombre: 1, apellido: 1, correo: 1, clave: 1, clave2: 1 }); return; }
    setCargando(true);
    try {
      await register({ nombre: f.nombre.trim(), apellido: f.apellido.trim(), correo_institucional: f.correo.trim().toLowerCase(), contrasena: f.clave });
      await irAMain(navigation); // CU-01 paso 7: inicia sesión y lanza el tutorial
    } catch (err) {
      if (!err?.response) setError('No se pudo conectar con el servidor. Verifica tu red.');
      else setError(err.response.data?.message || 'No se pudo crear la cuenta.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <Screen bar={<AppBar onBack={() => navigation.goBack()} title="" />}>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Logo size={52} />
        <Txt w="semibold" size={24} accessibilityRole="header">Crear cuenta</Txt>
        <Txt size={13} color={c.text2}>Usa tu correo institucional de Uniremington.</Txt>
      </View>
      {error ? <Banner tone="error">{error}</Banner> : null}
      <View style={{ gap: 14 }}>
        <Row style={{ alignItems: 'flex-start' }}>
          <Field style={{ flex: 1 }} label="Nombre" value={f.nombre} onChangeText={set('nombre')} onBlur={toca('nombre')} error={ver('nombre')} autoComplete="given-name" />
          <Field style={{ flex: 1 }} label="Apellido" value={f.apellido} onChangeText={set('apellido')} onBlur={toca('apellido')} error={ver('apellido')} autoComplete="family-name" />
        </Row>
        <Field label="Correo institucional" value={f.correo} onChangeText={set('correo')} onBlur={toca('correo')} error={ver('correo')} ok={okMsg('correo', 'Correo válido')}
          placeholder={`nombre.apellido@${DOMINIO_EJEMPLO}`} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        <Field label="Contraseña" value={f.clave} onChangeText={set('clave')} onBlur={toca('clave')} secure autoCapitalize="none"
          error={ver('clave')} ok={okMsg('clave', 'Contraseña segura')} help="Mínimo 8 caracteres, con al menos una letra y un número." />
        <Field label="Confirmar contraseña" value={f.clave2} onChangeText={set('clave2')} onBlur={toca('clave2')} secure autoCapitalize="none"
          error={ver('clave2')} ok={okMsg('clave2', 'Las contraseñas coinciden')} />
        <Btn title="Registrarse" size="lg" onPress={enviar} loading={cargando} disabled={!valido} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Txt size={13}>¿Ya tienes cuenta? </Txt>
        <LinkBtn title="Iniciar sesión" onPress={() => navigation.replace('Login')} />
      </View>
    </Screen>
  );
}
