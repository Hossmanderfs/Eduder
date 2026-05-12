// src/screens/RecoverScreen.js — EduDer
// CU-05 | RF-19 | E12 - generar() / estaVigente() / invalidar()
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import api from '../services/api';

export default function RecoverScreen({ navigation }) {
  const [correo, setCorreo]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [enviado, setEnviado] = useState(false);

  // RF-19: envía solicitud de recuperación; el backend no revela si el correo existe
  async function handleRecover() {
    setError('');
    if (!correo.includes('@uniremington.edu.co')) {
      setError('Debes usar tu correo @uniremington.edu.co');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/recover', { correo_institucional: correo.trim().toLowerCase() });
      setEnviado(true);
    } catch {
      setError('Error al enviar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  if (enviado) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>📧</Text>
        <Text style={styles.successTitle}>Correo enviado</Text>
        <Text style={styles.successMsg}>
          Si tu correo está registrado, recibirás un enlace válido por 30 minutos.
        </Text>
        <TouchableOpacity style={styles.btnBack} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.btnBackText}>Volver al login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Recuperar contraseña</Text>
        <Text style={styles.desc}>
          Ingresa tu correo institucional y te enviaremos un enlace para restablecer tu contraseña.
        </Text>

        <Text style={styles.label}>Correo institucional</Text>
        <TextInput
          style={styles.input}
          placeholder="usuario@uniremington.edu.co"
          placeholderTextColor="#9CA3AF"
          value={correo}
          onChangeText={setCorreo}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="send"
          onSubmitEditing={handleRecover}
        />

        {error !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️  {error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.btnPrimary, loading && styles.btnDisabled]}
          onPress={handleRecover}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={styles.btnText}>Enviar enlace</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const PURPLE = '#4F46E5';
const DANGER = '#DC2626';
const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  backBtn: { marginBottom: 24 },
  backText: { color: PURPLE, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 10 },
  desc: { fontSize: 14, color: '#6B7280', marginBottom: 28, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 15, color: '#111827', borderWidth: 1, borderColor: '#E5E7EB',
  },
  errorBox: {
    backgroundColor: '#FEF2F2', borderRadius: 8, padding: 10,
    marginTop: 12, borderLeftWidth: 3, borderLeftColor: DANGER,
  },
  errorText: { fontSize: 13, color: DANGER },
  btnPrimary: {
    backgroundColor: PURPLE, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 20,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#F9FAFB' },
  successIcon: { fontSize: 56, marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 10 },
  successMsg: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  btnBack: { backgroundColor: PURPLE, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 },
  btnBackText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
