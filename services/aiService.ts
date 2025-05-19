// services/aiService.ts
import { Platform } from 'react-native';

const AGENTE_TURISTIK_URL = process.env.EXPO_PUBLIC_AGENT_URL || process.env.AGENT_URL;
// Para variables de entorno
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${GEMINI_API_KEY}`;

export interface GeminiContentPart {
  text: string;
}

export interface GeminiContent {
  parts: GeminiContentPart[];
}

export interface GeminiRequestBody {
  contents: GeminiContent[];
}

// Types for agente_turistik API
export interface RecomendacionRequest {
  transporte: string;
  gastronomia: string;
  presupuesto: string;
  acompanado: string;
  actividad: string;
  comida: string;
}

export interface RecomendacionItem {
  place_type: string;
  probabilidad: number;
}

export interface RecomendacionResponse {
  recomendaciones: RecomendacionItem[];
  recomendacion_final: string;
}

/**
 * Extrae todos los place_type de la respuesta y retorna uno aleatorio.
 */
export function getRandomPlaceTypeFromResponse(resp: RecomendacionResponse): string | null {
  if (!resp.recomendaciones || resp.recomendaciones.length === 0) return null;
  const placeTypes = resp.recomendaciones.map(r => r.place_type);
  if (placeTypes.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * placeTypes.length);
  console.log('placeTypes', placeTypes);
  console.log('randomIndex', randomIndex);
  console.log('placeTypes[randomIndex]', placeTypes[randomIndex]);
  return placeTypes[randomIndex];
}

export async function recomendarCombinado(req: RecomendacionRequest): Promise<RecomendacionResponse> {
  try {
    const response = await fetch(AGENTE_TURISTIK_URL + '/recomendar_combinado/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transporte: req.transporte,
        gastronomia: req.gastronomia,
        presupuesto: req.presupuesto,
        acompanado: req.acompanado,
        actividad: req.actividad,
        comida: req.comida
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response:', errorData);
      throw new Error(`Error en la petición: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en recomendarCombinado:', error);
    throw error;
  }
}

import { getUserAnswers } from './userAnswerService';
import { saveRoute, saveTouristPlaces, savePlacesInRoutes } from './routeService';
import { RouteMetadata, PlaceInRoute, TouristPlace, SavedRouteResponse, SavedPlaceResponse } from '../types/route.types';


/**
 * Obtiene las respuestas del usuario, las envía al agente y retorna la respuesta.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Normaliza un string convirtiéndolo a minúsculas, eliminando tildes y caracteres especiales
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD') // Descompone los caracteres acentuados en su forma base + acento
    .replace(/[\u0300-\u036f]/g, '') // Elimina los acentos
    .replace(/ñ/g, 'n') // Reemplaza ñ por n
    .replace(/[^a-z0-9\s]/g, '') // Elimina caracteres especiales, manteniendo letras, números y espacios
    .trim();
}

export async function getRecomendacionFromUserAnswers(): Promise<any> {
  const userIdStr = await AsyncStorage.getItem('userId');
  if (!userIdStr) throw new Error('No se encontró el userId en las cookies/AsyncStorage');
  const userId = parseInt(userIdStr, 10);
  if (isNaN(userId)) throw new Error('userId inválido en AsyncStorage');
  
  // console.log('userId', userId);
  const respuestas = await getUserAnswers(userId);
  // console.log('respuestas', respuestas);
  
  // Extrae y normaliza las respuestas en orden
  const respuestas_ordenadas = respuestas.map(r => normalizeString(r.Answer || ''));
  // console.log('respuestas_ordenadas (normalizadas)', respuestas_ordenadas);
  
  // Construye el request usando el orden del array respuestas_ordenadas
  const req: RecomendacionRequest = {
    transporte: respuestas_ordenadas[0] || '',
    gastronomia: respuestas_ordenadas[1] || '',
    presupuesto: respuestas_ordenadas[2] || '',
    acompanado: respuestas_ordenadas[3] || '',
    actividad: respuestas_ordenadas[4] || '',
    comida: respuestas_ordenadas[5] || '',
  };
  
  // console.log('req (normalizado)', req);
  const recomendacion = await recomendarCombinado(req);
  
  return {
    ...recomendacion,
    respuestas_ordenadas
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface Itinerary {
  metadata: RouteMetadata;
  lugares: Record<string, PlaceInRoute>;
}

export async function generateItineraryAIFromPlaces(places: any[], userId: number): Promise<Itinerary & { routeId: number }> {
  let preguntasConRespuesta = '';
  // console.log('userId', userId);
  try {
    const respuestas = await getUserAnswers(userId);
    if (respuestas.length > 0) {
      preguntasConRespuesta = respuestas.map(
        (r) => `${r.Question_Text}: ${r.Answer}`
      ).join('; ');
    } else {
      preguntasConRespuesta = 'No hay respuestas registradas.';
    }
  } catch (err) {
    preguntasConRespuesta = 'No hay respuestas registradas.';
  }
  // console.log('Respuestas del usuario:', preguntasConRespuesta);
  // Construir el texto de lugares
  const lugaresTexto = places.map((p, i) => `${i + 1}. ${p.name} (${p.description || p.vicinity || ''})`).join('\n');
  // Prompt detallado según instrucciones del usuario
  const prompt = `Tenemos que visitar estos destinos: ${lugaresTexto}\n\nToma en cuenta estas respuestas para elegir el mejor orden: ${preguntasConRespuesta}\n\nDevuelve solo un JSON valido, sin texto extra, con la estructura exacta:\n\n{
  "metadata": {
    "titulo": "",
    "descripcion_general": "",
    "total_duracion": "",
    "total_distancia": "",
    "coordenada_start": "",
    "coordenada_end": ""
  },
  "lugares": {
    "<id>": {
      "nombre": "",
      "costo_promedio": "",
      "recomendaciones": "",
      "notas": "",
      "coordenadas": ""
    },
    ...
  }
}\n\nreglas:\n- El numero de entradas dentro de "lugares" es igual a la cantidad de destinos en {lista_lugares}.\n- Usa ids numericos consecutivos (1, 2, 3…) siguiendo la ruta mas eficiente.\n- Rellena cada campo con datos sintetizados segun la mejor ruta.\n- Solo puede responder en español.\n- La salida debe ser solo el JSON, nada mas.`;
  const body = {
    contents: [
      { parts: [{ text: prompt }] }
    ]
  };
  console.log('Prompt enviado a Gemini:', JSON.stringify(body, null, 2));
  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }
    const data = await response.json();
    // console.log('Respuesta de Gemini:', JSON.stringify(data, null, 2));
    
    // Parse the Gemini response to get the itinerary JSON
    let aiStr = data.candidates[0].content.parts[0].text.trim();
    // Elimina ```json y ``` si están presentes
    if (aiStr.startsWith('```json')) aiStr = aiStr.slice(7);
    if (aiStr.startsWith('```')) aiStr = aiStr.slice(3);
    if (aiStr.endsWith('```')) aiStr = aiStr.slice(0, -3);
    aiStr = aiStr.trim();
    const itinerary = JSON.parse(aiStr);
    
    // Save the route metadata with proper mapping
    const routeData = {
      User_ID: userId,
      Route_Name: itinerary.metadata.titulo,
      Description: itinerary.metadata.descripcion_general,
      Duration: itinerary.metadata.total_duracion,
      Distance: itinerary.metadata.total_distancia,
      Coordinates: `${itinerary.metadata.coordenada_start};${itinerary.metadata.coordenada_end}`
    };
    console.log('Datos de la ruta:', JSON.stringify(routeData, null, 2));
    const savedRoute = await saveRoute(routeData);
    console.log('Ruta guardada:', JSON.stringify(savedRoute, null, 2));
    
    // Save each place in the route
    // const placePromises = Object.entries(itinerary.lugares).map(([id, place]) => {
    //   const placeData: PlaceInRoute = {
    //     nombre: place.nombre,
    //     costo_promedio: place.costo_promedio,
    //     recomendaciones: place.recomendaciones,
    //     notas: place.notas,
    //     coordenadas: place.coordenadas
    //   };
      
    //   return savePlaceToRoute({
    //     ...placeData,
    //     Route_ID: savedRoute.Route_ID,
    //     order: parseInt(id)
    //   });
    // });
    
    // // Wait for all places to be saved
    // await Promise.all(placePromises);

    // Save tourist places first
    const { placeIds, order } = await saveTouristPlaces(itinerary.lugares, savedRoute.Route_ID);
    console.log('Lugares guardados:', JSON.stringify(placeIds, null, 2));
    console.log('Orden:', JSON.stringify(order, null, 2));
    
    // Then save places in routes with their order
    await savePlacesInRoutes(savedRoute.Route_ID, placeIds, order);
    
    // Return the saved route ID along with the itinerary
    return {
      ...data,
      routeId: savedRoute.Route_ID,
      placeIds: placeIds
    };
  } catch (error) {
    console.error('Error processing itinerary:', error);
    throw error;
  }
}
// generateItineraryAI([
//   { parts: [{ text: 'Explain how AI works' }] }
// ]);
