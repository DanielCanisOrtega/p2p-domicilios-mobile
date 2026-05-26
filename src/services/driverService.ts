import { api, BASE_URL } from "./api";

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

export interface DriverLocationPayload {
  latitud: number;
  longitud: number;
  disponible?: boolean;
  idServicio?: number;
}

export interface DriverActiveOrder {
  id_servicio?: number;
  idServicio?: number;
  id_cliente?: number;
  idCliente?: number;
  id_domiciliario?: number;
  idDomiciliario?: number;
  direccion_origen?: string;
  direccionOrigen?: string;
  direccion_destino?: string;
  direccionDestino?: string;
  tarifa?: number;
  ofertaActual?: number;
  oferta_actual?: number;
  estado?: string;
  descripcion?: string;
  tiempo_estimado?: number;
  tiempoEstimado?: number;
  lat_origen?: number;
  latOrigen?: number;
  lon_origen?: number;
  lonOrigen?: number;
  lat_destino?: number;
  latDestino?: number;
  lon_destino?: number;
  lonDestino?: number;
  fecha_solicitud?: string;
  fechaSolicitud?: string;
}

export interface DriverDetail {
  id: number;
  nombre?: string;
  email?: string;
  latitud?: number;
  longitud?: number;
  disponible?: boolean;
  verificado?: boolean;
  vehiculo?: string;
  placa?: string;
  calificacion?: number;
  distancia?: number;
}

export const driverService = {
  async getNearbyDrivers(
    latitude: number,
    longitude: number,
    radiusKm = 5
  ): Promise<NearbyDriver[]> {
    try {
      const response = await api.get<NearbyDriver[]>(`${BASE_URL}/drivers/nearby`, {
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

  async updateLocation(payload: DriverLocationPayload): Promise<NearbyDriver> {
    try {
      const response = await api.post<NearbyDriver>(`${BASE_URL}/drivers/location`, payload);
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error;

      throw {
        status,
        message: backendMessage || "Error actualizando ubicación",
      };
    }
  },

  async getTracking(idServicio: number) {
    try {
      const response = await api.get(`${BASE_URL}/drivers/orders/${idServicio}/tracking`);
      return response.data as {
        idServicio: number;
        latitud: number | null;
        longitud: number | null;
        tiempoEstimado?: number | null;
      };
    } catch (error: any) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error;

      throw {
        status,
        message: backendMessage || "Error obteniendo tracking",
      };
    }
  },

  async getActiveOrders() {
    try {
      const response = await api.get<DriverActiveOrder[]>(`${BASE_URL}/drivers/orders/active`);
      const payload = Array.isArray(response.data) ? response.data : [];
      return payload;
    } catch (error: any) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error;

      throw {
        status,
        message: backendMessage || "Error obteniendo servicios activos",
      };
    }
  },

  async getDriverByOrder(idServicio: number): Promise<DriverDetail> {
    try {
      const response = await api.get<DriverDetail>(`${BASE_URL}/drivers/orders/${idServicio}/driver`);
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error;

      throw {
        status,
        message: backendMessage || "Error obteniendo domiciliario del servicio",
      };
    }
  },
};
