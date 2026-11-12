// src/screens/AdminPanelScreen.js — WF-14 / WF-15 · Panel de administración (rol admin)
// Usuarios, niveles, lecciones, ejercicios, medallas, KPIs y exportación CSV (RF-20 a RF-22, RF-25 a RF-28).
// Muestra el panel web servido por el backend (/panel) dentro de la app, con la sesión ya iniciada.
import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
import { Screen, AppBar, IconBtn, Txt, ErrorState } from '../ui';
import { useTheme } from '../theme';

export default function AdminPanelScreen({ navigation }) {
  const { c } = useTheme();
  const web = useRef(null);
  const [sesion, setSesion] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('eduder_token');
      const user = await AsyncStorage.getItem('eduder_user');
      if (!token || !user) { navigation.replace('Login'); return; }
      setSesion({ token, user });
    })();
  }, [navigation]);

  function salir() {
    Alert.alert('¿Cerrar sesión?', undefined, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: async () => { await AsyncStorage.multiRemove(['eduder_token', 'eduder_user']); navigation.replace('Login'); } },
    ]);
  }

  // El panel web guarda su sesión en localStorage: se inyecta antes de cargar la página.
  const inyectar = sesion
    ? `try{localStorage.setItem('eduder_admin_token',${JSON.stringify(sesion.token)});` +
      `localStorage.setItem('eduder_admin_user',${JSON.stringify(sesion.user)});}catch(e){} true;`
    : 'true;';

  const barra = (
    <AppBar onBlue title="Panel de administración" right={
      <>
        <IconBtn name="refresh" color="#fff" size={22} label="Recargar panel" onPress={() => { setError(''); web.current?.reload(); }} />
        <IconBtn name="logout" color="#fff" size={22} label="Cerrar sesión" onPress={salir} />
      </>
    } />
  );

  return (
    <Screen scroll={false} header={barra} contentStyle={{ padding: 0, gap: 0 }}>
      {!sesion ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color={c.blue} /></View>
      ) : error ? (
        <ErrorState message={`${error}\nDirección: ${API_BASE_URL}/panel/`} onRetry={() => { setError(''); web.current?.reload(); }} />
      ) : (
        <WebView
          ref={web} source={{ uri: `${API_BASE_URL}/panel/` }} injectedJavaScriptBeforeContentLoaded={inyectar}
          javaScriptEnabled domStorageEnabled startInLoadingState style={{ backgroundColor: c.surface }}
          renderLoading={() => <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size="large" color={c.blue} /></View>}
          onError={(e) => setError(e.nativeEvent?.description || 'Error de red')}
          onHttpError={(e) => setError(`HTTP ${e.nativeEvent?.statusCode}`)}
        />
      )}
    </Screen>
  );
}
