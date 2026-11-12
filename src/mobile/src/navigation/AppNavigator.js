// src/navigation/AppNavigator.js — EduDer
// Splash → (Login | Register | Recover → ResetPassword) → Tutorial (1ª vez) → Main
// Main (tabs, como la barra del wireframe): Inicio · Niveles · Ranking · Perfil
// Inicio/Niveles → ListaLecciones → Teoria → Ejercicio (+feedback) | MiniJuego → Resumen
// Perfil → Medallas · Historial · Notificaciones (también desde la campana de Inicio)
import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigationRef } from './navigationRef';
import { useTheme, FONT } from '../theme';
import { Icon } from '../ui';

import SplashScreen from '../screens/SplashScreen';
import TutorialScreen from '../screens/TutorialScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RecoverScreen from '../screens/RecoverScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import MenuScreen from '../screens/MenuScreen';
import MapaNivelesScreen from '../screens/MapaNivelesScreen';
import ListaLeccionesScreen from '../screens/ListaLeccionesScreen';
import TeoriaScreen from '../screens/TeoriaScreen';
import EjercicioScreen from '../screens/EjercicioScreen';
import MiniJuegoScreen from '../screens/MiniJuegoScreen';
import ResumenScreen from '../screens/ResumenScreen';
import RankingScreen from '../screens/RankingScreen';
import PerfilScreen from '../screens/PerfilScreen';
import PerfilPublicoScreen from '../screens/PerfilPublicoScreen';
import MedallasScreen from '../screens/MedallasScreen';
import HistorialScreen from '../screens/HistorialScreen';
import NotificacionesScreen from '../screens/NotificacionesScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ICONOS = { Menu: 'home', NivelesTab: 'map-marker-path', Ranking: 'trophy', Perfil: 'user' };

function MainTabs() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color }) => <Icon name={ICONOS[route.name]} size={24} color={color} />,
        tabBarActiveTintColor: c.blueText,
        tabBarInactiveTintColor: c.text3,
        tabBarLabelStyle: { fontFamily: FONT.medium, fontSize: 12 },
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.line, height: 58 + insets.bottom, paddingTop: 6 },
      })}
    >
      <Tab.Screen name="Menu" component={MenuScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="NivelesTab" component={MapaNivelesScreen} options={{ title: 'Niveles' }} />
      <Tab.Screen name="Ranking" component={RankingScreen} options={{ title: 'Ranking' }} />
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { c, modo } = useTheme();
  const base = modo === 'dark' ? DarkTheme : DefaultTheme;
  const tema = { ...base, colors: { ...base.colors, background: c.surface, card: c.surface, text: c.text, border: c.line, primary: c.blue } };
  return (
    <NavigationContainer ref={navigationRef} theme={tema}>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="Tutorial" component={TutorialScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Recover" component={RecoverScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Main" component={MainTabs} options={{ animation: 'fade' }} />
        <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
        <Stack.Screen name="ListaLecciones" component={ListaLeccionesScreen} />
        <Stack.Screen name="Teoria" component={TeoriaScreen} />
        <Stack.Screen name="Ejercicio" component={EjercicioScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="MiniJuego" component={MiniJuegoScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Resumen" component={ResumenScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Medallas" component={MedallasScreen} />
        <Stack.Screen name="Historial" component={HistorialScreen} />
        <Stack.Screen name="Notificaciones" component={NotificacionesScreen} />
        <Stack.Screen name="PerfilPublico" component={PerfilPublicoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
