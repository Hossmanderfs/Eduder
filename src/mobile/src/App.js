// src/App.js — EduDer React Native Root
// CU-02 | RF-03, RF-04 | E12 - iniciarSesion(): JWT
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import SplashScreen   from './screens/SplashScreen';
import LoginScreen    from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import RecoverScreen  from './screens/RecoverScreen';
import MenuScreen     from './screens/MenuScreen';
import LessonScreen   from './screens/LessonScreen';
import PerfilScreen   from './screens/PerfilScreen';
import RankingScreen  from './screens/RankingScreen';

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: () => {
          const icons = { Menu: '🏠', Perfil: '👤', Ranking: '🏆' };
          return <Text style={{ fontSize: 20 }}>{icons[route.name]}</Text>;
        },
        tabBarActiveTintColor: '#C8102E',
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

export default function App() {
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