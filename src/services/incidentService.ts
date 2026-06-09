import { api } from './api';

export type IncidenciaEstado = 'PENDIENTE' | 'EN_REVISION' | 'RESUELTO' | 'RECHAZADO';

export interface Incidencia {
  id: number;
  idServicio: number;
  idCliente?: number;
  idDomiciliario?: number;
  descripcion: string;
  estado: IncidenciaEstado;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface CreateIncidenciaData {
  idServicio: number;
  descripcion: string;
}

const normalizeErrorMessage = (error: any, fallback: string) => {
  const data = error?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object') {
    if (typeof data.error === 'string' && data.error.trim()) return data.error;
    const firstEntry = Object.entries(data).find(([, value]) => typeof value === 'string' && value.trim());
    if (firstEntry) return `${firstEntry[0]}: ${String(firstEntry[1])}`;
  }
  if (typeof error?.message === 'string' && error.message.trim()) return error.message;
  return fallback;
};

export const incidentService = {
  async createIncident(data: CreateIncidenciaData): Promise<Incidencia> {
    try {
      const response = await api.post<Incidencia>('/incidents', data);
      return response.data;
    } catch (error: any) {
      throw {
        status: error?.response?.status,
        message: normalizeErrorMessage(error, 'No se pudo reportar la incidencia'),
      };
    }
  },

  async getAllIncidents(): Promise<Incidencia[]> {
    try {
      const response = await api.get<Incidencia[]>('/admin/incidents');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      throw {
        status: error?.response?.status,
        message: normalizeErrorMessage(error, 'No se pudieron cargar las incidencias'),
      };
    }
  },

  async updateIncidentStatus(id: number, estado: IncidenciaEstado): Promise<Incidencia> {
    try {
      const response = await api.post<Incidencia>(`/admin/incidents/${id}`, { estado });
      return response.data;
    } catch (error: any) {
      throw {
        status: error?.response?.status,
        message: normalizeErrorMessage(error, 'No se pudo actualizar el estado de la incidencia'),
      };
    }
  },
};
