// src/screens/AdminPanelScreen.js — EduDer
// Panel de administración para el rol admin: usuarios, niveles, lecciones, ejercicios,
// medallas, KPIs y exportación CSV (RF-20 a RF-22, RF-25 a RF-28).
// Muestra el panel web servido por el backend (/panel) dentro de la app, con la sesión ya iniciada.
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
import { COLORS } from '../theme/colors';

export default function AdminPanelScreen({ navigation }) {
  const web = useRef(null);
  const [sesion, setSesion] = useState(null);
  const [error, setError]   = useState('');

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('eduder_token');
      const user  = await AsyncStorage.getItem('eduder_user');
      if (!token || !user) { navigation.replace('Login'); return; }
      setSesion({ token, user });
    })();
  }, [navigation]);

  async function cerrarSesion() {
    await AsyncStorage.multiRemove(['eduder_token', 'eduder_user']);
    navigation.replace('Login');
  }

  // El panel web guarda su sesión en localStorage: se inyecta antes de cargar la página.
  const inyectar = sesion
    ? `try{localStorage.setItem('eduder_admin_token',${JSON.stringify(sesion.token)});` +
      `localStorage.setItem('eduder_admin_user',${JSON.stringify(sesion.user)});}catch(e){} true;`
    : 'true;';

  return (
    <View style={styles.flex}>
      <StatusBar backgroundColor={COLORS.rojo} barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Panel de administración</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => { setError(''); web.current?.reload(); }} style={styles.btn}>
            <Text style={styles.btnText}>↻</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={cerrarSesion} style={styles.btn}>
            <Text style={styles.btnText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {!sesion ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.rojo} /></View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.err}>No se pudo cargar el panel.{'\n'}{error}{'\n\n'}Dirección: {API_BASE_URL}/panel/</Text>
        </View>
      ) : (
        <WebView
          ref={web}
          source={{ uri: `${API_BASE_URL}/panel/` }}
          injectedJavaScriptBeforeContentLoaded={inyectar}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => <View style={styles.center}><ActivityIndicator size="large" color={COLORS.rojo} /></View>}
          onError={(e) => setError(e.nativeEvent?.description || 'Error de red')}
          onHttpError={(e) => setError(`HTTP ${e.nativeEvent?.statusCode}`)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: COLORS.rojo, paddingTop: 44, paddingBottom: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#fff', fontSize: 17, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  err: { color: COLORS.rojo, textAlign: 'center', fontSize: 14 },
});
