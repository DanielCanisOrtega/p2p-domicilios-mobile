import { api } from './api';

export interface ChatMessage {
  idMensaje?: number;
  idChat: number;
  idUsuario: number;
  contenido: string;
  fechaEnvio: string;
  nombreUsuario?: string;
}

export interface ChatInitResponse {
  idChat: number;
  idServicio: number;
}

export const chatService = {
  async initChat(idServicio: number): Promise<ChatInitResponse> {
    try {
      const response = await api.post<ChatInitResponse>(`/api/chat/${idServicio}/init`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Error al inicializar el chat' };
    }
  },

  async getMessages(idServicio: number): Promise<ChatMessage[]> {
    try {
      const response = await api.get<ChatMessage[]>(`/api/chat/${idServicio}/messages`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Error al obtener mensajes' };
    }
  },
};
