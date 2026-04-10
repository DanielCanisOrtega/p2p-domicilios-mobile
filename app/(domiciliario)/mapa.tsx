import { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { MapView, Marker } from '../../src/components/MapView';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { AuthContext } from '../../src/context/AuthContext';
import { THEME } from '../../src/constants/theme';

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
  const { user } = useContext(AuthContext);
  const [location, setLocation] = useState<any>(null);
  const [isActive, setIsActive] = useState(true);
  const [hasNewRequest, setHasNewRequest] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          // Usar ubicación por defecto para demo (Cúcuta, Colombia)
          const defaultLoc = {
            coords: { latitude: 7.8939, longitude: -72.5078 }
          };
          setLocation(defaultLoc);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      } catch (error) {
        console.error('Error obteniendo ubicación:', error);
        // Usar ubicación por defecto
        const defaultLoc = {
          coords: { latitude: 7.8939, longitude: -72.5078 }
        };
        setLocation(defaultLoc);
      }
    })();

    // Simular nueva solicitud después de 5 segundos
    const timer = setTimeout(() => {
      setHasNewRequest(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleAcceptRequest = () => {
    Alert.alert('Solicitud Aceptada', 'Dirígete al punto de recogida');
    setHasNewRequest(false);
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

      {/* Nueva solicitud */}
      {hasNewRequest && (
        <TouchableOpacity style={styles.requestCard} onPress={handleAcceptRequest}>
          <Text style={styles.requestBadge}>NUEVA SOLICITUD</Text>
          <Text style={styles.requestClient}>María González</Text>
          <Text style={styles.requestRoute}>Cra 7 #12-34 → Cll 18 #8-20</Text>
          <View style={styles.requestMeta}>
            <Text style={styles.requestPrice}>$8.500</Text>
            <Text style={styles.requestTime}> · ~12 min</Text>
          </View>
        </TouchableOpacity>
      )}

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
  requestCard: {
    position: 'absolute',
    top: 140,
    left: 20,
    right: 20,
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
