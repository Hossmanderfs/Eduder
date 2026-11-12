// src/screens/RecoverScreen.js — WF-06 · Recuperar contraseña · CU-05 | RF-19
import React, { useState } from 'react';
import { View } from 'react-native';
import api from '../services/api';
import { esCorreoInstitucional, DOMINIO_EJEMPLO, TEXTO_DOMINIOS } from '../config';
import { mensajeError } from '../utils/formato';
import { Screen, AppBar, Txt, Field, Btn, Banner, LinkBtn, Icon } from '../ui';
import { useTheme } from '../theme';

export default function RecoverScreen({ navigation }) {
  const { c } = useTheme();
  const [correo, setCorreo] = useState('');
  const [errorCampo, setErrorCampo] = useState('');
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function enviar() {
    setError('');
    const v = correo.trim().toLowerCase();
    if (!esCorreoInstitucional(v)) { setErrorCampo(`Debe terminar en ${TEXTO_DOMINIOS}`); return; }
    setErrorCampo('');
    setCargando(true);
    try {
      await api.post('/auth/recover', { correo_institucional: v });
      setEnviado(true); // respuesta genérica: no revela si el correo existe (RF-19)
    } catch (err) {
      setError(mensajeError(err, 'No se pudo enviar el enlace.'));
    } finally {
      setCargando(false);
    }
  }

  return (
    <Screen bar={<AppBar onBack={() => navigation.goBack()} title="Recuperar contraseña" />}>
      <View style={{ gap: 10 }}>
        <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: c.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="mail" size={28} color={c.blueText} />
        </View>
        <Txt size={16}>Ingresa tu correo institucional y te enviaremos un código de recuperación.</Txt>
        <Txt size={12} color={c.text3}>El código vence en 30 minutos y solo se puede usar una vez.</Txt>
      </View>
      {error ? <Banner tone="error">{error}</Banner> : null}
      {enviado ? (
        <>
          <Banner tone="ok" icon="mail-check">Si {correo.trim().toLowerCase()} está registrado, recibirás el código en unos minutos. Revisa también la carpeta de spam.</Banner>
          <Btn title="Ya tengo el código" size="lg" onPress={() => navigation.navigate('ResetPassword', { correo: correo.trim().toLowerCase() })} />
        </>
      ) : (
        <View style={{ gap: 14 }}>
          <Field label="Correo institucional" value={correo} onChangeText={setCorreo} error={errorCampo} placeholder={`nombre.apellido@${DOMINIO_EJEMPLO}`}
            keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          <Btn title="Enviar código" size="lg" onPress={enviar} loading={cargando} />
        </View>
      )}
      <View style={{ alignItems: 'center' }}>
        <LinkBtn title="Volver al login" onPress={() => navigation.navigate('Login')} />
      </View>
    </Screen>
  );
}
