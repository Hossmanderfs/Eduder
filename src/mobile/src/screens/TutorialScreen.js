// src/screens/TutorialScreen.js — WF-07 · Tutorial de bienvenida (primer acceso) · CU-01
import React, { useRef, useState, useEffect } from 'react';
import { View, FlatList, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TUTORIAL_KEY } from '../utils/sesion';
import { Screen, Txt, Btn, LinkBtn, Icon, BottomBar } from '../ui';
import { useTheme } from '../theme';

export default function TutorialScreen({ navigation }) {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const [i, setI] = useState(0);
  const [nombre, setNombre] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem('eduder_user').then((u) => { try { setNombre(JSON.parse(u)?.nombre || ''); } catch { /* sin nombre */ } }).catch(() => {});
  }, []);

  const slides = [
    { icon: 'school', titulo: 'Bienvenido a EduDer', texto: `${nombre ? `Hola, ${nombre}. ` : ''}Aprende lógica matemática a tu ritmo, en sesiones de pocos minutos.` },
    { icon: 'puzzle', titulo: '¿Cómo funciona?', texto: 'Cada lección tiene teoría breve y ejercicios. Si te equivocas, verás la explicación paso a paso y puedes pedir hasta 2 pistas.' },
    { icon: 'flame', titulo: '¡Comienza tu primer nivel!', texto: 'Gana XP, mantén tu racha diaria y desbloquea los 5 niveles. Con 70% o más en un nivel, pasas al siguiente.' },
  ];

  async function terminar() {
    try { await AsyncStorage.setItem(TUTORIAL_KEY, '1'); } catch { /* sin almacenamiento */ }
    navigation.replace('Main');
  }
  function siguiente() {
    if (i < slides.length - 1) { ref.current?.scrollToIndex({ index: i + 1 }); setI(i + 1); } else terminar();
  }

  return (
    <Screen scroll={false} contentStyle={{ padding: 0, gap: 0 }}
      footer={<BottomBar><Btn title={i === slides.length - 1 ? 'Empezar' : 'Siguiente'} size="lg" onPress={siguiente} /></BottomBar>}>
      <View style={{ alignItems: 'flex-end', paddingHorizontal: 8 }}>
        <LinkBtn title="Omitir tutorial" onPress={terminar} />
      </View>
      <FlatList
        ref={ref} data={slides} horizontal pagingEnabled showsHorizontalScrollIndicator={false} keyExtractor={(s) => s.titulo}
        onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={{ width, padding: 28, alignItems: 'center', justifyContent: 'center', gap: 18 }}>
            <View style={{ width: 150, height: 150, borderRadius: 40, backgroundColor: c.blueSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={item.icon} size={76} color={c.blueText} />
            </View>
            <Txt w="semibold" size={26} style={{ textAlign: 'center' }} accessibilityRole="header">{item.titulo}</Txt>
            <Txt size={16} color={c.text2} style={{ textAlign: 'center' }}>{item.texto}</Txt>
          </View>
        )}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, paddingBottom: 16 }} accessibilityElementsHidden>
        {slides.map((s, k) => <View key={s.titulo} style={{ width: k === i ? 22 : 8, height: 8, borderRadius: 4, backgroundColor: k === i ? c.blue : c.lineStrong }} />)}
      </View>
    </Screen>
  );
}
