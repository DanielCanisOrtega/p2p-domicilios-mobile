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

export const ratingService = {
  async createRating(data: RatingRequest): Promise<Rating> {
    try {
      const response = await api.post<Rating>('/api/calificaciones', data);
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
};
