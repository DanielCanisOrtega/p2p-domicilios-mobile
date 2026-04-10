import { api } from "./api";

interface OrderData {
  id_cliente: number;
  id_domiciliario: number;
  direccion_origen: string;
  direccion_destino: string;
  descripcion?: string;
  precio?: number;
}

interface Order {
  id: number;
  id_cliente: number;
  id_domiciliario: number;
  direccion_origen: string;
  direccion_destino: string;
  estado: string;
  descripcion?: string;
  precio?: number;
  fecha_creacion?: string;
}

export const orderService = {
  async createOrder(orderData: OrderData): Promise<Order> {
    try {
      const response = await api.post<Order>("/api/orders/create", orderData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: "Error al crear el pedido" };
    }
  },
};
