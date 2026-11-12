// src/screens/ResetPasswordScreen.js — EduDer
// CU-05 | RF-19 | Restablecer contraseña con el código recibido por correo (válido 30 min).
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import api from '../services/api';
import BotonPrimario from '../components/BotonPrimario';
import ErrorBanner from '../components/ErrorBanner';
import { esCorreoInstitucional, TEXTO_DOMINIOS } from '../config';
import { COLORS } from '../theme/colors';

export default function ResetPasswordScreen({ route, navigation }) {
  const [correo, setCorreo] = useState(route.params?.correo ?? '');
  const [token, setToken] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  async function enviar() {
    setError('');
    if (!esCorreoInstitucional(correo)) return setError(`Usa tu correo ${TEXTO_DOMINIOS}`);
    if (!token.trim()) return setError('Pega el código que recibiste por correo.');
    if (pass.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
    if (pass !== pass2) return setError('Las contraseñas no coinciden.');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        correo_institucional: correo.trim().toLowerCase(),
        token: token.trim(),
        nueva_contrasena: pass,
      });
      setOk(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  }

  if (ok) return (
    <View style={styles.centro}>
      <Text style={{ fontSize: 56 }}>✅</Text>
      <Text style={styles.titulo}>Contraseña actualizada</Text>
      <Text style={styles.sub}>Ya puedes iniciar sesión con tu nueva contraseña.</Text>
      <View style={{ height: 20, alignSelf: 'stretch' }} />
      <BotonPrimario texto="Ir a iniciar sesión" onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })} />
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Volver</Text></TouchableOpacity>
        <Text style={styles.titulo}>Restablecer contraseña</Text>
        <Text style={styles.sub}>Ingresa el código que enviamos a tu correo institucional.</Text>
        <ErrorBanner mensaje={error} />
        <TextInput style={styles.input} placeholder="Correo institucional" placeholderTextColor={COLORS.muted_light} autoCapitalize="none" keyboardType="email-address" value={correo} onChangeText={setCorreo} />
        <TextInput style={styles.input} placeholder="Código recibido" placeholderTextColor={COLORS.muted_light} autoCapitalize="none" autoCorrect={false} value={token} onChangeText={setToken} />
        <TextInput style={styles.input} placeholder="Nueva contraseña (mín. 8)" placeholderTextColor={COLORS.muted_light} secureTextEntry value={pass} onChangeText={setPass} />
        <TextInput style={styles.input} placeholder="Repite la contraseña" placeholderTextColor={COLORS.muted_light} secureTextEntry value={pass2} onChangeText={setPass2} />
        <BotonPrimario texto="Cambiar contraseña" onPress={enviar} cargando={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingTop: 56 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: COLORS.bg },
  back: { color: COLORS.azul, fontWeight: '600', marginBottom: 16 },
  titulo: { fontSize: 24, fontWeight: '800', color: COLORS.texto, marginBottom: 6 },
  sub: { color: COLORS.muted, marginBottom: 18, textAlign: 'left' },
  input: { backgroundColor: COLORS.superficie, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borde, padding: 14, fontSize: 15, color: COLORS.texto, marginBottom: 12 },
});
