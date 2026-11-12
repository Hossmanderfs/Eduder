// src/utils/sesion.js — EduDer
// Decide a dónde ir tras autenticarse: el administrador va a su panel; el estudiante
// ve el Tutorial la primera vez y luego Main.
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TUTORIAL_KEY = 'eduder_tutorial_visto';

export async function irAMain(navigation) {
  try {
    const raw = await AsyncStorage.getItem('eduder_user');
    if (raw && JSON.parse(raw)?.rol === 'admin') {
      navigation.replace('AdminPanel');
      return;
    }
  } catch { /* sin datos de usuario: seguir como estudiante */ }
  let visto = null;
  try { visto = await AsyncStorage.getItem(TUTORIAL_KEY); } catch { /* sin almacenamiento */ }
  navigation.replace(visto ? 'Main' : 'Tutorial');
}
