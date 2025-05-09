import { API_ROUTES, COMMON_HEADERS, API_TIMEOUTS } from '../config/api';
import { Question, Questions } from '@/types/question.types';

// Obtener todas las preguntas
export const fetchQuestions = async (): Promise<Questions> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUTS.MEDIUM);

  try {
    const response = await fetch(API_ROUTES.QUESTIONS, {
      method: 'GET',
      headers: COMMON_HEADERS,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener preguntas');
    }

    const data: Questions = await response.json();
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('La conexión al servidor ha tomado demasiado tiempo. Verifica tu conexión a internet o inténtalo más tarde.');
    }
    throw error;
  }
};

// Obtener una pregunta por ID
export const fetchQuestionById = async (id: number): Promise<Question> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUTS.MEDIUM);

  try {
    const response = await fetch(`${API_ROUTES.QUESTIONS}/${id}`, {
      method: 'GET',
      headers: COMMON_HEADERS,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener la pregunta');
    }

    const data: Question = await response.json();
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('La conexión al servidor ha tomado demasiado tiempo. Verifica tu conexión a internet o inténtalo más tarde.');
    }
    throw error;
  }
};

// Crear una nueva pregunta
export const createQuestion = async (question: Omit<Question, 'Question_ID' | 'Date_Created'>): Promise<Question> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUTS.MEDIUM);

  try {
    const response = await fetch(API_ROUTES.QUESTIONS, {
      method: 'POST',
      headers: COMMON_HEADERS,
      body: JSON.stringify(question),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear la pregunta');
    }

    const data: Question = await response.json();
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('La conexión al servidor ha tomado demasiado tiempo. Verifica tu conexión a internet o inténtalo más tarde.');
    }
    throw error;
  }
};

// Actualizar una pregunta existente
export const updateQuestion = async (id: number, question: Partial<Question>): Promise<Question> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUTS.MEDIUM);

  try {
    const response = await fetch(`${API_ROUTES.QUESTIONS}/${id}`, {
      method: 'PUT',
      headers: COMMON_HEADERS,
      body: JSON.stringify(question),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar la pregunta');
    }

    const data: Question = await response.json();
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('La conexión al servidor ha tomado demasiado tiempo. Verifica tu conexión a internet o inténtalo más tarde.');
    }
    throw error;
  }
};

// Eliminar una pregunta
export const deleteQuestion = async (id: number): Promise<void> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUTS.MEDIUM);

  try {
    const response = await fetch(`${API_ROUTES.QUESTIONS}/${id}`, {
      method: 'DELETE',
      headers: COMMON_HEADERS,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar la pregunta');
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('La conexión al servidor ha tomado demasiado tiempo. Verifica tu conexión a internet o inténtalo más tarde.');
    }
    throw error;
  }
};
