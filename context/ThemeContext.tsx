import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { DefaultTheme } from '@react-navigation/native';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    card: string;
    border: string;
    notification: string;
  };
  fonts: typeof DefaultTheme.fonts;
}

const lightColors = {
  background: '#FFFFFF',
  text: '#000000',
  primary: '#FF385C',
  secondary: '#F7F7F7',
  card: '#FFFFFF',
  border: '#E5E5E5',
  notification: '#FF385C',
};

const darkColors = {
  background: '#121212',
  text: '#FFFFFF',
  primary: '#FF385C',
  secondary: '#1E1E1E',
  card: '#1E1E1E',
  border: '#2D2D2D',
  notification: '#FF385C',
};

const fonts = DefaultTheme.fonts;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    setIsDarkMode(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        colors,
        fonts,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
}; 