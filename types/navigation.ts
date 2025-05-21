// types/navigation.ts
export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  FirstTimeProfile: undefined;
  TripPreferences: undefined;
  MainScreen: undefined;
  ItineraryHistory: undefined;
  ItineraryDetail: { itinerary: any };
  RouteMap: {
    places: Array<{
      name: string;
      order: number;
    }>;
  };
};
