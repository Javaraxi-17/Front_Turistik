import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ROUTES, COMMON_HEADERS, API_TIMEOUTS, API_BASE_URL } from '../config/api';
import { User, LoginCredentials, RegisterData } from '@/types/auth.types';

// Interfaces
export interface AuthResponse {
  token: string;
  user: User;
}

// Función para iniciar sesión
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  console.log('Iniciando login con:', JSON.stringify(credentials));
  console.log('URL de login:', API_ROUTES.LOGIN);
  
  try {
    // Usamos un controlador para el timeout que podemos abortar manualmente
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUTS.MEDIUM);
    
    const response = await fetch(API_ROUTES.LOGIN, {
      method: 'POST',
      headers: COMMON_HEADERS,
      body: JSON.stringify(credentials),
      signal: controller.signal,
    });
    
    // Limpiamos el timeout ya que la petición se completó
    clearTimeout(timeoutId);

    console.log('Respuesta recibida:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error de servidor:', errorData);
      throw new Error(errorData.message || 'Error al iniciar sesión');
    }

    const data: AuthResponse = await response.json();
    console.log('Login exitoso, datos recibidos:', JSON.stringify(data));
    
    // Guardar el token y la información del usuario en AsyncStorage
    await AsyncStorage.setItem('authToken', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    await AsyncStorage.setItem('userId', data.user.id.toString());
    return data;
  } catch (error: any) {
    // Manejo específico para errores de AbortController
    if (error.name === 'AbortError') {
      console.error('La petición de login ha excedido el tiempo límite.');
      throw new Error('La conexión al servidor ha tomado demasiado tiempo. Verifica tu conexión a internet o inténtalo más tarde.');
    }
    
    console.error('Error en login:', error);
    throw error;
  }
};

// Función para registrar un nuevo usuario
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  console.log('Iniciando registro con:', JSON.stringify(userData));
  console.log('URL de registro:', API_ROUTES.REGISTER);
  
  try {
    // Usamos un controlador para el timeout que podemos abortar manualmente
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUTS.MEDIUM);
    
    const response = await fetch(API_ROUTES.REGISTER, {
      method: 'POST',
      headers: COMMON_HEADERS,
      body: JSON.stringify(userData),
      signal: controller.signal,
    });
    
    // Limpiamos el timeout ya que la petición se completó
    clearTimeout(timeoutId);

    console.log('Respuesta recibida:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error de servidor:', errorData);
      throw new Error(errorData.message || 'Error al registrar usuario');
    }

    console.log('Registro exitoso, iniciando sesión automática');
    
    // Después del registro exitoso, iniciamos sesión automáticamente
    const loginData = await login({
      Email: userData.Email,
      Password: userData.Password,
    });
    // Guardar userId en cookie
    document.cookie = `userId=${loginData.user.id}; path=/;`;
    return loginData;
  } catch (error: any) {
    // Manejo específico para errores de AbortController
    if (error.name === 'AbortError') {
      console.error('La petición de registro ha excedido el tiempo límite.');
      throw new Error('La conexión al servidor ha tomado demasiado tiempo. Verifica tu conexión a internet o inténtalo más tarde.');
    }
    
    console.error('Error en register:', error);
    throw error;
  }
};

// Función para cerrar sesión
export const logout = async (): Promise<void> => {
  try {
    // Eliminar token y datos de usuario del AsyncStorage
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
    console.log('Sesión cerrada exitosamente');
  } catch (error) {
    console.error('Error en logout:', error);
    throw error;
  }
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return !!token;
  } catch (error) {
    console.error('Error en isAuthenticated:', error);
    return false;
  }
};

// Función para obtener el usuario actual
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  } catch (error) {
    console.error('Error en getCurrentUser:', error);
    return null;
  }
};

// Función para obtener el token actual
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error en getAuthToken:', error);
    return null;
  }
};

// Función para cambiar la contraseña
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al cambiar la contraseña');
    }
  } catch (error) {
    console.error('Error en changePassword:', error);
    throw error;
  }
}; 