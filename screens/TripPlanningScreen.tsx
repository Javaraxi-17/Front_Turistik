import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { toast } from 'sonner-native';

const OptionButton = ({ selected, onPress, icon, label }: { selected: boolean; onPress: () => void; icon: string; label: string; }) => (
  <TouchableOpacity 
    style={[styles.optionButton, selected && styles.optionButtonSelected]}
    onPress={onPress}
  >
    <MaterialCommunityIcons 
      name={icon as any} 
      size={24} 
      color={selected ? '#FF385C' : '#666'} 
    />
    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function TripPlanningScreen() {
  const navigation = useNavigation();
  const [progress] = useState(new Animated.Value(0));
  const [currentStep, setCurrentStep] = useState(0);
  const [tripPreferences, setTripPreferences] = useState({
    duration: '',
    companions: '',
    activityLevel: '',
    includeFood: ''
  });

  const steps = [
    {
      question: '¿Cuánto tiempo tienes disponible para este viaje?',
      options: [
        { label: 'Menos de 4 horas', icon: 'clock-outline', value: 'short' },
        { label: 'Medio día', icon: 'clock-afternoon', value: 'half_day' },
        { label: 'Un día completo', icon: 'calendar-today', value: 'full_day' },
        { label: 'Más de un día', icon: 'calendar-week', value: 'multiple_days' }
      ],
      key: 'duration'
    },
    {
      question: '¿Viajas solo o acompañado?',
      options: [
        { label: 'Solo', icon: 'account', value: 'alone' },
        { label: 'En pareja', icon: 'account-heart', value: 'couple' },
        { label: 'En familia', icon: 'account-group', value: 'family' },
        { label: 'Con amigos', icon: 'account-multiple', value: 'friends' }
      ],
      key: 'companions'
    },
    {
      question: '¿Qué nivel de actividad física prefieres?',
      options: [
        { label: 'Relajado', icon: 'beach', value: 'relaxed' },
        { label: 'Moderado', icon: 'hiking', value: 'moderate' },
        { label: 'Intenso', icon: 'run', value: 'intense' }
      ],
      key: 'activityLevel'
    },
    {
      question: '¿Te gustaría incluir opciones de comida?',
      options: [
        { label: 'Sí', icon: 'food', value: 'yes' },
        { label: 'No', icon: 'food-off', value: 'no' }
      ],
      key: 'includeFood'
    }
  ];

  const handleSelect = (value: string, key: string) => {
    setTripPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      Animated.timing(progress, {
        toValue: (currentStep + 1) / steps.length,
        duration: 300,
        useNativeDriver: false
      }).start();
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    // Aquí iría la lógica para generar la ruta personalizada
    toast.success('¡Generando tu ruta personalizada!');
    // Navigation to route display screen would go here
  };

  const currentStepData = steps[currentStep];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Planifica tu viaje</Text>
        <View style={styles.progressContainer}>
          <Animated.View 
            style={[
              styles.progressBar,
              { width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              })}
            ]}
          />
        </View>
        <Text style={styles.stepIndicator}>
          Paso {currentStep + 1} de {steps.length}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.question}>{currentStepData.question}</Text>
        <View style={styles.optionsContainer}>
          {currentStepData.options.map((option, index) => (
            <OptionButton
              key={index}
              selected={tripPreferences[currentStepData.key as keyof typeof tripPreferences] === option.value}
              onPress={() => handleSelect(option.value, currentStepData.key)}
              icon={option.icon}
              label={option.label}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !tripPreferences[currentStepData.key as keyof typeof tripPreferences] && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!tripPreferences[currentStepData.key as keyof typeof tripPreferences]}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === steps.length - 1 ? 'Generar Ruta' : 'Siguiente'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF385C',
  },
  stepIndicator: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  optionButtonSelected: {
    backgroundColor: '#fff',
    borderColor: '#FF385C',
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
  },
  optionTextSelected: {
    color: '#FF385C',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  nextButton: {
    backgroundColor: '#FF385C',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#ffcdd2',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});