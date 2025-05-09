import Constants from 'expo-constants';
import axios from 'axios';
import * as Location from 'expo-location';
import haversine from 'haversine-distance';
import { LatLng } from 'react-native-maps';

export interface PlaceResult {
  id: string;
  name: string;
  description: string;       // «vicinity»
  rating?: number;
  vicinity: string;
  distance: string;
  location: LatLng;
  photoUrl?: string;            // foto de Google Places
}

/**
 * Obtiene los lugares cercanos al usuario con Google Places Nearby Search.
 * @param radius  Distancia en metros (por defecto 1500 m).
 * @param type    Tipo de lugar (restaurant, park, tourist_attraction, etc.).
 */
export async function getRecommendedPlaces(
  radius = 1500,
  type = 'restaurant',
  max=7
): Promise<PlaceResult[]> {
  /* 1 . Permisos de ubicación */
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return [];

  const { coords } = await Location.getCurrentPositionAsync({});
  const origin = { latitude: coords.latitude, longitude: coords.longitude };

  /* 2 . Llamada a la API de Google Places */
  const key = "aqui va la API de google"
  const { data } = await axios.get(
    'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
    {
      params: {
        location: `${origin.latitude},${origin.longitude}`,
        radius,
        type,
        rankby: 'prominence',
        key,
        language: 'es'
      }
    }
  );

  if (data.status !== 'OK') {
    console.warn('Places error:', data.status, data.error_message);
    return [];
  }

  /* 3 . Normaliza los resultados */
  return data.results.slice(0, max).map((p: any) =>{
    const loc = {
      latitude: p.geometry.location.lat,
      longitude: p.geometry.location.lng
    };
    return {
      id: p.place_id,
      name: p.name,
      description: p.vicinity,
      rating: p.rating,
      distance: (haversine(origin, loc) / 1000).toFixed(1) + ' km',
      location: loc,
      // vicinity: p.vicinity,
      photoUrl: p.photos?.[0]
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${p.photos[0].photo_reference}&key=${key}`
        : undefined
    } as PlaceResult;
  });
}
