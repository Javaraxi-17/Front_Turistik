export interface RouteMetadata {
  titulo: string;
  descripcion_general: string;
  total_duracion: string;
  total_distancia: string;
  coordenada_start: string;
  coordenada_end: string;
}

export interface PlaceInRoute {
  nombre: string;
  costo_promedio: string;
  recomendaciones: string;
  notas: string;
  coordenadas: string;
}

export interface TouristPlace {
  Place_ID?: number;
  nombre: string;
  costo_promedio: string;
  recomendaciones: string;
  notas: string;
  coordenadas: string;
}

export interface SavedRouteResponse {
  Route_ID: number;
  User_ID: number;
  Route_Name: string;
  Description: string;
  Duration: string;
  Distance: string;
  Coordinates: string;
}

export interface PlaceInRouteData {
  Route_ID: number;
  TouristPlace_ID: number;
  Order_Number: number;
}

export interface SavedPlaceResponse {
  Place_ID: number;
  Route_ID: number;
  nombre: string;
  costo_promedio: string;
  recomendaciones: string;
  notas: string;
  coordenadas: string;
  order: number;
}
