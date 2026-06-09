import { api } from './api';

export interface RatingRequest {
  idServicio: number;
  puntuacion: number;
  comentario?: string;
  idCliente?: number;
}

export interface Rating {
  idCalificacion: number;
  idServicio: number;
  idCliente: number;
  idDomiciliario: number;
  puntuacion: number;
  comentario?: string;
  fechaCreacion: string;
  roleCalificador?: string;
}

export interface ServicioPendienteCalificar {
  idServicio: number;
  direccionOrigen?: string;
  direccionDestino?: string;
  descripcion?: string;
  estado?: string;
  fechaSolicitud?: string;
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

export const ratingService = {
  async createRating(data: RatingRequest): Promise<Rating> {
    try {
      const payload = {
        id_servicio: data.idServicio,
        puntuacion: data.puntuacion,
        comentario: data.comentario,
        id_cliente: data.idCliente,
      };
      const response = await api.post<Rating>('/api/calificaciones', payload);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Error al enviar calificación' };
    }
  },

  async getRating(idServicio: number): Promise<Rating> {
    try {
      const response = await api.get<Rating>(`/api/calificaciones/servicio/${idServicio}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Error al obtener calificación' };
    }
  },

  async getRatingCliente(idServicio: number): Promise<Rating> {
    try {
      const response = await api.get<Rating>(`/api/calificaciones/servicio/${idServicio}/cliente`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Error al obtener calificación del cliente' };
    }
  },

  async getRatingDomiciliario(idServicio: number): Promise<Rating> {
    try {
      const response = await api.get<Rating>(`/api/calificaciones/servicio/${idServicio}/domiciliario`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Error al obtener calificación del domiciliario' };
    }
  },

  async getPendientes(): Promise<ServicioPendienteCalificar[]> {
    try {
      const response = await api.get<ServicioPendienteCalificar[]>('/api/calificaciones/pendientes');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      throw {
        status: error?.response?.status,
        message: normalizeErrorMessage(error, 'No se pudieron cargar los servicios pendientes de calificar'),
      };
    }
  },
};
