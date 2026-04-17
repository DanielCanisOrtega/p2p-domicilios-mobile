import { api } from "./api";

export interface NearbyDriver {
  id: number;
  nombre: string;
  email?: string;
  telefono?: string;
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

      const payload = Array.isArray(response.data) ? response.data : [];

      return payload.map((driver) => {
        const rawDistance = Number(driver.distancia ?? 0);
        const distanceKm = Number.isFinite(rawDistance)
          ? rawDistance > 80
            ? rawDistance / 1000
            : rawDistance
          : 0;

        return {
          ...driver,
          latitud: Number(driver.latitud),
          longitud: Number(driver.longitud),
          distancia: Number(distanceKm.toFixed(2)),
        };
      });
    } catch (error: any) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error;

      throw {
        status,
        message: backendMessage || "Error obteniendo domiciliarios cercanos",
      };
    }
  },
};
