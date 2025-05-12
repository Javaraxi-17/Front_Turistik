// types/user.ts

export interface User {
  id?: string;
  name: string;
  email: string;
  birthDate: string;
  userType: 'Turista' | 'Guía';
}

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  birthDate: string;
  userType: 'Turista' | 'Guía';
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
