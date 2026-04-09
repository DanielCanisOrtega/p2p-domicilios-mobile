import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "@p2p_token";

export const api = axios.create({
  baseURL: "http://10.0.2.2:8080", // Android emulator localhost
  // baseURL: "http://localhost:8080", // iOS simulator
  // baseURL: "http://192.168.x.x:8080", // Dispositivo físico (reemplazar con IP local)
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token JWT a todas las peticiones
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
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