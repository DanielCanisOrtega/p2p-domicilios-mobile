import { api } from './api';

export type UserRole = 'CLIENT' | 'DOMICILIARIO' | 'ADMIN';
export type AccountAction = 'ACTIVAR' | 'DESACTIVAR' | 'SUSPENDER';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  nombre?: string;
  telefono?: string;
  numeroDocumento?: string;
  estado?: string;
  enabled: boolean;
  fechaRegistro?: string;
}

export interface DriverVerification {
  userId: number;
  domiciliarioId?: number;
  username: string;
  email: string;
  nombre?: string;
  telefono?: string;
  numeroDocumento?: string;
  estadoUsuario?: string;
  enabled?: boolean;
  verificado?: boolean;
  disponible?: boolean;
  vehiculo?: string;
  placa?: string;
}

export interface UserFilters {
  role?: UserRole;
  estado?: string;
  enabled?: boolean;
  q?: string;
}

const normalizeErrorMessage = (error: any, fallback: string) => {
  const data = error?.response?.data;
  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (data && typeof data === 'object') {
    if (typeof data.error === 'string' && data.error.trim()) {
      return data.error;
    }

    const firstEntry = Object.entries(data).find(([, value]) => typeof value === 'string' && value.trim());
    if (firstEntry) {
      const [field, message] = firstEntry;
      return `${field}: ${String(message)}`;
    }
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

export const adminService = {
  async getUsers(filters: UserFilters = {}): Promise<AdminUser[]> {
    try {
      const response = await api.get<AdminUser[]>('/admin/users', {
        params: filters,
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      throw {
        status: error?.response?.status,
        message: normalizeErrorMessage(error, 'No se pudo cargar el listado de usuarios'),
      };
    }
  },

  async updateAccountStatus(userId: number, action: AccountAction): Promise<AdminUser> {
    try {
      const response = await api.patch<AdminUser>(`/admin/users/${userId}/account-status`, { action });
      return response.data;
    } catch (error: any) {
      throw {
        status: error?.response?.status,
        message: normalizeErrorMessage(error, 'No se pudo actualizar el estado de la cuenta'),
      };
    }
  },

  async getPendingDrivers(verificado = false): Promise<DriverVerification[]> {
    try {
      const response = await api.get<DriverVerification[]>('/admin/drivers/pending', {
        params: { verificado },
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      throw {
        status: error?.response?.status,
        message: normalizeErrorMessage(error, 'No se pudo cargar la verificacion de domiciliarios'),
      };
    }
  },

  async getDriverDocuments(userId: number): Promise<DriverVerification> {
    try {
      const response = await api.get<DriverVerification>(`/admin/drivers/${userId}/documents`);
      return response.data;
    } catch (error: any) {
      throw {
        status: error?.response?.status,
        message: normalizeErrorMessage(error, 'No se pudo cargar la informacion del domiciliario'),
      };
    }
  },

  async approveDriver(userId: number): Promise<DriverVerification> {
    try {
      const response = await api.post<DriverVerification>(`/admin/drivers/${userId}/approve`);
      return response.data;
    } catch (error: any) {
      throw {
        status: error?.response?.status,
        message: normalizeErrorMessage(error, 'No se pudo aprobar el domiciliario'),
      };
    }
  },

  async rejectDriver(userId: number): Promise<DriverVerification> {
    try {
      const response = await api.post<DriverVerification>(`/admin/drivers/${userId}/reject`);
      return response.data;
    } catch (error: any) {
      throw {
        status: error?.response?.status,
        message: normalizeErrorMessage(error, 'No se pudo rechazar el domiciliario'),
      };
    }
  },
};
