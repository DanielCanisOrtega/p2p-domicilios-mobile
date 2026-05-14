import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";

const TOKEN_KEY = "@p2p_token";

type ExpoExtra = {
  backendUrl?: string;
};

const LOCAL_BACKEND_URL = "http://localhost:8080";

const getConfiguredBackendUrl = (): string | undefined => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (typeof envUrl === "string" && envUrl.trim().length > 0) {
    return envUrl.trim();
  }

  const value = (Constants.expoConfig?.extra as ExpoExtra | undefined)?.backendUrl;
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
};

const getBaseURL = (): string => {
  const configured = getConfiguredBackendUrl();
  if (configured) {
    return configured;
  }

  return LOCAL_BACKEND_URL;
};

export const BASE_URL = getBaseURL();
console.debug('[api] baseURL =', BASE_URL);

export const api = axios.create({
  baseURL: BASE_URL,
  // Render can take longer to wake up after idle periods.
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token JWT a todas las peticiones
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error al obtener token:", error);
    }
    // Debug outgoing payloads in development
    try {
      if (config && config.url && config.method && config.data) {
        const fullUrl = `${config.baseURL}${config.url}`;
        if (fullUrl.includes('/api/orders/create')) {
          console.debug('[api] Request to create order ->', { method: config.method, url: fullUrl, data: config.data });
        }
      }
    } catch (err) {
      // ignore logging errors
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado - limpiar storage
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem("@p2p_user");
    }
    return Promise.reject(error);
  }
);
