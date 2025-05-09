import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { toast } from 'sonner-native';
import { useTheme } from '@/context/ThemeContext';
import { fetchQuestions } from '@/services/questionService';
import { Question } from '@/types/question.types';
import { saveAnswer, checkMultipleUserAnswers } from '@/services/answersService';
import { useAuth } from '@/context/AuthContext';

interface QuestionOption {
  label: string;
  icon: string;
  value: string;
}

interface ExtendedQuestion extends Question {
  Options?: QuestionOption[];
}

type RootStackParamList = {
  MainScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Answers {
  [key: string]: string | undefined;
}

// Dynamic styles factory
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
    content: {
      flex: 1,
      padding: 20,
    },
    question: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 20,
    },
    optionsContainer: {
      gap: 10,
    },
    footer: {
      padding: 20,
      borderTopWidth: 1,
    },
    nextButton: {
      padding: 15,
      borderRadius: 25,
      alignItems: 'center',
    },
    nextButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderRadius: 10,
      backgroundColor: '#f0f0f0',
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
    nextButtonDisabled: {
      opacity: 0.5,
    },
  });
}

// Opciones hardcodeadas para las tres preguntas iniciales
const hardcodedOptions: { label: string; icon: string; value: string }[][] = [
  [
    { label: 'Caminando', icon: 'walk', value: 'Caminando' },
    { label: 'Auto', icon: 'car', value: 'Auto' },
    { label: 'Transporte público', icon: 'bus', value: 'Transporte público' },
    { label: 'Bicicleta', icon: 'bike', value: 'Bicicleta' },
    { label: 'Barco', icon: 'ferry', value: 'Barco' },
  ],
  [
    { label: 'Sin restricciones', icon: 'food', value: 'Sin restricciones' },
    { label: 'Vegetariano', icon: 'leaf', value: 'Vegetariano' },
    { label: 'Vegano', icon: 'spa', value: 'Vegano' },
    { label: 'Cocina local', icon: 'silverware-fork-knife', value: 'Cocina local' },
  ],
  [
    { label: 'Bajo', icon: 'cash', value: 'Bajo' },
    { label: 'Medio', icon: 'cash-multiple', value: 'Medio' },
    { label: 'Alto', icon: 'cash-plus', value: 'Alto' },
  ],
];

export default function FirstTimeProfileScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { colors } = useTheme();
  const [questions, setQuestions] = useState<ExtendedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const styles = getStyles(colors);
  const [checkingAnswers, setCheckingAnswers] = useState(true);

  useEffect(() => {
    const checkIfUserAlreadyAnswered = async () => {
      try {
        setCheckingAnswers(true);
        setError(null);
        const allQuestions = await fetchQuestions();
        const initialQuestions = allQuestions.filter(q => q.Answer_Type === 'initial');
        setQuestions(initialQuestions);
        if (user && initialQuestions.length > 0) {
          const questionIds = initialQuestions.map(q => q.Question_ID);
          const alreadyAnswered = await checkMultipleUserAnswers(user.User_ID || user.id || user.user_id, questionIds);
          if (alreadyAnswered) {
            toast.info('Ya has respondido las preguntas iniciales.');
            navigation.reset({ index: 0, routes: [{ name: 'MainScreen' }] });
            return;
          }
        }
      } catch (err: any) {
        setError('Error al cargar preguntas.');
      } finally {
        setLoading(false);
        setCheckingAnswers(false);
      }
    };
    checkIfUserAlreadyAnswered();
  }, [user]);

  // Si quieres deshabilitar la carga de preguntas desde la API y solo usar preguntas hardcodeadas, puedes comentar el useEffect anterior y definir las preguntas aquí.
  // Por ahora, solo las opciones están hardcodeadas, las preguntas siguen viniendo de la API.

  const handleOptionSelect = (questionId: string, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleNext = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = answers[String(currentQuestion.Question_ID)];
    if (!selectedAnswer) {
      toast.error('Por favor selecciona una opción');
      return;
    }
    if (!user) {
      toast.error('Usuario no autenticado');
      return;
    }

    // Guardar la respuesta actual antes de avanzar
    try {
      const answerPayload = {
        User_ID: user.User_ID || user.id || user.user_id,
        Question_ID: currentQuestion.Question_ID,
        Answer: selectedAnswer,
      };
      console.log('Payload enviado a saveAnswer:', answerPayload);
      await saveAnswer(answerPayload);
      toast.success('Respuesta guardada correctamente');
      console.log('Respuesta guardada correctamente');
    } catch (error) {
      console.error('Error en saveAnswer:', error);
      let errorMsg = 'Error al guardar la respuesta. Intenta nuevamente.';
      if (error instanceof Error && error.message) {
        errorMsg = error.message;
      }
      toast.error(errorMsg);
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      toast.success('¡Perfil completado! Respuestas guardadas. Generando recomendaciones...');
      navigation.navigate('MainScreen');
    }
  };

  if (loading || checkingAnswers) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
        <Text style={{ color: 'red', marginTop: 50 }}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!questions.length) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
        <Text style={{ marginTop: 50 }}>No hay preguntas iniciales disponibles.</Text>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  // Usar opciones hardcodeadas según el índice de la pregunta
  const options = hardcodedOptions[currentQuestionIndex] || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.header}>
        <MaterialCommunityIcons name="compass-outline" size={40} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Personaliza tu experiencia</Text>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
        <View style={{ height: 4, backgroundColor: '#f0f0f0', borderRadius: 2 }}>
          <View style={{ height: 4, width: `${((currentQuestionIndex+1)/questions.length)*100}%`, backgroundColor: colors.primary, borderRadius: 2 }} />
        </View>
        <Text style={{ color: colors.text, marginTop: 4, textAlign: 'right', fontSize: 13 }}>
          Paso {currentQuestionIndex + 1} de {questions.length}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={[styles.question, { color: colors.text }]}>{currentQuestion.Question_Text}</Text>
        <View style={styles.optionsContainer}>
          {options.length > 0 ? (
            options.map((option: QuestionOption, index: number) => (
              <TouchableOpacity
                key={index}
                style={[styles.optionButton, answers[String(currentQuestion.Question_ID)] === option.value && styles.optionButtonSelected]}
                onPress={() => handleOptionSelect(String(currentQuestion.Question_ID), option.value)}
              >
                <MaterialCommunityIcons name={option.icon as any} size={24} color={answers[String(currentQuestion.Question_ID)] === option.value ? colors.primary : '#666'} />
                <Text style={[styles.optionText, answers[String(currentQuestion.Question_ID)] === option.value && styles.optionTextSelected]}>{option.label}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ color: '#888', marginTop: 16 }}>No hay opciones para esta pregunta.</Text>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}> 
        <TouchableOpacity 
          style={[styles.nextButton, { backgroundColor: colors.primary }, !answers[String(currentQuestion.Question_ID)] && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!answers[String(currentQuestion.Question_ID)]}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestionIndex === questions.length - 1 ? 'Finalizar' : 'Siguiente'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}