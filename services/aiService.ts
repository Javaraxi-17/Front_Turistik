// services/aiService.ts
import { Platform } from 'react-native';

// Para variables de entorno
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent?key=${GEMINI_API_KEY}`;

export interface GeminiContentPart {
  text: string;
}

export interface GeminiContent {
  parts: GeminiContentPart[];
}

export interface GeminiRequestBody {
  contents: GeminiContent[];
}

import { getUserAnswers } from './userAnswerService';

export async function generateItineraryAIFromPlaces(places: any[], userId: number): Promise<any> {
  // Obtener respuestas del usuario
  let preguntasConRespuesta = '';
  console.log('userId', userId);
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
  console.log('Respuestas del usuario:', preguntasConRespuesta);
  // Construir el texto de lugares
  const lugaresTexto = places.map((p, i) => `${i + 1}. ${p.name} (${p.description || p.vicinity || ''})`).join('\n');
  // Prompt detallado según instrucciones del usuario
  const prompt = `Tenemos que visitar estos destinos: ${lugaresTexto}\n\nToma en cuenta estas respuestas para elegir el mejor orden: ${preguntasConRespuesta}\n\nDevuelve solo un JSON valido, sin texto extra, con la estructura exacta:\n\n{\n  \"metadata\": {\n    \"titulo\": \"\",\n    \"descripcion_general\": \"\",\n    \"total_duracion\": \"\",\n    \"total_distancia\": \"\",\n    \"coordenada_start\": \"\",\n    \"coordenada_end\": \"\"\n  },\n  \"lugares\": {\n    \"<id>\": {\n      \"nombre\": \"\",\n      \"costo_promedio\": \"\",\n      \"recomendaciones\": \"\",\n      \"notas\": \"\",\n      \"coordenadas\": \"\"\n    },\n    ...\n  }\n}\n\nreglas:\n- El numero de entradas dentro de \"lugares\" es igual a la cantidad de destinos en {lista_lugares}.\n- Usa ids numericos consecutivos (1, 2, 3…) siguiendo la ruta mas eficiente.\n- Rellena cada campo con datos sintetizados segun la mejor ruta.\n- Solo puede responder en español.\n- La salida debe ser solo el JSON, nada mas.`;
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
    return data;
  } catch (error) {
    console.error('Error llamando a Gemini API:', error);
    throw error;
  }
}


// Ejemplo de uso:
// generateItineraryAI([
//   { parts: [{ text: 'Explain how AI works' }] }
// ]);
