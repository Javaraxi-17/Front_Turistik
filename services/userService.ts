// services/userService.ts
import { API_BASE_URL } from '../config/api';
import { RegisterUserInput, LoginUserInput, ApiResponse, User } from '../types/user';

// Servicio para registrar usuario
export async function registerUser(input: RegisterUserInput): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Name: input.name,
        Email: input.email,
        Password: input.password,
        Birth_Date: input.birthDate,
        User_Type: input.userType,
      }),
    });
    const data = await response.json();
    return {
      success: response.ok,
      message: data.message || (response.ok ? 'Registro exitoso' : 'Error en el registro'),
      data: data.data,
    };
  } catch (error) {
    return { success: false, message: 'Error de conexión' };
  }
}

// Servicio para login de usuario
export async function loginUser(input: LoginUserInput): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await response.json();
    return {
      success: response.ok,
      message: data.message || (response.ok ? 'Login exitoso' : 'Error en el login'),
      data: data.data,
    };
  } catch (error) {
    return { success: false, message: 'Error de conexión' };
  }
}

// Servicio para obtener perfil de usuario (requiere token, si aplica)
export async function getUserProfile(userId: string): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`);
    const data = await response.json();
    return {
      success: response.ok,
      message: data.message || (response.ok ? 'Perfil obtenido' : 'Error al obtener perfil'),
      data: data.data,
    };
  } catch (error) {
    return { success: false, message: 'Error de conexión' };
  }
}

// Servicio para actualizar perfil de usuario
export async function updateUserProfile(userId: string, update: Partial<User>): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });
    const data = await response.json();
    return {
      success: response.ok,
      message: data.message || (response.ok ? 'Perfil actualizado' : 'Error al actualizar perfil'),
      data: data.data,
    };
  } catch (error) {
    return { success: false, message: 'Error de conexión' };
  }
}
