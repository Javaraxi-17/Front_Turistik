import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { useTheme } from '@/context/ThemeContext';
import { fetchQuestions } from '@/services/questionService';
import { Question } from '@/types/question.types';

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDarkMode, toggleTheme } = useTheme();
  // Estado para preguntas personalized
  const [personalizedQuestions, setPersonalizedQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPersonalized = async () => {
      try {
        setLoading(true);
        setError(null);
        const allQuestions = await fetchQuestions();
        const personalized = allQuestions.filter(q => q.Answer_Type === 'personalized' && (q.Is_Active === true || q.Is_Active === 1 || q.Is_Active === '1' || q.Is_Active === 'true' || q.Is_Active === 'True'));
        setPersonalizedQuestions(personalized);
      } catch (err) {
        setError('Error al cargar preguntas personalizadas.');
      } finally {
        setLoading(false);
      }
    };
    fetchPersonalized();
  }, []);

  const handleSaveQuestions = () => {
    // Aquí iría la lógica para guardar las preguntas en el backend
    toast.success('¡Configuración guardada correctamente!');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={isDarkMode ? '#fff' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>Configuración</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.section, isDarkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Apariencia</Text>
          <View style={styles.switchContainer}>
            <Text style={[styles.switchLabel, isDarkMode && styles.darkText]}>Modo Oscuro</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
            />
          </View>
        </View>
        <View style={[styles.section, isDarkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Preguntas de Preferencias Personalizadas</Text>
          {loading ? (
            <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#FF385C'} style={{ marginTop: 20 }} />
          ) : error ? (
            <Text style={{ color: 'red', marginTop: 20 }}>{error}</Text>
          ) : personalizedQuestions.length === 0 ? (
            <Text style={{ marginTop: 20 }}>No hay preguntas personalizadas disponibles.</Text>
          ) : (
            personalizedQuestions.map((q, idx) => (
              <TouchableOpacity
                key={q.Question_ID}
                style={[styles.questionContainer, isDarkMode && styles.darkQuestionContainer, styles.questionButton]}
                onPress={() => navigation.navigate('AnswerPersonalizedQuestion', { questionId: q.Question_ID, questionText: q.Question_Text })}
                activeOpacity={0.7}
              >
                <View style={styles.questionHeader}>
                  <View style={styles.questionContent}>
                    <Text style={[styles.questionLabel, isDarkMode && styles.darkText]}>{q.Question_Text}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, isDarkMode && styles.darkFooter]}>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSaveQuestions}
        >
          <Text style={styles.saveButtonText}>
            Guardar Cambios
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
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  darkHeader: {
    borderBottomColor: '#333',
  },
  backButton: {
    marginRight: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  darkText: {
    color: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  darkTabs: {
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF385C',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#FF385C',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
  },
  darkSection: {
    backgroundColor: '#2a2a2a',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  questionContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  questionButton: {
    borderWidth: 1,
    borderColor: '#FF385C',
    marginBottom: 10,
  },
  darkQuestionContainer: {
    backgroundColor: '#333',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionContent: {
    flex: 1,
    marginRight: 15,
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  optionsText: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  darkFooter: {
    borderTopColor: '#333',
  },
  saveButton: {
    backgroundColor: '#FF385C',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 