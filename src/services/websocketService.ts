import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { authService } from './authService';
import Constants from 'expo-constants';

type ExpoExtra = {
  backendUrl?: string;
};

const getConfiguredBackendUrl = (): string | undefined => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim();
  }

  const value = (Constants.expoConfig?.extra as ExpoExtra | undefined)?.backendUrl;
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
};

const getBaseURL = (): string => {
  const base = getConfiguredBackendUrl() || 'http://localhost:8080';
  return base.replace(/\/$/, '');
};

export interface ChatMessage {
  idMensaje?: number;
  idChat: number;
  idUsuario: number;
  contenido: string;
  fechaEnvio: string;
  nombreUsuario?: string;
}

export interface TrackingUpdate {
  idServicio: number;
  latitud?: number;
  longitud?: number;
  tiempoEstimado?: number;
}

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private isConnecting = false;
  private isConnected = false;

  async connect(): Promise<void> {
    if (this.isConnected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    return new Promise(async (resolve, reject) => {
      try {
        const token = await authService.getToken();
        if (!token) {
          reject(new Error('No authentication token'));
          this.isConnecting = false;
          return;
        }

        const wsUrl = `${getBaseURL()}/ws`;

        this.client = new Client({
          webSocketFactory: () => new SockJS(wsUrl) as any,
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          debug: (str) => {
            console.log('[WS Debug]', str);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            console.log('WebSocket connected');
            this.isConnected = true;
            this.isConnecting = false;
            resolve();
          },
          onStompError: (frame) => {
            console.error('STOMP error:', frame);
            this.isConnecting = false;
            reject(new Error(frame.headers['message']));
          },
          onWebSocketError: (error) => {
            console.error('WebSocket error:', error);
            this.isConnecting = false;
            reject(error);
          },
          onDisconnect: () => {
            console.log('WebSocket disconnected');
            this.isConnected = false;
          },
        });

        this.client.activate();
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  subscribeToChat(idServicio: number, callback: (message: ChatMessage) => void): () => void {
    if (!this.client || !this.isConnected) {
      console.warn('WebSocket not connected. Cannot subscribe.');
      return () => {};
    }

    const destination = `/topic/chat/${idServicio}`;

    if (this.subscriptions.has(destination)) {
      console.log('Already subscribed to', destination);
      return () => this.unsubscribeFromChat(idServicio);
    }

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    console.log('Subscribed to', destination);

    return () => this.unsubscribeFromChat(idServicio);
  }

  subscribeToTracking(idServicio: number, callback: (update: TrackingUpdate) => void): () => void {
    if (!this.client || !this.isConnected) {
      console.warn('WebSocket not connected. Cannot subscribe to tracking.');
      return () => {};
    }

    const destination = `/topic/servicio/${idServicio}`;

    if (this.subscriptions.has(destination)) {
      console.log('Already subscribed to', destination);
      return () => this.unsubscribeFromTracking(idServicio);
    }

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error('Error parsing tracking message:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    console.log('Subscribed to', destination);

    return () => this.unsubscribeFromTracking(idServicio);
  }

  unsubscribeFromTracking(idServicio: number): void {
    const destination = `/topic/servicio/${idServicio}`;
    const subscription = this.subscriptions.get(destination);

    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
      console.log('Unsubscribed from', destination);
    }
  }

  unsubscribeFromChat(idServicio: number): void {
    const destination = `/topic/chat/${idServicio}`;
    const subscription = this.subscriptions.get(destination);

    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
      console.log('Unsubscribed from', destination);
    }
  }

  sendMessage(idServicio: number, contenido: string): void {
    if (!this.client || !this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    this.client.publish({
      destination: `/app/chat.send/${idServicio}`,
      body: JSON.stringify({
        idServicio,
        contenido,
      }),
    });
  }

  disconnect(): void {
    if (this.client) {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const websocketService = new WebSocketService();
