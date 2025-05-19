import { API_BASE_URL } from '../config/api';
import { 
  RouteMetadata, 
  PlaceInRoute, 
  TouristPlace, 
  SavedRouteResponse, 
  SavedPlaceResponse,
  PlaceInRouteData
} from '../types/route.types';
import { User } from '../types/user.types';

// Save route metadata
export async function saveRoute(metadata: RouteMetadata): Promise<SavedRouteResponse> {
  try {
    // const routeData = {
    //   User_ID: user.id,
    //   Route_Name: metadata.titulo,
    //   Description: metadata.descripcion_general,
    //   Duration: metadata.total_duracion,
    //   Distance: metadata.total_distancia,
    //   Coordinates: `${metadata.coordenada_start};${metadata.coordenada_end}`
    // };

    const response = await fetch(`${API_BASE_URL}/api/routes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(metadata)
    });
    console.log('Response:', response);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al guardar la ruta');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving route:', error);
    throw error;
  }
}

// // Save a place to a route
// export async function savePlaceToRoute(placeData: PlaceInRoute): Promise<SavedPlaceResponse> {
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/touristPlaces`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'accept': 'application/json',
//       },
//       body: JSON.stringify({
//         Places: `Route ${placeData.Route_ID} place ${placeData.order}`,
//         Raw_data: {
//           [placeData.order]: {
//             nombre: placeData.nombre,
//             costo_promedio: placeData.costo_promedio,
//             recomendaciones: placeData.recomendaciones,
//             notas: placeData.notas,
//             coordenadas: placeData.coordenadas
//           }
//         },
//         Category: 'Tourist Places',
//         Location: 'Route Places',
//         Image: '',
//         Coordinates: placeData.coordenadas
//       })
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.message || 'Error al guardar el lugar en la ruta');
//     }

//     return await response.json();

// Save multiple tourist places and return their IDs and order
export async function saveTouristPlaces(places: Record<string, PlaceInRoute>, routeId: number): Promise<{ placeIds: number[], order: number[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/touristPlaces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        Places: `Route ${routeId} places`,
        Raw_data: places,
        Category: 'Tourist Places',
        Location: 'Route Places',
        Image: '',
        Coordinates: ''
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al guardar los lugares turísticos');
    }

    const data = await response.json();
    console.log('Data:', JSON.stringify(data, null, 2));
    const placeIds = Array.isArray(data) ? data.map(p => p.TouristPlace_ID || p.TouristPlace_ID) : [data.TouristPlace_ID || data.TouristPlace_ID];
    const order = Object.keys(places).map(id => parseInt(id));
    console.log('placeIds', placeIds);
    console.log('order', order);
    return { placeIds, order };
  } catch (error) {
    console.error('Error saving tourist places:', error);
    throw error;
  }
}

// Save places to route with their order
export async function savePlacesToRoute(places: Record<string, PlaceInRoute>, routeId: number): Promise<void> {
  try {
    const placePromises = Object.entries(places).map(([id, place]) => {
      const placeData = {
        nombre: place.nombre,
        costo_promedio: place.costo_promedio,
        recomendaciones: place.recomendaciones,
        notas: place.notas,
        coordenadas: place.coordenadas,
        Route_ID: routeId,
        order: parseInt(id)
      };
      console.log('placeData', placeData);
      
      return savePlaceToRoute(placeData);
    });
    
    await Promise.all(placePromises);
  } catch (error) {
    console.error('Error saving places to route:', error);
    throw error;
  }
}

// Save places in routes
export async function savePlacesInRoutes(routeId: number, placeIds: number[], order: number[]): Promise<void> {
  try {
    const placeDataPromises = placeIds.map((placeId, index) => {
      return fetch(`${API_BASE_URL}/api/placesInRoutes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({
          Route_ID: routeId,
          TouristPlace_ID: placeId,
          Order_Number: order[index]
        })
      });
    });

    await Promise.all(placeDataPromises);
  } catch (error) {
    console.error('Error saving places in routes:', error);
    throw error;
  }
}
