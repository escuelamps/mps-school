import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { auth } from '../../config/firebase';

export default function AdminProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Perfil de Administrador</Text>
      <TouchableOpacity onPress={() => auth.signOut()} style={{ marginTop: 20, padding: 15, backgroundColor: '#ef4444', borderRadius: 8 }}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  text: {
    color: '#00DE85',
    fontSize: 24,
    fontWeight: 'bold',
  }
});
