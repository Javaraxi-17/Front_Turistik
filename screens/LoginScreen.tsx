import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { toast } from 'sonner-native';
import { useAuth } from '../context/AuthContext';
import { checkServerAvailability, pingServer } from '../services/networkService';
import { API_BASE_URL } from '../config/api';
import ConnectionChecker from '../components/ConnectionChecker';
import { LoginScreenNavigationProp } from '../types/navigation.types';

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [showConnectionChecker, setShowConnectionChecker] = useState(false);

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

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    // Verificar nuevamente la disponibilidad del servidor antes de intentar iniciar sesión
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
      // Llamar al método login del contexto de autenticación
      await login({ 
        Email: email, 
        Password: password 
      });
      
      toast.success('Inicio de sesión exitoso');
      
      // La navegación se maneja automáticamente en el App.tsx según el estado de autenticación
    } catch (err) {
      // Los errores ya se manejan en el contexto de autenticación
      // No es necesario hacer nada adicional aquí
      console.error('Error en inicio de sesión:', err);
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
        <Text style={styles.headerTitle}>Iniciar Sesión</Text>
      </LinearGradient>

      <View style={styles.formContainer}>
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
            <TouchableOpacity 
              style={styles.checkConnectionButton}
              onPress={() => setShowConnectionChecker(true)}
            >
              <Text style={styles.checkConnectionText}>Verificar conexión</Text>
            </TouchableOpacity>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="email-outline" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock-outline" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.loginButton,
            (serverStatus === 'offline' || isLoading) && styles.disabledButton
          ]} 
          onPress={handleLogin}
          disabled={serverStatus === 'offline' || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>¿No tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Regístrate</Text>
          </TouchableOpacity>
        </View>
        
        {/* Información de depuración */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>URL del servidor: {API_BASE_URL}</Text>
          <TouchableOpacity 
            onPress={() => setShowConnectionChecker(true)}
            style={styles.debugConnectionButton}
          >
            <Text style={styles.debugConnectionText}>Diagnosticar conexión</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal para el verificador de conexión */}
      <Modal
        visible={showConnectionChecker}
        animationType="slide"
        transparent={false}
      >
        <ConnectionChecker onClose={() => setShowConnectionChecker(false)} />
      </Modal>
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
    paddingTop: 40,
  },
  serverStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    flexWrap: 'wrap',
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
    flex: 1,
  },
  serverOfflineText: {
    color: '#D32F2F',
  },
  checkConnectionButton: {
    marginTop: 8,
    padding: 5,
    backgroundColor: '#FF385C',
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  checkConnectionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#FF385C',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#FF385C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#FFB3C0',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#666',
    fontSize: 16,
  },
  registerLink: {
    color: '#FF385C',
    fontSize: 16,
    fontWeight: '600',
  },
  debugContainer: {
    marginTop: 30,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    alignItems: 'center',
  },
  debugText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  debugConnectionButton: {
    marginTop: 10,
    padding: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  debugConnectionText: {
    fontSize: 12,
    color: '#666',
  },
});