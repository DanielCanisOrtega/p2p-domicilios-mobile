import { api } from "./api";

interface OrderData {
  id_cliente: number;
  id_domiciliario?: number;
  direccion_origen: string;
  direccion_destino: string;
  descripcion?: string;
  tarifa?: number;
  oferta_actual?: number;
  precio?: number;
}

export interface Order {
  id: number;
  id_cliente: number;
  id_domiciliario: number;
  direccion_origen: string;
  direccion_destino: string;
  estado: string;
  descripcion?: string;
  precio?: number;
  tarifa?: number;
  oferta_actual?: number;
  ultima_oferta_por?: string;
  fecha_creacion?: string;
  tiempo_estimado?: number;
  lat_origen?: number;
  lon_origen?: number;
  lat_destino?: number;
  lon_destino?: number;
  cliente?: {
    id?: number;
    nombre?: string;
    email?: string;
    telefono?: string;
    calificacion?: number;
  };
}

export const normalizeOrder = (raw: any): Order => {
  const clienteRaw = raw?.cliente || raw?.customer || raw?.usuario || raw?.client || {};

  const normalizedId =
    raw?.id ??
    raw?.id_servicio ??
    raw?.servicioId ??
    raw?.pedidoId ??
    raw?.idPedido ??
    raw?.orderId ??
    raw?.serviceId;

  return {
    id: Number(normalizedId ?? 0),
    id_cliente: Number(raw?.id_cliente ?? raw?.clienteId ?? clienteRaw?.id ?? 0),
    id_domiciliario: Number(raw?.id_domiciliario ?? raw?.domiciliarioId ?? 0),
    direccion_origen:
      raw?.direccion_origen ?? raw?.direccionOrigen ?? raw?.origen ?? raw?.pickupAddress ?? 'Origen',
    direccion_destino:
      raw?.direccion_destino ?? raw?.direccionDestino ?? raw?.destino ?? raw?.dropoffAddress ?? 'Destino',
    estado: raw?.estado ?? raw?.status ?? 'PENDIENTE',
    descripcion: raw?.descripcion ?? raw?.detalle ?? raw?.observacion ?? '',
    tarifa: Number(raw?.tarifa ?? raw?.tarifa_actual ?? raw?.tarifaActual ?? raw?.monto ?? raw?.precio ?? 0) || undefined,
    oferta_actual: Number(raw?.oferta_actual ?? raw?.ofertaActual ?? raw?.oferta ?? 0) || undefined,
    ultima_oferta_por: raw?.ultima_oferta_por ?? raw?.ultimaOfertaPor ?? raw?.offerBy ?? raw?.offer_by,
    precio: Number(raw?.precio ?? raw?.monto ?? 0) || undefined,
    fecha_creacion: raw?.fecha_creacion ?? raw?.fechaCreacion ?? raw?.createdAt ?? raw?.fechaSolicitud ?? raw?.fecha_solicitud,
    tiempo_estimado: Number(raw?.tiempo_estimado ?? raw?.tiempoEstimado ?? raw?.eta ?? 0) || undefined,
    lat_origen: Number(raw?.lat_origen ?? raw?.latOrigen ?? raw?.originLat ?? raw?.latitud_origen ?? 0) || undefined,
    lon_origen: Number(raw?.lon_origen ?? raw?.lonOrigen ?? raw?.originLon ?? raw?.longitud_origen ?? 0) || undefined,
    lat_destino: Number(raw?.lat_destino ?? raw?.latDestino ?? raw?.destinationLat ?? raw?.latitud_destino ?? 0) || undefined,
    lon_destino: Number(raw?.lon_destino ?? raw?.lonDestino ?? raw?.destinationLon ?? raw?.longitud_destino ?? 0) || undefined,
    cliente: {
      id: Number(clienteRaw?.id ?? clienteRaw?.clienteId ?? clienteRaw?.id_cliente ?? raw?.id_cliente ?? 0) || undefined,
      nombre: clienteRaw?.nombre ?? clienteRaw?.name ?? clienteRaw?.username ?? raw?.nombre_cliente ?? raw?.clienteNombre,
      email: clienteRaw?.email,
      telefono: clienteRaw?.telefono ?? clienteRaw?.phone,
      calificacion: Number(clienteRaw?.calificacion ?? clienteRaw?.rating ?? raw?.calificacion_cliente ?? 0) || undefined,
    },
  };
};

export const orderService = {
  async createOrder(orderData: OrderData): Promise<Order> {
    try {
      console.debug('[orderService] createOrder payload:', orderData);
      const response = await api.post<Order>("/api/orders/create", orderData);
      console.debug('[orderService] createOrder response:', response?.data);
      return response.data;
    } catch (error: any) {
      throw {
        status: error.response?.status,
        error: error.response?.data || { error: "Error al crear el pedido" },
      };
    }
  },

  async getPendingOrders(): Promise<Order[]> {
    try {
      const response = await api.get<Order[]>("/drivers/orders/pending");
      const payload = Array.isArray(response.data) ? response.data : [];
      return payload.map(normalizeOrder).filter((order) => order.id > 0);
    } catch (error: any) {
      throw {
        status: error.response?.status,
        error: error.response?.data || { error: "Error al obtener pedidos pendientes" },
      };
    }
  },

  async getOrderById(orderId: number): Promise<Order> {
    try {
      const response = await api.get<any>(`/api/orders/${orderId}/status`);
      const normalized = normalizeOrder({ ...response.data, id_servicio: orderId });
      return normalized;
    } catch (error: any) {
      throw {
        status: error.response?.status,
        error: error.response?.data || { error: "Error al obtener el pedido" },
      };
    }
  },

  async getOrdersByClient(): Promise<Order[]> {
    try {
      const response = await api.get<Order[]>("/api/orders/client");
      const payload = Array.isArray(response.data) ? response.data : [];
      return payload.map(normalizeOrder).filter((order) => order.id > 0);
    } catch (error: any) {
      throw {
        status: error.response?.status,
        error: error.response?.data || { error: "Error al obtener pedidos del cliente" },
      };
    }
  },

  async updateOrderState(orderId: number, estado: string): Promise<Order> {
    try {
      const response = await api.post<Order>(`/api/orders/${orderId}/state`, { estado });
      return response.data;
    } catch (error: any) {
      throw {
        status: error.response?.status,
        error: error.response?.data || { error: 'Error al actualizar el estado del pedido' },
      };
    }
  },

  async acceptOrder(orderId: number): Promise<Order> {
    try {
      const response = await api.post<Order>(`/api/orders/${orderId}/accept`, null);
      return response.data;
    } catch (error: any) {
      throw {
        status: error.response?.status,
        error: error.response?.data || { error: "Error al aceptar el pedido" },
      };
    }
  },

  async rejectOrder(orderId: number): Promise<Order> {
    try {
      const response = await api.post<Order>(`/api/orders/${orderId}/reject`, null);
      return response.data;
    } catch (error: any) {
      throw {
        status: error.response?.status,
        error: error.response?.data || { error: "Error al rechazar el pedido" },
      };
    }
  },

  async counterOfferOrder(orderId: number, newPrice: number): Promise<Order> {
    try {
      console.debug('[orderService] counterOfferOrder payload:', { orderId, monto: newPrice });
      const response = await api.post<any>(`/api/orders/${orderId}/counteroffer`, {
        monto: newPrice,
      });
      console.debug('[orderService] counterOfferOrder response:', response?.data);
      return normalizeOrder(response.data);
    } catch (error: any) {
      throw {
        status: error.response?.status,
        error: error.response?.data || { error: "Error al hacer contraoferta" },
      };
    }
  },
};
