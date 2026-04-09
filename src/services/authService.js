import { api } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "@p2p_token";
const USER_KEY = "@p2p_user";

export const authService = {
  // Registrar nuevo usuario
  async register(userData) {
    try {
      const response = await api.post("/auth/register", userData);
      const { token, ...user } = response.data;

      // Guardar token y usuario
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error en el registro" };
    }
  },

  // Login
  async login(username, password) {
    try {
      const response = await api.post("/auth/login", { username, password });
      const { token, ...user } = response.data;

      // Guardar token y usuario
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Error en el login" };
    }
  },

  // Logout
  async logout() {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error("Error al hacer logout:", error);
    }
  },

  // Obtener token guardado
  async getToken() {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error("Error al obtener token:", error);
      return null;
    }
  },

  // Obtener usuario guardado
  async getUser() {
    try {
      const userJson = await AsyncStorage.getItem(USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      return null;
    }
  },

  // Verificar si está autenticado
  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  },
};
