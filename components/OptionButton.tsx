import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export default function OptionButton({ label, selected, onPress }: OptionButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        selected && styles.selectedButton
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.buttonText,
        selected && styles.selectedButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginVertical: 5,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f5f5f5',
  },
  selectedButton: {
    backgroundColor: '#FFE4E8',
    borderColor: '#FF385C',
  },
  buttonText: {
    fontSize: 16,
    color: '#666',
  },
  selectedButtonText: {
    color: '#FF385C',
    fontWeight: '600',
  },
});