// src/utils/sesion.js — EduDer
// Decide a dónde ir tras autenticarse: Tutorial la primera vez, luego Main.
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TUTORIAL_KEY = 'eduder_tutorial_visto';

export async function irAMain(navigation) {
  let visto = null;
  try { visto = await AsyncStorage.getItem(TUTORIAL_KEY); } catch { /* sin almacenamiento */ }
  navigation.replace(visto ? 'Main' : 'Tutorial');
}
