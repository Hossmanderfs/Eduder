// src/screens/RegisterScreen.js — EduDer
// CU-01 | RF-01, RF-02 | E12 - registrar()
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
  ScrollView,
} from 'react-native';
import { register } from '../services/auth.service';
import { COLORS } from '../theme/colors';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    confirmar: '',
  });
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);

  function update(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }));
    setError('');
  }

  // ── CU-01 | RF-01, RF-02 | E12 - registrar() ─────────────────────────────
  // Valida los campos localmente y llama al servicio de registro.
  // RF-01: el backend valida que el correo termine en @uniremington.edu.co.
  // RF-02: el backend crea el PERFIL_ESTUDIANTE automáticamente al registrar.
  async function handleRegister() {
    setError('');

    if (!form.nombre.trim() || !form.apellido.trim()) {
      setError('Nombre y apellido son obligatorios.');
      return;
    }
    if (!form.correo.includes('@uniremington.edu.co')) {
      setError('Debes usar tu correo institucional @uniremington.edu.co');
      return;
    }
    if (form.contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (form.contrasena !== form.confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await register({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        correo_institucional: form.correo.trim().toLowerCase(),
        contrasena: form.contrasena,
      });
      // RF-02: tras registro exitoso, ir al menú principal (perfil ya fue creado)
      navigation.replace('Main');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al registrarse. Intenta de nuevo.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>EduDer</Text>
          <Text style={styles.subtitle}>Crea tu cuenta con tu correo institucional</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>

          {/* Nombre */}
          <Text style={styles.label}>Nombre(s)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Juan Carlos"
            placeholderTextColor="#9CA3AF"
            value={form.nombre}
            onChangeText={v => update('nombre', v)}
            autoCapitalize="words"
            returnKeyType="next"
          />

          {/* Apellido */}
          <Text style={styles.label}>Apellido(s)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Gómez Pérez"
            placeholderTextColor="#9CA3AF"
            value={form.apellido}
            onChangeText={v => update('apellido', v)}
            autoCapitalize="words"
            returnKeyType="next"
          />

          {/* Correo */}
          <Text style={styles.label}>Correo institucional</Text>
          <TextInput
            style={styles.input}
            placeholder="usuario@uniremington.edu.co"
            placeholderTextColor="#9CA3AF"
            value={form.correo}
            onChangeText={v => update('correo', v)}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="next"
          />

          {/* Contraseña */}
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passRow}>
            <TextInput
              style={[styles.input, styles.passInput]}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor="#9CA3AF"
              value={form.contrasena}
              onChangeText={v => update('contrasena', v)}
              secureTextEntry={!mostrarPass}
              returnKeyType="next"
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setMostrarPass(v => !v)}
            >
              <Text style={styles.eyeIcon}>{mostrarPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Confirmar contraseña */}
          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Repite tu contraseña"
            placeholderTextColor="#9CA3AF"
            value={form.confirmar}
            onChangeText={v => update('confirmar', v)}
            secureTextEntry={!mostrarPass}
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />

          {/* Nota de correo institucional */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              🔒  Solo se aceptan correos @uniremington.edu.co (RF-01)
            </Text>
          </View>

          {/* Error */}
          {error !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️  {error}</Text>
            </View>
          )}

          {/* Botón */}
          <TouchableOpacity
            style={[styles.btnPrimary, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Crear cuenta"
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.btnPrimaryText}>Crear cuenta</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Footer: ir a login */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes cuenta?  </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const PURPLE = COLORS.azul;
const DANGER = COLORS.rojo;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 40, fontWeight: '800', color: PURPLE, letterSpacing: 1 },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 6, textAlign: 'center' },

  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  passRow: { position: 'relative' },
  passInput: { paddingRight: 48 },
  eyeBtn: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' },
  eyeIcon: { fontSize: 18 },

  infoBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 10,
    marginTop: 14,
    borderLeftWidth: 3,
    borderLeftColor: PURPLE,
  },
  infoText: { fontSize: 12, color: '#4338CA' },

  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 10,
    marginTop: 14,
    borderLeftWidth: 3,
    borderLeftColor: DANGER,
  },
  errorText: { fontSize: 13, color: DANGER },

  btnPrimary: {
    backgroundColor: COLORS.rojo,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  footerText: { fontSize: 14, color: '#6B7280' },
  footerLink: { fontSize: 14, color: PURPLE, fontWeight: '700' },
});
