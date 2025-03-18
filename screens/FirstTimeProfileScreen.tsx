import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';  // Correcto aquí
import OptionButton from '../components/OptionButton';
import ProgressBar from '../components/ProgressBar';
import { toast } from 'sonner-native';

const questions = [
  {
    id: 'transportation',
    question: '¿Cómo prefieres moverte en tus viajes?',
    options: ['Caminando', 'Auto', 'Transporte público', 'Bicicleta', 'Barco']
  },
  {
    id: 'food',
    question: '¿Tienes alguna preferencia gastronómica o restricción alimentaria?',
    options: ['Sin restricciones', 'Vegetariano', 'Vegano', 'Cocina local']
  },
  {
    id: 'budget',
    question: '¿Cuál es tu presupuesto habitual para viajar?',
    options: ['Bajo', 'Medio', 'Alto']
  }
];

export default function FirstTimeProfileScreen() {
  const navigation = useNavigation();  // Hook useNavigation aquí
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleOptionSelect = (questionId: string, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!answers[currentQuestion.id]) {
      toast.error('Por favor selecciona una opción');
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {      // Aquí guardaríamos las respuestas en la base de datos
      navigation.navigate('MainScreen');  // Navegación hacia la siguiente pantalla
      toast.success('¡Perfil completado! Generando recomendaciones...');
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="compass-outline" size={40} color="#FF385C" />
        <Text style={styles.title}>Personaliza tu experiencia</Text>
      </View>

      <ProgressBar 
        progress={currentQuestionIndex + 1} 
        total={questions.length} 
      />

      <ScrollView style={styles.content}>
        <Text style={styles.question}>{currentQuestion.question}</Text>
        
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => (
            <OptionButton
              key={option}
              label={option}
              selected={answers[currentQuestion.id] === option}
              onPress={() => handleOptionSelect(currentQuestion.id, option)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestionIndex === questions.length - 1 ? 'Finalizar' : 'Siguiente'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  nextButton: {
    backgroundColor: '#FF385C',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
