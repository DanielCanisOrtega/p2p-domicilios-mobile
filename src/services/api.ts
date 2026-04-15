import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const TOKEN_KEY = "@p2p_token";


const getBaseURL = (): string => {
  /*if (__DEV__) {
    // desarrollo local
    if (Platform.OS === "web") {
      return "http://localhost:8080";
    }

    const expoHost = Constants.expoConfig?.hostUri?.split(":").shift();
    if (expoHost) {
      return `http://${expoHost}:8080`;
    }

    return "http://localhost:8080";
  } 
    ------> DESCOMENTAR PARA PROBAR LOCAL*/

  // producción (Render)
  return "https://p2p-domicilios-backend-1.onrender.com";
};

export const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
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
