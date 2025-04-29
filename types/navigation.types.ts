import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
    Home: undefined;
    Login: undefined;
    Register: undefined;
    FirstTimeProfile: undefined;
    TripPreferences: undefined;
    MainScreen: undefined;
};

export type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;
export type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;
export type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
export type MainScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainScreen'>; 