// hooks/usePanelAnimation.ts
import { useState, useRef } from 'react';
import { Animated } from 'react-native';

export const usePanelAnimation = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const panelAnimation = useRef(new Animated.Value(0)).current;

  // Toggle the panel open/close
  const togglePanel = () => {
    const toValue = isPanelOpen ? 0 : 1;
    setIsPanelOpen(!isPanelOpen);
    Animated.spring(panelAnimation, { toValue, useNativeDriver: false, tension: 50, friction: 7 }).start();
  };

  const placesContainerHeight = panelAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 400],
  });

  return { isPanelOpen, togglePanel, placesContainerHeight };
};