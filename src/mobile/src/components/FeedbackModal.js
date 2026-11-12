// src/components/FeedbackModal.js — EduDer
// CU-03 | RF-10 | Feedback inmediato tras responder un ejercicio: correcto/incorrecto + explicación.
import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import BotonPrimario from './BotonPrimario';
import { COLORS } from '../theme/colors';

export default function FeedbackModal({ visible, correcto, explicacion, respuestaCorrecta, textoBoton = 'Continuar', onContinuar }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onContinuar}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, correcto ? styles.ok : styles.mal]}>
          <Text style={styles.icono}>{correcto ? '✅' : '❌'}</Text>
          <Text style={[styles.titulo, { color: correcto ? COLORS.success : COLORS.danger }]}>
            {correcto ? '¡Correcto!' : 'Incorrecto'}
          </Text>
          {!correcto && !!explicacion && <Text style={styles.texto}>{explicacion}</Text>}
          {correcto && !!respuestaCorrecta && (
            <Text style={styles.texto}>Respuesta: {respuestaCorrecta}</Text>
          )}
          <View style={{ height: 14 }} />
          <BotonPrimario texto={textoBoton} onPress={onContinuar} color={correcto ? COLORS.success : COLORS.rojo} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { padding: 22, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  ok:  { backgroundColor: COLORS.success_light },
  mal: { backgroundColor: COLORS.danger_light },
  icono: { fontSize: 34, marginBottom: 4 },
  titulo: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
  texto: { fontSize: 15, color: COLORS.texto, lineHeight: 22 },
});
