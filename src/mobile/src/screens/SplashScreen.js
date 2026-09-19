// src/screens/SplashScreen.js — EduDer
// CU-02 | RF-03, RF-04 | E12 - iniciarSesion(): JWT
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { getStoredSession } from '../services/auth.service';
import { COLORS } from '../theme/colors';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    async function checkSession() {
      try {
        const session = await getStoredSession();
        navigation.replace(session ? 'Main' : 'Login');
      } catch {
        navigation.replace('Login');
      }
    }
    // Pequeño delay para que el splash se vea
    const t = setTimeout(checkSession, 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.rojo} barStyle="light-content" />

      {/* Logo Uniremington */}
      <View style={styles.logoBox}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetra}>E</Text>
        </View>
        <Text style={styles.logoNombre}>EduDer</Text>
        <View style={styles.divider} />
        <Text style={styles.logoUniver}>Uniremington</Text>
      </View>

      <Text style={styles.tagline}>Aprende lógica matemática{'\n'}de forma gamificada</Text>

      <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" style={{ marginTop: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.rojo,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  logoBox:     { alignItems: 'center', marginBottom: 24 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.blanco,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  logoLetra:   { fontSize: 40, fontWeight: '800', color: COLORS.rojo },
  logoNombre:  { fontSize: 36, fontWeight: '800', color: COLORS.blanco, letterSpacing: 1 },
  divider:     { width: 40, height: 2, backgroundColor: 'rgba(255,255,255,0.4)', marginVertical: 8 },
  logoUniver:  { fontSize: 14, color: 'rgba(255,255,255,0.8)', letterSpacing: 2, textTransform: 'uppercase' },
  tagline: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
