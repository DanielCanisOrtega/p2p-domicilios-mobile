import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MapView, Marker } from '../../src/components/map';
import { THEME } from '../../src/constants/theme';
import { AuthContext } from '../../src/context/AuthContext';
import { orderService, type Order } from '../../src/services/orderService';
import { driverService } from '../../src/services/driverService';
import { pendingOrderStore } from '../../src/services/pendingOrderStore';

const CUSTOM_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
];

export default function DomiciliarioMapScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [location, setLocation] = useState<any>(null);
  const [isActive, setIsActive] = useState(true);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestActiveServiceIdRef = useRef<number | null>(null);

  const latestPendingOrder = [...pendingOrders].sort((left, right) => {
    const leftTime = left.fecha_creacion ? new Date(left.fecha_creacion).getTime() : 0;
    const rightTime = right.fecha_creacion ? new Date(right.fecha_creacion).getTime() : 0;

    if (rightTime !== leftTime) {
      return rightTime - leftTime;
    }

    return right.id - left.id;
  })[0];

  const fetchAssignedOrders = useCallback(async () => {
    try {
      if (!isActive) {
        setPendingOrders([]);
        return;
      }

      const orders = await orderService.getPendingOrders();
      const visibleOrders = pendingOrderStore.filterVisible(orders);
      setPendingOrders(visibleOrders);

      const acceptedOrder = visibleOrders.find((order) => (order.estado || '').toUpperCase() === 'ACEPTADO');
      setActiveOrderId(acceptedOrder?.id ?? null);
      latestActiveServiceIdRef.current = acceptedOrder?.id ?? null;
    } catch (error: any) {
      console.error('Error obteniendo órdenes:', error);

      // Si es 403 => token inválido o domiciliario no verificado/disponible
      if (error?.status === 403) {
        Alert.alert(
          'No autorizado',
          'No tienes permisos para ver la bandeja. Verifica que estés autenticado como domiciliario y que tu cuenta esté verificada y disponible.',
          [
            {
              text: 'OK',
              onPress: () => {},
            },
          ]
        );
        setPendingOrders([]);
        return;
      }

      // Sin status: problema de red / backend no disponible
      if (!error?.status) {
        Alert.alert(
          'Error de conexión',
          'No se pudo conectar al backend. Si estás trabajando en local, asegúrate de levantar el backend o usa el modo mock.',
          [
            {
              text: 'OK',
              onPress: () => {},
            },
          ]
        );
        setPendingOrders([]);
        return;
      }

      // Otros errores: limpiar bandeja y seguir
    }
  }, [isActive]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          const defaultLoc = {
            coords: { latitude: 7.8939, longitude: -72.5078 }
          };
          setLocation(defaultLoc);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
        void driverService.updateLocation({
          latitud: loc.coords.latitude,
          longitud: loc.coords.longitude,
          disponible: isActive,
          idServicio: activeOrderId ?? undefined,
        });
      } catch (error) {
        console.error('Error obteniendo ubicación:', error);
        const defaultLoc = {
          coords: { latitude: 7.8939, longitude: -72.5078 }
        };
        setLocation(defaultLoc);
      }
    })();
  }, [isActive, activeOrderId]);

  // Polling de órdenes asignadas
  useFocusEffect(
    useCallback(() => {
      // Fetch inmediato
      void fetchAssignedOrders();

      // Polling cada 5 segundos
      pollingIntervalRef.current = setInterval(() => {
        void fetchAssignedOrders();
      }, 5000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }, [fetchAssignedOrders])
  );

  useEffect(() => {
    if (!location) return;

    const sendLocation = async (coords: { latitude: number; longitude: number }) => {
      try {
        await driverService.updateLocation({
          latitud: coords.latitude,
          longitud: coords.longitude,
          disponible: isActive,
          idServicio: latestActiveServiceIdRef.current ?? undefined,
        });
      } catch (error) {
        // ignore background errors
      }
    };

    const startTracking = () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }

      locationIntervalRef.current = setInterval(async () => {
        try {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setLocation(loc);
          await sendLocation(loc.coords);
        } catch (error) {
          // ignore location errors
        }
      }, 15000);
    };

    startTracking();

    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, [location, isActive, activeOrderId]);

  const openRequest = (request: Order) => {
    latestActiveServiceIdRef.current = request.id;
    router.push({
      pathname: '/(domiciliario)/pedidos',
      params: {
        orderId: String(request.id),
        clientName: request.cliente?.nombre || 'Cliente',
        clientRating: String(request.cliente?.calificacion || '4.5'),
        clientServices: '0',
        clientId: request.id_cliente ? String(request.id_cliente) : undefined,
        originAddress: request.direccion_origen || 'Origen',
        destinationAddress: request.direccion_destino || 'Destino',
        // prefer tarifa (DB field) when present
        fare: `$${request.tarifa ?? request.precio ?? 0}`,
        distance: request.tiempo_estimado ? `~${request.tiempo_estimado} min` : 'Pendiente',
        originLat: request.lat_origen ? String(request.lat_origen) : undefined,
        originLon: request.lon_origen ? String(request.lon_origen) : undefined,
        destinationLat: request.lat_destino ? String(request.lat_destino) : undefined,
        destinationLon: request.lon_destino ? String(request.lon_destino) : undefined,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Mapa */}
      <MapView
        style={styles.map}
        customMapStyle={CUSTOM_MAP_STYLE}
        region={
          location
            ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }
            : undefined
        }
      >
        {/* Marcador del domiciliario */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Tu ubicación"
          >
            <View style={styles.driverMarker}>
              <Ionicons name="bicycle" size={20} color="#000" />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Header con perfil y toggle */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.nombre?.charAt(0) || user?.username?.charAt(0) || 'D'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.nombre || user?.username}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, isActive && styles.statusDotActive]} />
              <Text style={[styles.statusText, isActive && styles.statusTextActive]}>
                {isActive ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.toggleContainer}>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: '#3E3E3E', true: THEME.primary }}
            thumbColor={isActive ? '#000' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Bandeja de pedidos */}
      <View style={styles.requestTray}>
        <Text style={styles.requestTrayTitle}>Pedidos disponibles ({latestPendingOrder ? 1 : 0})</Text>
        {!latestPendingOrder ? (
          <Text style={styles.requestEmpty}>No hay pedidos pendientes ahora mismo.</Text>
        ) : (
          <TouchableOpacity
            key={latestPendingOrder.id}
            style={styles.requestCard}
            onPress={() => openRequest(latestPendingOrder)}
          >
            <Text style={styles.requestBadge}>NUEVA SOLICITUD</Text>
            <Text style={styles.requestClient}>
              {latestPendingOrder.cliente?.nombre?.trim() || `Solicitud #${latestPendingOrder.id}`}
            </Text>
            <Text style={styles.requestRoute}>
              {latestPendingOrder.direccion_origen} → {latestPendingOrder.direccion_destino}
            </Text>
            {!!latestPendingOrder.descripcion?.trim() && (
              <Text style={styles.requestDescription}>{latestPendingOrder.descripcion}</Text>
            )}
            {!latestPendingOrder.cliente?.nombre?.trim() && (
              <Text style={styles.requestMetaText}>Cliente #{latestPendingOrder.id_cliente}</Text>
            )}
            <View style={styles.requestMeta}>
              <Text style={styles.requestPrice}>${latestPendingOrder.tarifa ?? latestPendingOrder.precio ?? 0}</Text>
              <Text style={styles.requestTime}> · ~{latestPendingOrder.tiempo_estimado || 12} min</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>4.9</Text>
          <Text style={styles.statLabel}>CALIFICACIÓN</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>247</Text>
          <Text style={styles.statLabel}>ENTREGAS</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: THEME.primary }]}>$42k</Text>
          <Text style={styles.statLabel}>GANADO</Text>
        </View>
      </View>

      {/* Estado */}
      <View style={styles.statusBar}>
        <Text style={styles.statusLabel}>Estado</Text>
        <Text style={styles.statusMessage}>Esperando solicitudes...</Text>
        <Text style={styles.statusBadge}>DISPONIBLE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  map: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.card,
    padding: 15,
    borderRadius: 15,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: THEME.warning,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: THEME.primary,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileInfo: {
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
  },
  statusDotActive: {
    backgroundColor: THEME.primary,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  statusTextActive: {
    color: THEME.primary,
  },
  toggleContainer: {
    backgroundColor: THEME.primary,
    borderRadius: 20,
    padding: 3,
  },
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.warning,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  requestTray: {
    position: 'absolute',
    top: 140,
    left: 20,
    right: 20,
    gap: 10,
  },
  requestTrayTitle: {
    color: THEME.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    backgroundColor: THEME.card,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(23, 213, 170, 0.18)',
  },
  requestEmpty: {
    color: THEME.textSecondary,
    backgroundColor: THEME.card,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  requestCard: {
    backgroundColor: THEME.card,
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: THEME.primary,
  },
  requestBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.primary,
    marginBottom: 8,
  },
  requestClient: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 6,
  },
  requestRoute: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginBottom: 10,
  },
  requestDescription: {
    fontSize: 12,
    color: '#c6cedd',
    marginBottom: 8,
  },
  requestMetaText: {
    fontSize: 11,
    color: '#8d95a4',
    marginBottom: 8,
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.primary,
  },
  requestTime: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  statsContainer: {
    position: 'absolute',
    bottom: 140,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: THEME.card,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: THEME.textSecondary,
    fontWeight: '600',
  },
  statusBar: {
    position: 'absolute',
    bottom: 70,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  statusLabel: {
    fontSize: 12,
    color: THEME.textSecondary,
  },
  statusMessage: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.textPrimary,
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 214, 154, 0.1)',
    borderRadius: 8,
  },
});
