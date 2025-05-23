import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
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
  // Eliminado estado de DatePicker, solo usaremos un input de texto para la fecha de nacimiento
  const [errorMessage, setErrorMessage] = useState('');
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [showCalendar, setShowCalendar] = useState(false);
  // Estado para controlar la fecha actual del calendario
  const [calendarDate, setCalendarDate] = useState<string>(new Date().toISOString().split('T')[0]);

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
    setErrorMessage(''); // Limpiar error previo
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setErrorMessage('Por favor complete todos los campos');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }
    // Validar contraseña: mínimo 8 caracteres, al menos un número y una letra
    if (!/^.*(?=.*[a-zA-Z])(?=.*\d).{8,}.*$/.test(formData.password)) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres y contener letras y números');
      return;
    }
    // Validar formato de fecha (YYYY-MM-DD)
    if (formData.birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(formData.birthDate)) {
      setErrorMessage('La fecha debe tener el formato YYYY-MM-DD');
      return;
    }
    // Validar que la fecha sea válida (no solo el formato)
    if (formData.birthDate) {
      const date = new Date(formData.birthDate);
      if (isNaN(date.getTime())) {
        setErrorMessage('La fecha ingresada no es válida');
        return;
      }
    }

    // Verificar nuevamente la disponibilidad del servidor antes de intentar registrarse
    if (serverStatus !== 'online') {
      const isAvailable = await pingServer(8000);
      
      if (!isAvailable) {
        setErrorMessage('No se puede conectar al servidor en este momento. Por favor, verifica tu conexión a internet y que el servidor esté funcionando.');
        return;
      }
      setServerStatus('online');
    }

    try {
      const birthDate = formData.birthDate || new Date().toISOString().split('T')[0];
      await register({
        Name: formData.name,
        Email: formData.email,
        Password: formData.password,
        Birth_Date: birthDate,
        User_Type: 'Usuario',
      });
      toast.success('Registro exitoso');
      // La navegación se maneja automáticamente en el App.tsx según el estado de autenticación
    } catch (err) {
      setErrorMessage('Hubo un problema al ingresar los datos, inténtelo de nuevo');
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

        {/* Mostrar error si existe */}
        {errorMessage !== '' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
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

        {/* Campo de Fecha con calendario visual */}
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="calendar" size={24} color="#666" style={styles.inputIcon} />
          <TouchableOpacity
            style={{ flex: 1, justifyContent: 'center' }}
            onPress={() => setShowCalendar(!showCalendar)}
            activeOpacity={0.8}
          >
            <Text style={{ color: formData.birthDate ? '#222' : '#999', padding: 15, fontSize: 16 }}>
              {formData.birthDate ? formData.birthDate : 'Fecha de nacimiento (YYYY-MM-DD)'}
            </Text>
          </TouchableOpacity>
        </View>
        {showCalendar && (
          <View style={styles.calendarContainer}>
            {/* Input manual para la fecha arriba del calendario */}
            <TextInput
              style={{
                borderColor: '#FF385C',
                borderWidth: 1,
                borderRadius: 8,
                margin: 10,
                padding: 10,
                fontSize: 16,
                color: '#222',
                backgroundColor: '#fff',
              }}
              placeholder="YYYY-MM-DD"
              value={formData.birthDate}
              onChangeText={text => {
                setFormData({ ...formData, birthDate: text });
              }}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              onBlur={() => {
                // Si la fecha es válida, mover el calendario a esa fecha
                if (/^\d{4}-\d{2}-\d{2}$/.test(formData.birthDate)) {
                  const date = new Date(formData.birthDate);
                  if (!isNaN(date.getTime())) {
                    setCalendarDate(formData.birthDate);
                  }
                }
              }}
            />
            <Calendar
              current={calendarDate}
              onDayPress={(day: {dateString: string}) => {
                setFormData({ ...formData, birthDate: day.dateString });
                setCalendarDate(day.dateString);
                setShowCalendar(false);
              }}
              maxDate={new Date().toISOString().split('T')[0]}
              markedDates={formData.birthDate ? { [formData.birthDate]: { selected: true, selectedColor: '#FF385C' } } : {}}
              theme={{
                selectedDayBackgroundColor: '#FF385C',
                todayTextColor: '#FF385C',
                arrowColor: '#FF385C',
                textSectionTitleColor: '#222',
                textDayFontWeight: 'bold',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: 'bold',
              }}
            />
          </View>
        )}

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
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
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