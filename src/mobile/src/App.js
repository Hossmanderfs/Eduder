// src/App.js — EduDer React Native Root
// Carga la tipografía Lexend (RNF-05), provee el tema claro/oscuro y la navegación.
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold } from '@expo-google-fonts/lexend';
import { ThemeProvider } from './theme';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  const [listas] = useFonts({ Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold });
  if (!listas) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#003DA5' }}><ActivityIndicator color="#fff" /></View>;
  }
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
