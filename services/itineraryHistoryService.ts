import axios from 'axios';
import { API_BASE_URL } from '../config/api';

interface PlaceData {
  [key: string]: {
    nombre: string;
    costo_promedio: string;
    recomendaciones: string;
    notas: string;
    coordenadas: string;
  };
}

interface Place {
  id: number;
  name: string;
  data: PlaceData;
}

interface Route {
  id: number;
  name: string;
  description: string;
  duration: string;
  distance: string;
  coordinates: string;
  registration_date: string;
  user: {
    id: number;
    name: string;
  };
}

interface ItineraryHistoryItem {
  Route_ID: number;
  TouristPlace_ID: number;
  Order_Number: number;
  route: Route;
  place: Place;
}

export const getItineraryHistory = async (userId: number): Promise<ItineraryHistoryItem[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/placesInRoutes/detailed/${userId}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching itinerary history:', error);
    throw error;
  }
};
