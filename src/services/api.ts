import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import axios from "axios";

const TOKEN_KEY = "@p2p_token";

type ExpoExtra = {
  backendUrl?: string;
};

const getConfiguredBackendUrl = (): string | undefined => {
  const value = (Constants.expoConfig?.extra as ExpoExtra | undefined)?.backendUrl;
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
};

const getBaseURL = (): string => {
  return getConfiguredBackendUrl() || "https://p2p-domicilios-backend-1.onrender.com";
};

export const api = axios.create({
  baseURL: getBaseURL(),
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
