// src/theme/index.js — EduDer
// Sistema visual basado en el frontend de referencia (css/eduder.css):
// paleta Uniremington (azul #003DA5, rojo #C8102E, dorado XP), tipografía Lexend
// (legibilidad, RNF-05) y modo claro/oscuro. Todas las pantallas usan useTheme().
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LIGHT = {
  dark: false,
  brandBlue: '#003DA5', brandRed: '#C8102E',
  page: '#E9EDF4', surface: '#FFFFFF', surface2: '#F3F5F9', surface3: '#E6EBF2',
  line: '#DCE2EB', lineStrong: '#C3CCDA',
  text: '#121A2C', text2: '#4B566C', text3: '#66708A',
  blue: '#003DA5', blueHover: '#002D7A', onBlue: '#FFFFFF', blueSoft: '#E5ECF8', blueText: '#003DA5',
  red: '#C8102E', redSoft: '#FBE8EB', redText: '#A00D24',
  gold: '#E3A82B', onGold: '#2A1C00', goldSoft: '#FCF1D8', goldText: '#7A5000',
  ok: '#1F8A52', okSoft: '#E2F4EA', okText: '#126B3D',
  err: '#D0342C', errSoft: '#FDEAE8', errText: '#AE231B',
  carne: '#003DA5', carne2: '#0B4FC2', onCarne: '#FFFFFF', onCarne2: 'rgba(255,255,255,0.82)',
};

export const DARK = {
  dark: true,
  brandBlue: '#003DA5', brandRed: '#C8102E',
  page: '#070B14', surface: '#111A2B', surface2: '#172238', surface3: '#202D47',
  line: '#26324C', lineStrong: '#364466',
  text: '#E9EDF6', text2: '#B2BBCF', text3: '#8F9AB2',
  blue: '#2F6CD8', blueHover: '#4A80E4', onBlue: '#FFFFFF', blueSoft: '#16264A', blueText: '#92B5FF',
  red: '#E1384F', redSoft: '#3A1520', redText: '#FF8E9E',
  gold: '#F0B640', onGold: '#2A1C00', goldSoft: '#33270E', goldText: '#F6CD70',
  ok: '#34A86E', okSoft: '#0F3020', okText: '#74D6A4',
  err: '#E5534B', errSoft: '#3A1614', errText: '#FF9890',
  carne: '#133071', carne2: '#1A3E8C', onCarne: '#FFFFFF', onCarne2: 'rgba(255,255,255,0.78)',
};

export const RADIUS = { s: 8, m: 12, l: 18 };
export const FONT = {
  regular: 'Lexend_400Regular', medium: 'Lexend_500Medium',
  semibold: 'Lexend_600SemiBold', bold: 'Lexend_700Bold',
};

const THEME_KEY = 'eduder_theme'; // 'light' | 'dark' | (vacío = seguir el sistema)
const Ctx = createContext({ c: LIGHT, modo: 'light', alternar: () => {} });

export function ThemeProvider({ children }) {
  const sistema = useColorScheme();
  const [forzado, setForzado] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(v => { if (v === 'light' || v === 'dark') setForzado(v); }).catch(() => {});
  }, []);

  const modo = forzado || (sistema === 'dark' ? 'dark' : 'light');
  const alternar = useCallback(() => {
    const next = modo === 'dark' ? 'light' : 'dark';
    setForzado(next);
    AsyncStorage.setItem(THEME_KEY, next).catch(() => {});
  }, [modo]);

  const value = useMemo(() => ({ c: modo === 'dark' ? DARK : LIGHT, modo, alternar }), [modo, alternar]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
