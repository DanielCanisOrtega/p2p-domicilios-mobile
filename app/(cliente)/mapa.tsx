import { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MapView, Marker } from '../../src/components/map';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { AuthContext } from '../../src/context/AuthContext';
import { driverService, NearbyDriver } from '../../src/services/driverService';
import { THEME } from '../../src/constants/theme';
import DriverCard from '../../src/components/driver/DriverCard';
import Avatar from '../../src/components/ui/Avatar';

const POLLING_INTERVAL_MS = 10000;
const MIN_LOCATION_CHANGE_KM = 0.03;
const SEARCH_RADIUS_KM = 5;

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
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
];

export default function ClienteMapScreen() {
  const { user } = useContext(AuthContext);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [drivers, setDrivers] = useState<NearbyDriver[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [driversError, setDriversError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);

  const locationRef = useRef<Location.LocationObject | null>(null);
  const isFetchingDriversRef = useRef(false);
  const hasFetchedDriversRef = useRef(false);

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const fetchNearbyDrivers = useCallback(async (lat: number, lon: number) => {
    if (isFetchingDriversRef.current) {
      return;
    }

    const showLoading = !hasFetchedDriversRef.current;

    if (showLoading) {
      setIsLoadingDrivers(true);
    }

    setDriversError(null);
    isFetchingDriversRef.current = true;

    try {
      const nearbyDrivers = await driverService.getNearbyDrivers(lat, lon, SEARCH_RADIUS_KM);
      setDrivers(nearbyDrivers);
      hasFetchedDriversRef.current = true;
    } catch (error) {
      console.error('Error cargando domiciliarios:', error);
      setDriversError('No se pudo actualizar la lista de domiciliarios.');
    } finally {
      if (showLoading) {
        setIsLoadingDrivers(false);
      }

      isFetchingDriversRef.current = false;
    }
  }, []);

  const requestLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLocationError('Permiso de ubicación denegado. La app necesita tu ubicación para mostrar domiciliarios cercanos.');
        setIsLoadingLocation(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      locationRef.current = loc;
      setLocation(loc);
      setLocationError(null);

      await fetchNearbyDrivers(loc.coords.latitude, loc.coords.longitude);
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      setLocationError('Error al obtener tu ubicación. Verifica que el GPS esté activado.');
    } finally {
      setIsLoadingLocation(false);
    }
  }, [fetchNearbyDrivers]);

  useEffect(() => {
    void requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    if (!location) return;

    const pollingInterval = setInterval(() => {
      void (async () => {
      try {
        const newLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const previousLocation = locationRef.current;
        locationRef.current = newLocation;

        if (!previousLocation) {
          setLocation(newLocation);
        } else {
          const distance = calculateDistance(
            previousLocation.coords.latitude,
            previousLocation.coords.longitude,
            newLocation.coords.latitude,
            newLocation.coords.longitude
          );

          if (distance > MIN_LOCATION_CHANGE_KM) {
            setLocation(newLocation);
          }
        }

        await fetchNearbyDrivers(newLocation.coords.latitude, newLocation.coords.longitude);
      } catch (error) {
        console.error('Error actualizando ubicación y domiciliarios:', error);
      }
      })();
    }, POLLING_INTERVAL_MS);

    return () => {
      clearInterval(pollingInterval);
    };
  }, [location, fetchNearbyDrivers, calculateDistance]);

  const filteredDrivers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return drivers;
    }

    return drivers.filter((driver) => {
      const text = `${driver.nombre ?? ''} ${driver.vehiculo ?? ''} ${driver.placa ?? ''}`.toLowerCase();
      return text.includes(query);
    });
  }, [drivers, searchQuery]);

  const mappableDrivers = useMemo(
    () =>
      filteredDrivers.filter(
        (driver) => Number.isFinite(driver.latitud) && Number.isFinite(driver.longitud)
      ),
    [filteredDrivers]
  );

  // Pantalla de error si no hay ubicación
  if (locationError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="location-outline" size={80} color={THEME.textSecondary} />
        <Text style={styles.errorTitle}>Ubicación no disponible</Text>
        <Text style={styles.errorMessage}>{locationError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={requestLocation}>
          <Ionicons name="refresh" size={20} color="#000" />
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Pantalla de carga mientras obtiene ubicación
  if (isLoadingLocation || !location) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="location" size={60} color={THEME.primary} />
        <Text style={styles.loadingText}>Obteniendo tu ubicación...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Mapa */}
      <MapView
        style={styles.map}
        customMapStyle={CUSTOM_MAP_STYLE}
        region={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {/* Marcador del usuario */}
        {location && (
          <Marker
            key="user-location"
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Tu ubicación"
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>
        )}

        {/* Marcadores de domiciliarios */}
        {mappableDrivers.map((driver) => (
          <Marker
            key={`driver-${driver.id}`}
            coordinate={{
              latitude: driver.latitud,
              longitude: driver.longitud,
            }}
            title={driver.nombre || 'Domiciliario'}
          >
            <View style={styles.driverMarker}>
              <Ionicons name="bicycle" size={16} color="#000" />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Barra de búsqueda */}
      <View style={styles.searchBar}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={20} color={THEME.textSecondary} />
          <TextInput
            style={styles.searchText}
            placeholder="¿A dónde vas?"
            placeholderTextColor={THEME.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Avatar name={user?.nombre || user?.username} size={48} />
      </View>

      {/* Panel de domiciliarios */}
      <View style={styles.driversPanel}>
        <Text style={styles.panelTitle}>Domiciliarios disponibles ({filteredDrivers.length})</Text>

        {driversError && <Text style={styles.errorText}>{driversError}</Text>}

        {isLoadingDrivers && drivers.length === 0 ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={THEME.primary} />
            <Text style={styles.emptyText}>Buscando domiciliarios cercanos...</Text>
          </View>
        ) : (
          <ScrollView style={styles.driversList} showsVerticalScrollIndicator={false}>
            {filteredDrivers.map((driver) => (
              <DriverCard key={driver.id} driver={driver} />
            ))}

            {filteredDrivers.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No hay domiciliarios disponibles cerca</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: THEME.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  loadingText: {
    color: THEME.textPrimary,
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: THEME.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 15,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginTop: 20,
  },
  errorMessage: {
    fontSize: 15,
    color: THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 20,
    gap: 10,
  },
  retryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
  searchBar: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },
  searchText: {
    flex: 1,
    color: THEME.textPrimary,
    fontSize: 16,
  },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    borderWidth: 3,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
  },
  driverMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  driversPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: THEME.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '40%',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 10,
  },
  errorText: {
    color: THEME.warning,
    marginBottom: 10,
    fontSize: 12,
  },
  driversList: {
    flex: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: THEME.textSecondary,
    fontSize: 14,
  },
});
