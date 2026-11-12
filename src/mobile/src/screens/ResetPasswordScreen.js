// src/screens/ResetPasswordScreen.js — CU-05 | RF-19 (segundo paso: código + nueva contraseña)
import React, { useState } from 'react';
import api from '../services/api';
import { esCorreoInstitucional, TEXTO_DOMINIOS } from '../config';
import { errorClave } from '../utils/validacion';
import { mensajeError } from '../utils/formato';
import { Screen, AppBar, Txt, Field, Btn, Banner, Empty } from '../ui';

export default function ResetPasswordScreen({ route, navigation }) {
  const [correo, setCorreo] = useState(route.params?.correo ?? '');
  const [token, setToken] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  async function enviar() {
    setError('');
    if (!esCorreoInstitucional(correo)) return setError(`Usa tu correo ${TEXTO_DOMINIOS}`);
    if (!token.trim()) return setError('Pega el código que recibiste por correo.');
    const e = errorClave(pass);
    if (e) return setError(e);
    if (pass !== pass2) return setError('Las contraseñas no coinciden.');
    setCargando(true);
    try {
      await api.post('/auth/reset-password', { correo_institucional: correo.trim().toLowerCase(), token: token.trim(), nueva_contrasena: pass });
      setOk(true);
    } catch (err) {
      setError(mensajeError(err, 'No se pudo restablecer la contraseña.'));
    } finally {
      setCargando(false);
    }
  }

  if (ok) {
    return (
      <Screen bar={<AppBar title="Contraseña actualizada" />}>
        <Empty icon="check-circle" title="Contraseña actualizada" text="Ya puedes iniciar sesión con tu nueva contraseña.">
          <Btn title="Ir a iniciar sesión" size="lg" onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })} />
        </Empty>
      </Screen>
    );
  }
  return (
    <Screen bar={<AppBar onBack={() => navigation.goBack()} title="Nueva contraseña" />}>
      <Txt size={15}>Escribe el código que llegó a tu correo y elige una contraseña nueva.</Txt>
      {error ? <Banner tone="error">{error}</Banner> : null}
      <Field label="Correo institucional" value={correo} onChangeText={setCorreo} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
      <Field label="Código de recuperación" value={token} onChangeText={setToken} autoCapitalize="none" autoCorrect={false} />
      <Field label="Nueva contraseña" value={pass} onChangeText={setPass} secure autoCapitalize="none" help="Mínimo 8 caracteres, con al menos una letra y un número." />
      <Field label="Confirmar contraseña" value={pass2} onChangeText={setPass2} secure autoCapitalize="none" />
      <Btn title="Restablecer contraseña" size="lg" onPress={enviar} loading={cargando} />
    </Screen>
  );
}
