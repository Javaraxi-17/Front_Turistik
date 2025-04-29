import { API_BASE_URL } from '../config/api';

/**
 * Verifica si el servidor de la API está disponible y accesible
 * @param timeout Tiempo máximo de espera en milisegundos (por defecto 5000ms)
 * @returns Promise que resuelve true si el servidor está disponible, false en caso contrario
 */
export const checkServerAvailability = async (timeout = 5000): Promise<boolean> => {
  try {
    console.log(`Verificando disponibilidad del servidor: ${API_BASE_URL}`);
    
    // Usamos un controlador para el timeout que podemos abortar manualmente
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Intentamos hacer una petición simple al servidor
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    
    // Limpiamos el timeout ya que la petición se completó
    clearTimeout(timeoutId);
    
    console.log(`Respuesta del servidor: ${response.status}`);
    
    // Si obtenemos un código 200 o 404, consideramos que el servidor está disponible
    // (404 puede ocurrir si la ruta /api/health no existe, pero el servidor está respondiendo)
    return response.status === 200 || response.status === 404;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Timeout al verificar la disponibilidad del servidor');
    } else {
      console.error('Error al verificar la disponibilidad del servidor:', error);
    }
    return false;
  }
};

/**
 * Alternativa para verificar el servidor: usar ping
 * Esta función es más simple y puede funcionar en casos donde la anterior falla
 */
export const pingServer = async (timeout = 5000): Promise<boolean> => {
  try {
    console.log(`Ping al servidor: ${API_BASE_URL}`);
    
    // Comenzamos a medir el tiempo
    const startTime = Date.now();
    
    // Creamos una promesa que se resolverá con timeout
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), timeout);
    });
    
    // Creamos la promesa que hará el ping real
    const pingPromise = new Promise<boolean>(async (resolve) => {
      try {
        const response = await fetch(API_BASE_URL, { method: 'HEAD' });
        resolve(response.ok);
      } catch (error) {
        console.error('Error en ping:', error);
        resolve(false);
      }
    });
    
    // Competimos entre el ping y el timeout
    const result = await Promise.race([pingPromise, timeoutPromise]);
    
    const duration = Date.now() - startTime;
    console.log(`Ping completado en ${duration}ms, resultado: ${result}`);
    
    return result;
  } catch (error) {
    console.error('Error al hacer ping al servidor:', error);
    return false;
  }
}; 