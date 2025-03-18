import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface ProgressBarProps {
  progress: number;
  total: number;
}

export default function ProgressBar({ progress, total }: ProgressBarProps) {
  const width = (progress / total) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.background}>
        <Animated.View 
          style={[
            styles.progress,
            { width: `${width}%` }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  background: {
    height: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#FF385C',
    borderRadius: 4,
  },
});