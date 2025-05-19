// Types for route metadata
export interface RouteMetadata {
    User_ID: number;
    Route_Name: string;
    Description: string;
    Duration: string;
    Distance: string;
    Coordinates: string;
  }
  
  // Types for places in route
  export interface PlaceInRoute {
    Route_ID: number;
    TouristPlace_ID: number;
    Order_Number: number;
  }
  
  export interface TouristPlace {
    Places: string;
    Raw_data: {
      costo_promedio: string;
      recomendaciones: string;
      notas: string;
      coordenadas: string;
    };
    Category: string;
    Location: string;
    Image: string;
    Coordinates: string;
  }
  
  export interface SavedRouteResponse {
    Route_ID: number;
    [key: string]: any;
  }
  
  export interface SavedPlaceResponse {
    PlacesInRoute_ID: number;
    [key: string]: any;
  }