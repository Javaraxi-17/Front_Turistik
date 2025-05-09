/**
 * Configuración de la API
 * 
 * Este archivo contiene constantes y configuraciones para la comunicación con la API.
 * Aquí se define la URL base de la API y otros parámetros relevantes.
 */

// URL base de la API - IMPORTANTE: Ajusta esto a la dirección IP correcta de tu servidor
// Para correr en emulador Android, usa 10.0.2.2 que apunta al localhost de tu máquina
// Para correr en dispositivo real, usa la IP real de tu computadora en la red
// Para iOS puedes usar localhost o la IP real de tu computadora
export const API_BASE_URL = 'https://api-turistik-original-1015484149970.us-central1.run.app';
// Alternativas:
// - 'http://localhost:3000' (para iOS)
// - 'http://10.0.2.2:3000' (para emulador Android - apunta al localhost de tu computadora)
// - 'http://[TU-IP-REAL]:3000' (para dispositivos físicos en la misma red)

// Rutas de la API
export const API_ROUTES = {
  // Rutas de autenticación
  LOGIN: `${API_BASE_URL}/api/users/login`,
  REGISTER: `${API_BASE_URL}/api/users`,
  
  // Rutas de usuario
  USERS: `${API_BASE_URL}/api/users`,
  USER_BY_ID: (id: number) => `${API_BASE_URL}/api/users/${id}`,
  
  // Otras rutas que puedas necesitar en el futuro
  // TOURIST_PLACES: `${API_BASE_URL}/api/touristPlace`,
  // ROUTES: `${API_BASE_URL}/api/routes`,
  // etc.
};


// Timeouts para las peticiones (en milisegundos)
// Incrementado para dar más tiempo en entornos de desarrollo o conexiones lentas
export const API_TIMEOUTS = {
  SHORT: 10000,   // 10 segundos para operaciones simples
  MEDIUM: 20000,  // 20 segundos para operaciones intermedias
  LONG: 60000,    // 60 segundos para operaciones complejas
};

// Headers comunes para las peticiones
export const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Función para agregar el token de autenticación a los headers
export const getAuthHeaders = (token: string) => ({
  ...COMMON_HEADERS,
  'Authorization': `Bearer ${token}`,
}); 