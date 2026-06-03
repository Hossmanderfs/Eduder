// src/navigation/AppNavigator.js — EduDer
// CU-02 | RF-03, RF-04 | E12 - iniciarSesion(): JWT
// Configuración central de navegación extraída de App.js.
// Separa la lógica de rutas del punto de entrada de la app.
// Stack de autenticación + Tabs del usuario autenticado.
import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../theme/colors';

// Flujo de autenticación
import SplashScreen   from '../screens/SplashScreen';
import LoginScreen    from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RecoverScreen  from '../screens/RecoverScreen';

// Flujo principal
import MenuScreen    from '../screens/MenuScreen';
import LessonScreen  from '../screens/LessonScreen';
import PerfilScreen  from '../screens/PerfilScreen';
import RankingScreen from '../screens/RankingScreen';

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Tabs principales del usuario autenticado ─────────────────────────────────
// RF-04: pantallas accesibles tras login exitoso
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: () => {
          const iconos = { Menu: '🏠', Perfil: '👤', Ranking: '🏆' };
          return <Text style={{ fontSize: 20 }}>{iconos[route.name]}</Text>;
        },
        tabBarActiveTintColor:   COLORS.rojo,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: { paddingBottom: 4, height: 60 },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Menu"    component={MenuScreen}    options={{ title: 'Inicio' }} />
      <Tab.Screen name="Perfil"  component={PerfilScreen}  options={{ title: 'Perfil' }} />
      <Tab.Screen name="Ranking" component={RankingScreen} options={{ title: 'Ranking' }} />
    </Tab.Navigator>
  );
}

// ── Stack principal ───────────────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash"   component={SplashScreen} />
        <Stack.Screen name="Login"    component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Recover"  component={RecoverScreen} />
        <Stack.Screen name="Main"     component={MainTabs} />
        <Stack.Screen name="Lesson"   component={LessonScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
