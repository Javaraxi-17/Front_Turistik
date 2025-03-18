import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';  // SafeAreaProvider
import { Toaster } from 'sonner-native';  // Toaster para notificaciones emergentes
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import FirstTimeProfileScreen from "./screens/FirstTimeProfileScreen";
import TripPreferencesScreen from "./screens/TripPreferencesScreen";
import MainScreen from './screens/MainScreen';
import { Easing } from 'react-native-reanimated'; // Importa Easing para animaciones

const Stack = createNativeStackNavigator();

function RootStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,  // Ocultar los headers por defecto
        // Configuración de animaciones predefinidas para transiciones de pantallas
        transitionSpec: {
          open: {
            animation: 'timing',  // Tipo de animación
            config: {
              duration: 500,  // Duración de la animación
              easing: Easing.ease,  // Easing para la animación
            },
          },
          close: {
            animation: 'timing',  // Tipo de animación
            config: {
              duration: 500,  // Duración de la animación
              easing: Easing.ease,  // Easing para la animación
            },
          },
        },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="FirstTimeProfile" component={FirstTimeProfileScreen} />
      <Stack.Screen name="TripPreferences" component={TripPreferencesScreen} />
      <Stack.Screen name="MainScreen" component={MainScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>  {/* SafeAreaProvider aquí */}
      <NavigationContainer>  {/* Colocamos NavigationContainer aquí */}
        <Toaster />  {/* Toaster dentro de NavigationContainer */}
        <RootStack />  {/* RootStack para la navegación */}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,  // Aseguramos que SafeAreaProvider ocupe todo el espacio
  },
});

