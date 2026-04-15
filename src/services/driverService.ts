import { api } from "./api";

export interface NearbyDriver {
  id: number;
  nombre: string;
  email?: string;
  latitud: number;
  longitud: number;
  disponible: boolean;
  verificado?: boolean;
  calificacion?: number;
  vehiculo?: string;
  placa?: string;
  distancia?: number;
}

export const driverService = {
  async getNearbyDrivers(
    latitude: number,
    longitude: number,
    radiusKm = 5
  ): Promise<NearbyDriver[]> {
    try {
      const response = await api.get<NearbyDriver[]>("/drivers/nearby", {
        params: {
          lat: latitude,
          lon: longitude,
          radiusKm,
        },
      });

      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: "Error obteniendo domiciliarios cercanos" };
    }
  },
};
