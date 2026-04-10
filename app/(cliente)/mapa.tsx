import { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
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

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación');
          // Usar ubicación por defecto para demo (Cúcuta, Colombia)
          const defaultLoc = {
            coords: { latitude: 7.8939, longitude: -72.5078 }
          };
          setLocation(defaultLoc);
          fetchNearbyDrivers(7.8939, -72.5078);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);

        // Cargar domiciliarios cercanos
        fetchNearbyDrivers(loc.coords.latitude, loc.coords.longitude);
      } catch (error) {
        console.error('Error obteniendo ubicación:', error);
        // Usar ubicación por defecto
        const defaultLoc = {
          coords: { latitude: 7.8939, longitude: -72.5078 }
        };
        setLocation(defaultLoc);
        fetchNearbyDrivers(7.8939, -72.5078);
      }
    })();
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
