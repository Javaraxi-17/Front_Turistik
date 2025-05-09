import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'preferences' | 'trip'>('preferences');

  const [onboardingQuestions, setOnboardingQuestions] = useState([
    {
      question: '¿Cómo prefieres moverte en tus viajes?',
      options: ['Caminando', 'Auto', 'Transporte público', 'Bicicleta', 'Barco'],
      enabled: true
    },
    {
      question: '¿Tienes alguna preferencia gastronómica?',
      options: ['Sin restricciones', 'Vegetariano', 'Vegano', 'Cocina local'],
      enabled: true
    },
    {
      question: '¿Cuál es tu presupuesto habitual?',
      options: ['Bajo', 'Medio', 'Alto'],
      enabled: true
    }
  ]);

  const [tripQuestions, setTripQuestions] = useState([
    {
      question: '¿Cuánto tiempo tienes disponible para este viaje?',
      options: ['Menos de 4 horas', 'Medio día', 'Un día completo', 'Más de un día'],
      enabled: true
    },
    {
      question: '¿Viajas solo o acompañado?',
      options: ['Solo', 'En pareja', 'En familia', 'Con amigos'],
      enabled: true
    },
    {
      question: '¿Qué nivel de actividad física prefieres?',
      options: ['Relajado', 'Moderado', 'Intenso'],
      enabled: true
    },
    {
      question: '¿Te gustaría incluir opciones de comida?',
      options: ['Sí', 'No'],
      enabled: true
    }
  ]);

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

      <View style={[styles.tabs, isDarkMode && styles.darkTabs]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'preferences' && styles.activeTab]}
          onPress={() => setActiveTab('preferences')}
        >
          <Text style={[styles.tabText, activeTab === 'preferences' && styles.activeTabText]}>
            Preferencias
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'trip' && styles.activeTab]}
          onPress={() => setActiveTab('trip')}
        >
          <Text style={[styles.tabText, activeTab === 'trip' && styles.activeTabText]}>
            Planificación
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'preferences' ? (
          <>
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
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Preguntas de Preferencias</Text>
              {onboardingQuestions.map((item, index) => (
                <View key={index} style={[styles.questionContainer, isDarkMode && styles.darkQuestionContainer]}>
                  <View style={styles.questionHeader}>
                    <View style={styles.questionContent}>
                      <Text style={[styles.questionLabel, isDarkMode && styles.darkText]}>{item.question}</Text>
                      <Text style={[styles.optionsText, isDarkMode && styles.darkText]}>
                        {item.options.join(', ')}
                      </Text>
                    </View>
                    <Switch
                      value={item.enabled}
                      onValueChange={(value) => {
                        const newQuestions = [...onboardingQuestions];
                        newQuestions[index].enabled = value;
                        setOnboardingQuestions(newQuestions);
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={[styles.section, isDarkMode && styles.darkSection]}>
            {tripQuestions.map((item, index) => (
              <View key={index} style={[styles.questionContainer, isDarkMode && styles.darkQuestionContainer]}>
                <View style={styles.questionHeader}>
                  <View style={styles.questionContent}>
                    <Text style={[styles.questionLabel, isDarkMode && styles.darkText]}>{item.question}</Text>
                    <Text style={[styles.optionsText, isDarkMode && styles.darkText]}>
                      {item.options.join(', ')}
                    </Text>
                  </View>
                  <Switch
                    value={item.enabled}
                    onValueChange={(value) => {
                      const newQuestions = [...tripQuestions];
                      newQuestions[index].enabled = value;
                      setTripQuestions(newQuestions);
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
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