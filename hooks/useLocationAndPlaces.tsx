// hooks/useLocationAndPlaces.ts
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { getRecommendedPlaces, PlaceResult } from '../services/placesService';

export const useLocationAndPlaces = () => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Request user location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }

      // Get current location
      const loc = await Location.getCurrentPositionAsync({});
      const current = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setUserLocation(current);

      // Fetch recommended places
      const results = await getRecommendedPlaces();
      setPlaces(results);
      setLoading(false);
    };

    fetchData();
  }, []);

  return { userLocation, places, loading };
};