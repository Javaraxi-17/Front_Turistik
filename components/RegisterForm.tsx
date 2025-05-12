import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { toast } from 'sonner-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { registerUser } from '../services/userService';
import type { RegisterUserInput } from '../types/user';
import DateTimePicker from '@react-native-community/datetimepicker';

interface RegisterFormProps {}

export const RegisterForm: React.FC<RegisterFormProps> = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [formData, setFormData] = useState<RegisterUserInput>({
    name: '',
    email: '',
    password: '',
    birthDate: '',
    userType: 'Turista',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (field: keyof RegisterUserInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!formData.name || !formData.email || !formData.password || !confirmPassword || !formData.birthDate || !formData.userType) {
      toast.error('Por favor complete todos los campos');
      return false;
    }
    if (formData.password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return false;
    }
    // Puedes agregar validaciones adicionales aquí
    return true;
  };

  const handleSubmit = async () => {
    console.log('Form Data:', formData);
    if (!validate()) return;
    setLoading(true);
    const result = await registerUser(formData);
    setLoading(false);
    if (result.success) {
      toast.success(result.message);
      navigation.navigate('Login');
    } else {
      toast.error(result.message);
    }
  };

  // Formato para mostrar la fecha seleccionada
  const getDateLabel = () => {
    if (!formData.birthDate) return 'Fecha de nacimiento (YYYY-MM-DD)';
    return formData.birthDate;
  };

  return (
    <>
      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="account-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          value={formData.name}
          onChangeText={(text) => handleChange('name', text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="email-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="lock-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={formData.password}
          onChangeText={(text) => handleChange('password', text)}
          secureTextEntry
        />
      </View>
      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="lock-check-outline" size={24} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setShowDatePicker(true)}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="calendar" size={24} color="#666" style={styles.inputIcon} />
        <Text style={[styles.input, { color: formData.birthDate ? '#000' : '#888' }]}> 
          {getDateLabel()}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={formData.birthDate ? new Date(formData.birthDate) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={(_, selectedDate) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (selectedDate) {
              const iso = selectedDate.toISOString().split('T')[0];
              handleChange('birthDate', iso);
            }
          }}
        />
      )}
      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="account-group-outline" size={24} color="#666" style={styles.inputIcon} />
        <Picker
          selectedValue={formData.userType}
          style={{ flex: 1 }}
          onValueChange={(itemValue) => handleChange('userType', itemValue)}
        >
          <Picker.Item label="Turista" value="Turista" />
          <Picker.Item label="Guía" value="Guía" />
        </Picker>
      </View>
      <TouchableOpacity style={styles.registerButton} onPress={handleSubmit}>
        <Text style={styles.registerButtonText}>{loading ? 'Registrando...' : 'Crear Cuenta'}</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
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
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RegisterForm;
