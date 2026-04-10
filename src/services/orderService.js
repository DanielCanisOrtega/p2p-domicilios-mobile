import { api } from "./api";

export const orderService = {
	async createOrder(orderData) {
		try {
			const response = await api.post("/api/orders/create", orderData);
			return response.data;
		} catch (error) {
			throw error.response?.data || { error: "Error al crear el pedido" };
		}
	},
};
