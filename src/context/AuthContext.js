import { createContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar si hay sesión guardada al iniciar la app
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    console.log('[AuthContext] Verificando estado de autenticación...');

    // Timeout de seguridad - después de 3 segundos, forzar que termine la carga
    const timeoutId = setTimeout(() => {
      console.warn('[AuthContext] Timeout - forzando fin de carga');
      setIsLoading(false);
    }, 3000);

    try {
      const savedUser = await authService.getUser();
      const token = await authService.getToken();

      console.log('[AuthContext] Usuario guardado:', savedUser);
      console.log('[AuthContext] Token existe:', !!token);

      if (savedUser && token) {
        setUser(savedUser);
        setIsAuthenticated(true);
        console.log('[AuthContext] Usuario autenticado:', savedUser.username);
      } else {
        console.log('[AuthContext] No hay sesión guardada');
      }
    } catch (error) {
      console.error("[AuthContext] Error al verificar autenticación:", error);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
      console.log('[AuthContext] Carga completada');
    }
  };

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      setUser(response);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      setUser(response);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
