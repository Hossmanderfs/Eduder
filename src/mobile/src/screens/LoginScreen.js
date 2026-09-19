// src/screens/LoginScreen.js — EduDer
// CU-02 | RF-03, RF-04, RF-05, RF-06 | E12 - iniciarSesion() / bloquear()
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
  Alert,
} from 'react-native';
import { login } from '../services/auth.service';
import { COLORS } from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const [correo, setCorreo]       = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);

  // ── CU-02 | RF-03, RF-04, RF-05 | E12 - iniciarSesion() ─────────────────
  // Valida campos en cliente, llama al servicio de login y navega al menú.
  // Los errores de bloqueo (HTTP 429) y credenciales (HTTP 401) se muestran
  // como mensajes inline — sin Alert — para mejor UX.
  async function handleLogin() {
    setError('');

    // Validación local básica antes de llamar al backend
    if (!correo.trim()) {
      setError('Ingresa tu correo institucional.');
      return;
    }
    if (!contrasena) {
      setError('Ingresa tu contraseña.');
      return;
    }
    if (!correo.includes('@uniremington.edu.co')) {
      setError('Debes usar tu correo @uniremington.edu.co');
      return;
    }

    setLoading(true);
    try {
      // RF-03: autenticación con correo y contraseña
      await login({ correo_institucional: correo.trim().toLowerCase(), contrasena });
      // RF-04: redirigir según rol — estudiante va a Main, admin al panel web (E15)
      const usuario = data?.usuario;
      if (usuario?.rol === 'admin') {
        // El Panel Admin es una app web separada (E5 - Panel Admin React.js)
        // En producción se abriría http://localhost:5173 o la URL del panel
        navigation.replace('Main'); // fallback — admin también puede usar la app
      } else {
        navigation.replace('Main');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al iniciar sesión. Intenta de nuevo.';
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
          <Text style={styles.subtitle}>Inicia sesión con tu correo institucional</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>

          {/* Campo correo */}
          <Text style={styles.label}>Correo institucional</Text>
          <TextInput
            style={[styles.input, error && correo === '' && styles.inputError]}
            placeholder="usuario@uniremington.edu.co"
            placeholderTextColor="#9CA3AF"
            value={correo}
            onChangeText={setCorreo}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="next"
          />

          {/* Campo contraseña */}
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passRow}>
            <TextInput
              style={[styles.input, styles.passInput]}
              placeholder="Tu contraseña"
              placeholderTextColor="#9CA3AF"
              value={contrasena}
              onChangeText={setContrasena}
              secureTextEntry={!mostrarPass}
              autoComplete="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setMostrarPass(v => !v)}
              accessibilityLabel={mostrarPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              <Text style={styles.eyeIcon}>{mostrarPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Mensaje de error inline (cubre RF-05: mensaje de bloqueo) */}
          {error !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️  {error}</Text>
            </View>
          )}

          {/* Botón principal */}
          <TouchableOpacity
            style={[styles.btnPrimary, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Iniciar sesión"
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.btnPrimaryText}>Iniciar sesión</Text>
            }
          </TouchableOpacity>

          {/* Recuperar contraseña — CU-05 | RF-19 */}
          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => navigation.navigate('Recover')}
          >
            <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>

        {/* Footer: ir a registro — CU-01 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes cuenta?  </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Regístrate</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const PURPLE  = COLORS.azul;
const PURPLE_L = COLORS.azul_light;
const DANGER  = COLORS.rojo;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },

  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  // Header
  header: { alignItems: 'center', marginBottom: 36 },
  logo: {
    fontSize: 40,
    fontWeight: '800',
    color: PURPLE,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    textAlign: 'center',
  },

  // Form
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },
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
  inputError: {
    borderColor: DANGER,
  },
  passRow: { position: 'relative' },
  passInput: { paddingRight: 48 },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeIcon: { fontSize: 18 },

  // Error
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 10,
    marginTop: 14,
    borderLeftWidth: 3,
    borderLeftColor: DANGER,
  },
  errorText: { fontSize: 13, color: DANGER },

  // Botón principal
  btnPrimary: {
    backgroundColor: COLORS.rojo,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Link secundario
  linkBtn: { alignItems: 'center', marginTop: 14 },
  linkText: { fontSize: 13, color: PURPLE, fontWeight: '500' },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: { fontSize: 14, color: '#6B7280' },
  footerLink: { fontSize: 14, color: PURPLE, fontWeight: '700' },
});
