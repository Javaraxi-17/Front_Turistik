import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { toast } from 'sonner-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { saveAnswer } from '@/services/answersService';

// Opciones fijas para preguntas personalizadas
const steps = [
  {
    key: 'companions',
    question: '¿Viajas solo o acompañado?',
    options: [
      { label: 'Solo', icon: 'account', value: 'Solo' },
      { label: 'Acompañado', icon: 'account-multiple', value: 'Acompañado' }
    ]
  },
  {
    key: 'activityLevel',
    question: '¿Qué nivel de actividad física prefieres?',
    options: [
      { label: 'Relajado', icon: 'beach', value: 'Relajado' },
      { label: 'Moderado', icon: 'hiking', value: 'Moderado' },
      { label: 'Intenso', icon: 'run', value: 'Intenso' }
    ]
  },
  {
    key: 'includeFood',
    question: '¿Te gustaría incluir opciones de comida?',
    options: [
      { label: 'Sí', icon: 'food', value: 'Sí' },
      { label: 'No', icon: 'food-off', value: 'No' }
    ]
  }
];

export default function AnswerPersonalizedQuestionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  // Recibimos la pregunta desde SettingsScreen
  const { questionId, questionText } = route.params as { questionId: number; questionText: string };

  // Buscar la pregunta en steps
  const step = steps.find(s => s.question === questionText);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!step) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
        <Text style={{ marginTop: 50, color: colors.text }}>No hay opciones para esta pregunta.</Text>
      </SafeAreaView>
    );
  }

  const handleSelect = (value: string) => {
    setSelected(value);
  };

  const handleSave = async () => {
    if (!selected) {
      toast.error('Por favor selecciona una opción');
      return;
    }
    if (!user) {
      toast.error('Usuario no autenticado');
      return;
    }
    setLoading(true);
    try {
      const answerPayload = {
        User_ID: user.User_ID || user.id || user.user_id,
        Question_ID: questionId,
        Answer: selected,
      };
      await saveAnswer(answerPayload);
      toast.success('Respuesta guardada correctamente');
      navigation.goBack();
    } catch (error) {
      toast.error('Error al guardar la respuesta. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.header}>
        <MaterialCommunityIcons name="account-question" size={40} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>{step.question}</Text>
      </View>
      <View style={styles.optionsContainer}>
        {step.options.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[styles.optionButton, selected === option.value && styles.optionButtonSelected]}
            onPress={() => handleSelect(option.value)}
            disabled={loading}
          >
            <MaterialCommunityIcons name={option.icon as any} size={24} color={selected === option.value ? colors.primary : '#666'} />
            <Text style={[styles.optionText, selected === option.value && styles.optionTextSelected]}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: colors.primary }, !selected && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!selected || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Guardar respuesta</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      alignItems: 'center',
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 10,
    },
    optionsContainer: {
      flex: 1,
      padding: 20,
      gap: 10,
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderRadius: 10,
      backgroundColor: '#f0f0f0',
      marginBottom: 10,
    },
    optionButtonSelected: {
      backgroundColor: colors.primary,
    },
    optionText: {
      fontSize: 16,
      marginLeft: 10,
    },
    optionTextSelected: {
      color: 'white',
    },
    saveButton: {
      padding: 15,
      borderRadius: 25,
      alignItems: 'center',
      margin: 20,
    },
    saveButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
  });
}
