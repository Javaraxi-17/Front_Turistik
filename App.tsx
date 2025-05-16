import 'react-native-reanimated';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';  // SafeAreaProvider
import { Toaster } from 'sonner-native';  // Toaster para notificaciones emergentes
import { GestureHandlerRootView } from 'react-native-gesture-handler';  // Añadimos esta importación
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import FirstTimeProfileScreen from "./screens/FirstTimeProfileScreen";
import TripPreferencesScreen from "./screens/TripPreferencesScreen";
import MainScreen from './screens/MainScreen';
import SettingsScreen from './screens/SettingsScreen';
import AnswerPersonalizedQuestionScreen from './screens/AnswerPersonalizedQuestionScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Header from './components/Header';
import ItineraryResultScreen from './screens/ItineraryResultScreen';

const Stack = createNativeStackNavigator();

// Navegación para usuarios no autenticados
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ItineraryResultScreen" component={ItineraryResultScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// Navegación para usuarios autenticados
function AppStack() {
  const { colors, fonts } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        header: () => <Header />,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="FirstTimeProfile" component={FirstTimeProfileScreen} />
      <Stack.Screen name="TripPreferences" component={TripPreferencesScreen} />
      <Stack.Screen name="MainScreen" component={MainScreen} />
      <Stack.Screen name="ItineraryDetail" component={require('./screens/ItineraryDetailScreen').default} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="AnswerPersonalizedQuestion" component={AnswerPersonalizedQuestionScreen} />
      <Stack.Screen name="ItineraryResultScreen" component={ItineraryResultScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// Componente de navegación principal que decide qué stack mostrar según el estado de autenticación
function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors, fonts } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={{ dark: false, colors }}>
      <Toaster />
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={styles.container}>
        <ThemeProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,  // Aseguramos que SafeAreaProvider ocupe todo el espacio
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

