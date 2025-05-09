export interface Question {
  Question_ID: number;
  Question_Text: string;
  AI_Logic: string; // Puede ser 'True' o 'False' como string, según tu ejemplo
  Answer_Type: string;
  Is_Active: boolean;
  Date_Created: string; // ISO date string
}

// Si necesitas un array tipado:
export type Questions = Question[];
