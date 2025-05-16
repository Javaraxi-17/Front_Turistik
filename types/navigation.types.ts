import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
    Home: undefined;
    Login: undefined;
    Register: undefined;
    FirstTimeProfile: undefined;
    TripPreferences: undefined;
    MainScreen: undefined;
    Settings: undefined;
    AnswerPersonalizedQuestion: { questionId: number; questionText: string };
    ItineraryDetail: { selectedPlaces: any[] };
    ItineraryResultScreen: { aiResult: string } | undefined;
};

export type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;
export type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;
export type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
export type MainScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainScreen'>;
export type HeaderNavigationProp = NativeStackNavigationProp<RootStackParamList>; 