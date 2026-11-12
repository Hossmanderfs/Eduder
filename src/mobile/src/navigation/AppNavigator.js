// src/navigation/AppNavigator.js — EduDer
// Navegación central: stack de autenticación + tabs del estudiante + pantallas de lección.
//
// Splash → (Login | Register | Recover → ResetPassword) → Tutorial (1ª vez) → Main
// Main (tabs): Inicio · Medallas · Ranking · Avisos (con insignia) · Perfil
// Inicio → MapaNiveles → ListaLecciones → Lesson | MiniJuego → Resumen
import React, { useState, useEffect, useCallback } from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../theme/colors';
import api from '../services/api';
import { navigationRef } from './navigationRef';

import SplashScreen         from '../screens/SplashScreen';
import TutorialScreen       from '../screens/TutorialScreen';
import LoginScreen          from '../screens/LoginScreen';
import RegisterScreen       from '../screens/RegisterScreen';
import RecoverScreen        from '../screens/RecoverScreen';
import ResetPasswordScreen  from '../screens/ResetPasswordScreen';

import MenuScreen           from '../screens/MenuScreen';
import MapaNivelesScreen    from '../screens/MapaNivelesScreen';
import ListaLeccionesScreen from '../screens/ListaLeccionesScreen';
import LessonScreen         from '../screens/LessonScreen';
import MiniJuegoScreen      from '../screens/MiniJuegoScreen';
import ResumenScreen        from '../screens/ResumenScreen';
import MedallasScreen       from '../screens/MedallasScreen';
import RankingScreen        from '../screens/RankingScreen';
import NotificacionesScreen from '../screens/NotificacionesScreen';
import PerfilScreen         from '../screens/PerfilScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const ICONOS = { Menu: '🏠', Medallas: '🏅', Ranking: '🏆', Notificaciones: '🔔', Perfil: '👤' };

// RF-04: pantallas accesibles tras login exitoso
function MainTabs() {
  const [noLeidas, setNoLeidas] = useState(0);

  // RF-16: insignia con el número de notificaciones sin leer (se refresca cada minuto)
  const refrescar = useCallback(async () => {
    try {
      const res = await api.get('/notifications', { params: { solo_no_leidas: 'true', limit: 1 } });
      setNoLeidas(res.data?.no_leidas ?? 0);
    } catch { /* sin conexión: se conserva el valor anterior */ }
  }, []);

  useEffect(() => {
    refrescar();
    const t = setInterval(refrescar, 60000);
    return () => clearInterval(t);
  }, [refrescar]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>{ICONOS[route.name]}</Text>,
        tabBarActiveTintColor:   COLORS.rojo,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: { paddingBottom: 4, height: 60 },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Menu"     component={MenuScreen}     options={{ title: 'Inicio' }} />
      <Tab.Screen name="Medallas" component={MedallasScreen} options={{ title: 'Medallas' }} />
      <Tab.Screen name="Ranking"  component={RankingScreen}  options={{ title: 'Ranking' }} />
      <Tab.Screen
        name="Notificaciones"
        options={{ title: 'Avisos', tabBarBadge: noLeidas > 0 ? (noLeidas > 9 ? '9+' : noLeidas) : undefined }}
      >
        {() => <NotificacionesScreen onCambio={setNoLeidas} />}
      </Tab.Screen>
      <Tab.Screen name="Perfil"   component={PerfilScreen}   options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash"        component={SplashScreen} />
        <Stack.Screen name="Tutorial"      component={TutorialScreen} />
        <Stack.Screen name="Login"         component={LoginScreen} />
        <Stack.Screen name="Register"      component={RegisterScreen} />
        <Stack.Screen name="Recover"       component={RecoverScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Main"          component={MainTabs} />
        <Stack.Screen name="MapaNiveles"     component={MapaNivelesScreen} />
        <Stack.Screen name="ListaLecciones"  component={ListaLeccionesScreen} />
        <Stack.Screen name="Lesson"          component={LessonScreen} />
        <Stack.Screen name="MiniJuego"       component={MiniJuegoScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Resumen"         component={ResumenScreen} options={{ gestureEnabled: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
