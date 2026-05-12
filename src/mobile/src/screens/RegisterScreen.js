// src/screens/RegisterScreen.js — EduDer
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>RegisterScreen</Text>
      <Text style={styles.sub}>Por implementar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  title:     { fontSize: 22, fontWeight: 'bold', color: '#333' },
  sub:       { fontSize: 14, color: '#888', marginTop: 8 },
});
