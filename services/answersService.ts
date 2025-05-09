import { API_ROUTES, COMMON_HEADERS, API_TIMEOUTS } from '../config/api';
import { Answer } from '@/types/answers.types';

// Verificar si el usuario ya respondió todas las preguntas iniciales
export const checkMultipleUserAnswers = async (userId: number, questionIds: number[]): Promise<boolean> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUTS.MEDIUM);
  try {
    const response = await fetch(`${API_ROUTES.ANSWERS}/multiple/${userId}`, {
      method: 'POST',
      headers: COMMON_HEADERS,
      body: JSON.stringify({ question_ids: questionIds }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    // data.answers es un objeto { [questionId]: boolean }
    // Si todas son true, el usuario ya respondió todas
    return Object.values(data.answers).every(Boolean);
  } catch (error: any) {
    clearTimeout(timeoutId);
    return false;
  }
};

// Obtener todas las respuestas de un usuario
export const fetchAnswersByUser = async (userId: number): Promise<Answer[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUTS.MEDIUM);

  try {
    const response = await fetch(`${API_ROUTES.ANSWERS}/${userId}`, {
      method: 'GET',
      headers: COMMON_HEADERS,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener respuestas');
    }

    const data: Answer[] = await response.json();
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('La conexión al servidor ha tomado demasiado tiempo. Verifica tu conexión a internet o inténtalo más tarde.');
    }
    throw error;
  }
};

// Obtener una respuesta por ID
export const fetchAnswerById = async (id: number): Promise<Answer> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUTS.MEDIUM);

  try {
    const response = await fetch(`${API_ROUTES.ANSWERS}/${id}`, {
      method: 'GET',
      headers: COMMON_HEADERS,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener la respuesta');
    }

    const data: Answer = await response.json();
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('La conexión al servidor ha tomado demasiado tiempo. Verifica tu conexión a internet o inténtalo más tarde.');
    }
    throw error;
  }
};

// Guardar una respuesta
export const saveAnswer = async (answer: { User_ID: number; Question_ID: number; Answer: string }): Promise<Answer> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUTS.MEDIUM);

  try {
    const response = await fetch(API_ROUTES.ANSWERS, {
      method: 'POST',
      headers: COMMON_HEADERS,
      body: JSON.stringify(answer),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al guardar la respuesta');
    }

    const data: Answer = await response.json();
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('La conexión al servidor ha tomado demasiado tiempo. Verifica tu conexión a internet o inténtalo más tarde.');
    }
    throw error;
  }
};

// Actualizar una respuesta existente
export const updateAnswer = async (id: number, answer: Partial<Answer>): Promise<Answer> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUTS.MEDIUM);

  try {
    const response = await fetch(`${API_ROUTES.ANSWERS}/${id}`, {
      method: 'PUT',
      headers: COMMON_HEADERS,
      body: JSON.stringify(answer),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar la respuesta');
    }

    const data: Answer = await response.json();
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('La conexión al servidor ha tomado demasiado tiempo. Verifica tu conexión a internet o inténtalo más tarde.');
    }
    throw error;
  }
};

// Eliminar una respuesta
export const deleteAnswer = async (id: number): Promise<void> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUTS.MEDIUM);

  try {
    const response = await fetch(`${API_ROUTES.ANSWERS}/${id}`, {
      method: 'DELETE',
      headers: COMMON_HEADERS,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar la respuesta');
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('La conexión al servidor ha tomado demasiado tiempo. Verifica tu conexión a internet o inténtalo más tarde.');
    }
    throw error;
  }
};
