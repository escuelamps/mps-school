import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import { auth } from '../../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert('Error', 'Por favor ingresa usuario y contraseña');
      return;
    }

    setLoading(true);
    try {
      const formattedEmail = email.includes('@') ? email.trim() : `${email.trim()}@escuelamps.com`;
      await signInWithEmailAndPassword(auth, formattedEmail, password);
    } catch (error) {
      console.error(error);
      showAlert('Error de acceso', 'Credenciales inválidas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/icon.png')} style={styles.logo} />
      <Text style={styles.title}>Escuela MPS</Text>
      
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Usuario o Correo" 
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <View style={styles.passwordContainer}>
          <TextInput 
            style={styles.passwordInput} 
            placeholder="Contraseña" 
            secureTextEntry={!showPassword}
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#111" />
        ) : (
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00DE85',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    color: '#333333',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 15,
    fontSize: 16,
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    color: '#333333',
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 15,
  },
  button: {
    backgroundColor: '#00DE85',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  }
});
