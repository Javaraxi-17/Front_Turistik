import { API_ROUTES } from '../config/api';

export interface UserAnswer {
  Answer_ID: number;
  User_ID: number;
  Question_ID: number;
  Answer: string;
  Date: string;
  UserName: string;
  Question_Text: string;
}

export async function getUserAnswers(userId: number): Promise<UserAnswer[]> {
  const response = await fetch(`${API_ROUTES.ANSWERS}/me?userId=${userId}`);
  if (!response.ok) throw new Error('No se pudieron obtener las respuestas del usuario');
  return await response.json();
}
