// src/App.js — EduDer React Native Root
// CU-02 | RF-03, RF-04 | E12 - iniciarSesion(): JWT
// La navegación separa el flujo de autenticación (Auth Stack) del flujo
// de la app autenticada (Main Tabs), reflejando el Mapa de Navegación (E15).
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Flujo de autenticación — CU-01, CU-02, CU-05
import SplashScreen   from './screens/SplashScreen';
import LoginScreen    from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import RecoverScreen  from './screens/RecoverScreen';

// Flujo principal — CU-03, CU-04
import MenuScreen    from './screens/MenuScreen';
import LessonScreen  from './screens/LessonScreen';
import PerfilScreen  from './screens/PerfilScreen';
import RankingScreen from './screens/RankingScreen';

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Tabs del usuario autenticado ───────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: () => {
          const icons = { Menu: '🏠', Perfil: '👤', Ranking: '🏆' };
          return <Text style={{ fontSize: 20 }}>{icons[route.name]}</Text>;
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#9CA3AF',
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

// ── Stack principal ────────────────────────────────────────────────────────
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        {/* Splash: decide a dónde redirigir según sesión guardada */}
        <Stack.Screen name="Splash"   component={SplashScreen} />

        {/* Flujo de autenticación */}
        <Stack.Screen name="Login"    component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Recover"  component={RecoverScreen} />

        {/* App autenticada */}
        <Stack.Screen name="Main"     component={MainTabs} />
        <Stack.Screen name="Lesson"   component={LessonScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
