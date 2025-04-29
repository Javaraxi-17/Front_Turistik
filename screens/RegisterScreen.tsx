import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { toast } from 'sonner-native';
import { useAuth } from '../context/AuthContext';
import { pingServer } from '../services/networkService';
import { API_BASE_URL } from '../config/api';
import { RegisterScreenNavigationProp } from '../types/navigation.types';

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
  });
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Verificar la disponibilidad del servidor al cargar la pantalla
  useEffect(() => {
    const checkServer = async () => {
      setServerStatus('checking');
      const isAvailable = await pingServer(8000);
      setServerStatus(isAvailable ? 'online' : 'offline');
      
      if (!isAvailable) {
        Alert.alert(
          'Problema de conexión',
          `No se puede conectar al servidor: ${API_BASE_URL}. Por favor, verifica tu conexión a internet y que el servidor esté funcionando.`,
          [{ text: 'OK' }]
        );
      }
    };
    
    checkServer();
  }, []);

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Por favor complete todos los campos');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    // Verificar nuevamente la disponibilidad del servidor antes de intentar registrarse
    if (serverStatus !== 'online') {
      const isAvailable = await pingServer(8000);
      
      if (!isAvailable) {
        Alert.alert(
          'Servidor no disponible',
          'No se puede conectar al servidor en este momento. Por favor, verifica tu conexión a internet y que el servidor esté funcionando.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Si ahora está disponible, actualizamos el estado
      setServerStatus('online');
    }

    try {
      // Obtener la fecha actual si no se proporcionó una fecha de nacimiento
      const birthDate = formData.birthDate || new Date().toISOString().split('T')[0];
      
      // Llamar al método register del contexto de autenticación
      await register({
        Name: formData.name,
        Email: formData.email,
        Password: formData.password,
        Birth_Date: birthDate,
        User_Type: 'Usuario', // Valor predeterminado para usuarios normales
      });
      
      toast.success('Registro exitoso');
      
      // La navegación se maneja automáticamente en el App.tsx según el estado de autenticación
    } catch (err) {
      // Los errores ya se manejan en el contexto de autenticación
      console.error('Error en registro:', err);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#FF385C', '#FF385C']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Cuenta</Text>
      </LinearGradient>

      <ScrollView style={styles.formContainer}>
        {/* Indicador de estado del servidor */}
        {serverStatus === 'checking' && (
          <View style={styles.serverStatusContainer}>
            <ActivityIndicator size="small" color="#FF385C" />
            <Text style={styles.serverStatusText}>Verificando conexión con el servidor...</Text>
          </View>
        )}
        
        {serverStatus === 'offline' && (
          <View style={[styles.serverStatusContainer, styles.serverOffline]}>
            <MaterialCommunityIcons name="wifi-off" size={20} color="#D32F2F" />
            <Text style={[styles.serverStatusText, styles.serverOfflineText]}>
              No se puede conectar al servidor
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="account-outline" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="email-outline" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="calendar" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Fecha de nacimiento (YYYY-MM-DD)"
            value={formData.birthDate}
            onChangeText={(text) => setFormData({...formData, birthDate: text})}
            keyboardType="numbers-and-punctuation"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock-outline" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={formData.password}
            onChangeText={(text) => setFormData({...formData, password: text})}
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock-check-outline" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={[
            styles.registerButton,
            (serverStatus === 'offline' || isLoading) && styles.disabledButton
          ]} 
          onPress={handleRegister}
          disabled={serverStatus === 'offline' || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.registerButtonText}>Crear Cuenta</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Inicia Sesión</Text>
          </TouchableOpacity>
        </View>
        
        {/* Información de depuración */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>URL del servidor: {API_BASE_URL}</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    height: 120,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  serverStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  serverOffline: {
    backgroundColor: '#FFEFEF',
    borderWidth: 1,
    borderColor: '#FF8888',
  },
  serverStatusText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  serverOfflineText: {
    color: '#D32F2F',
  },
  errorContainer: {
    backgroundColor: '#FFEFEF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF8888',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 15,
    padding: 5,
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#FF385C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#FFB3C0',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  loginText: {
    color: '#666',
    fontSize: 16,
  },
  loginLink: {
    color: '#FF385C',
    fontSize: 16,
    fontWeight: '600',
  },
  debugContainer: {
    marginTop: 10,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  debugText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});