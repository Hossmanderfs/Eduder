// src/App.js — EduDer React Native Root
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens (por implementar en semanas siguientes)
import SplashScreen      from './screens/SplashScreen';
import LoginScreen       from './screens/LoginScreen';
import RegisterScreen    from './screens/RegisterScreen';
import MenuScreen        from './screens/MenuScreen';
import LessonScreen      from './screens/LessonScreen';
import PerfilScreen      from './screens/PerfilScreen';
import RankingScreen     from './screens/RankingScreen';

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

/** Tabs para usuario autenticado */
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Menu"    component={MenuScreen} />
      <Tab.Screen name="Perfil"  component={PerfilScreen} />
      <Tab.Screen name="Ranking" component={RankingScreen} />
    </Tab.Navigator>
  );
}

/** Stack principal */
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash"    component={SplashScreen} />
        <Stack.Screen name="Login"     component={LoginScreen} />
        <Stack.Screen name="Register"  component={RegisterScreen} />
        <Stack.Screen name="Main"      component={MainTabs} />
        <Stack.Screen name="Lesson"    component={LessonScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
