import { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MapView, Marker } from '../../src/components/map';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { AuthContext } from '../../src/context/AuthContext';
import { api } from '../../src/services/api';
import { THEME } from '../../src/constants/theme';
import DriverCard from '../../src/components/driver/DriverCard';
import Avatar from '../../src/components/ui/Avatar';

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

interface Driver {
  id: number;
  nombre: string;
  email?: string;
  latitud: number;
  longitud: number;
  disponible: boolean;
  verificado?: boolean;
  calificacion: number;
  vehiculo: string;
  placa?: string;
  distancia?: number;
}

export default function ClienteMapScreen() {
  const { user } = useContext(AuthContext);
  const [location, setLocation] = useState<any>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const requestLocation = async () => {
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

      setLocation(loc);
      setLocationError(null);

      // Cargar domiciliarios cercanos con ubicación REAL
      fetchNearbyDrivers(loc.coords.latitude, loc.coords.longitude);
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      setLocationError('Error al obtener tu ubicación. Verifica que el GPS esté activado.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const fetchNearbyDrivers = async (lat: number, lon: number) => {
    try {
      const response = await api.get(
        `/drivers/nearby?lat=${lat}&lon=${lon}&radiusKm=5`
      );
      setDrivers(response.data);
    } catch (error) {
      console.error('Error cargando domiciliarios:', error);
    }
  };

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
        {drivers.map((driver) => (
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
        <Text style={styles.panelTitle}>Domiciliarios disponibles</Text>

        <ScrollView style={styles.driversList} showsVerticalScrollIndicator={false}>
          {drivers.map((driver) => (
            <DriverCard key={driver.id} driver={driver} />
          ))}

          {drivers.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No hay domiciliarios disponibles cerca</Text>
            </View>
          )}
        </ScrollView>
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
    marginBottom: 15,
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
