import { api } from './api';

export interface RatingRequest {
  idServicio: number;
  puntuacion: number;
  comentario?: string;
}

export interface Rating {
  idCalificacion: number;
  idServicio: number;
  idCliente: number;
  idDomiciliario: number;
  puntuacion: number;
  comentario?: string;
  fechaCreacion: string;
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
};
