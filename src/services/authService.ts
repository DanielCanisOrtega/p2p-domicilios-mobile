import { api } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "@p2p_token";
const USER_KEY = "@p2p_user";

interface RegisterData {
  username: string;
  password: string;
  email: string;
  role: 'CLIENT' | 'DOMICILIARIO';
  nombre: string;
}

interface AuthResponse {
  token: string;
  username: string;
  email: string;
  role: 'CLIENT' | 'DOMICILIARIO';
  userId?: number;
  [key: string]: any;
}

export const authService = {
  // Registrar nuevo usuario
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/register", userData);
      const { token, ...user } = response.data;

      // Guardar token y usuario
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: "Error en el registro" };
    }
  },

  // Login
  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/login", { username, password });
      const { token, ...user } = response.data;

      // Guardar token y usuario
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: "Error en el login" };
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error("Error al hacer logout:", error);
    }
  },

  // Obtener token guardado
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error("Error al obtener token:", error);
      return null;
    }
  },

  // Obtener usuario guardado
  async getUser(): Promise<any | null> {
    try {
      const userJson = await AsyncStorage.getItem(USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      return null;
    }
  },

  // Verificar si está autenticado
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  },
};
