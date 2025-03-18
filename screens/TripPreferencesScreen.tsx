import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import OptionButton from '../components/OptionButton';
import ProgressBar from '../components/ProgressBar';
import { toast } from 'sonner-native';

const questions = [
  {
    id: 'duration',
    question: '¿Cuánto tiempo tienes disponible para este viaje?',
    options: ['Menos de 4 horas', 'Medio día', 'Un día completo', 'Más de un día']
  },
  {
    id: 'company',
    question: '¿Viajas solo o acompañado?',
    options: ['Solo', 'En pareja', 'En familia', 'Con amigos']
  },
  {
    id: 'activity',
    question: '¿Qué nivel de actividad física prefieres para este viaje?',
    options: ['Relajado', 'Moderado', 'Intenso']
  },
  {
    id: 'food',
    question: '¿Te gustaría que tu itinerario incluya opciones de comida?',
    options: ['Sí', 'No']
  }
];

export default function TripPreferencesScreen() {
  const navigation = useNavigation();
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
    } else {
      // Aquí enviaríamos las respuestas al sistema de recomendación      navigation.navigate('MainScreen');
      toast.success('¡Preferencias guardadas! Generando recomendaciones...');
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="map-marker-path" size={40} color="#FF385C" />
        <Text style={styles.title}>Planea tu viaje</Text>
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
            {currentQuestionIndex === questions.length - 1 ? 'Generar Ruta' : 'Siguiente'}
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