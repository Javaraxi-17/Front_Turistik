import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { toast } from 'sonner-native';

const OptionButton = ({ selected, onPress, icon, label }) => (
  <TouchableOpacity 
    style={[styles.optionButton, selected && styles.optionButtonSelected]}
    onPress={onPress}
  >
    <MaterialCommunityIcons 
      name={icon} 
      size={24} 
      color={selected ? '#FF385C' : '#666'} 
    />
    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const [progress] = useState(new Animated.Value(0));
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({
    transportation: '',
    foodPreference: '',
    budget: ''
  });

  const steps = [
    {
      question: '¿Cómo prefieres moverte en tus viajes?',
      options: [
        { label: 'Caminando', icon: 'walk', value: 'walking' },
        { label: 'Auto', icon: 'car', value: 'car' },
        { label: 'Transporte público', icon: 'bus', value: 'public' },
        { label: 'Bicicleta', icon: 'bike', value: 'bike' },
        { label: 'Barco', icon: 'ship-wheel', value: 'boat' }
      ],
      key: 'transportation'
    },
    {
      question: '¿Tienes alguna preferencia gastronómica?',
      options: [
        { label: 'Sin restricciones', icon: 'food-variant', value: 'none' },
        { label: 'Vegetariano', icon: 'leaf', value: 'vegetarian' },
        { label: 'Vegano', icon: 'sprout', value: 'vegan' },
        { label: 'Cocina local', icon: 'home-variant', value: 'local' }
      ],
      key: 'foodPreference'
    },
    {
      question: '¿Cuál es tu presupuesto habitual?',
      options: [
        { label: 'Bajo', icon: 'cash', value: 'low' },
        { label: 'Medio', icon: 'cash-multiple', value: 'medium' },
        { label: 'Alto', icon: 'credit-card', value: 'high' }
      ],
      key: 'budget'
    }
  ];

  const handleSelect = (value, key) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
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
    // Aquí iría la lógica para guardar las preferencias
    toast.success('¡Preferencias guardadas correctamente!');
    navigation.navigate('TripPlanning');
  };

  const currentStepData = steps[currentStep];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Personaliza tu experiencia</Text>
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
              selected={preferences[currentStepData.key] === option.value}
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
            !preferences[currentStepData.key] && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!preferences[currentStepData.key]}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
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