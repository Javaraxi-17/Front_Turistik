// hooks/useSearchBar.ts
import { useState, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';

export const useSearchBar = () => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchBarWidth = useRef(new Animated.Value(0)).current;
  const maxSearchBarWidth = Dimensions.get('window').width * 0.85; // Limit the search bar width

  const openSearchBar = () => {
    setIsSearchVisible(true);
    Animated.timing(searchBarWidth, {
      toValue: maxSearchBarWidth,
      duration: 260,
      useNativeDriver: false,
    }).start();
  };

  const closeSearchBar = () => {
    Animated.timing(searchBarWidth, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => setIsSearchVisible(false));
  };

  return { isSearchVisible, searchQuery, setSearchQuery, openSearchBar, closeSearchBar, searchBarWidth };
};