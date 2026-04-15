import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '../../constants/theme';

interface Driver {
  id: number;
  nombre?: string;
  calificacion?: number;
  vehiculo?: string;
  distancia?: number;
  disponible: boolean;
}

interface DriverCardProps {
  driver: Driver;
  onPress?: (driver: Driver) => void;
}

export default function DriverCard({ driver, onPress }: DriverCardProps) {
  const getInitials = (name?: string) => {
    if (!name) return '🛵';
    return name.charAt(0).toUpperCase();
  };

  const getDistanceLabel = (distanceKm?: number) => {
    if (!distanceKm || distanceKm <= 0) return 'Cerca de ti';

    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`;
    }

    return `${distanceKm.toFixed(1)} km`;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(driver)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {getInitials(driver.nombre)}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>
          {driver.nombre || `Domiciliario ${driver.id}`}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.rating}>⭐ {driver.calificacion || '4.9'}</Text>
          <Text style={styles.vehicle}> · {driver.vehiculo || 'Moto'}</Text>
        </View>
      </View>

      <View style={styles.status}>
        <Text style={styles.statusBadge}>DISPONIBLE</Text>
        <Text style={styles.distance}>
          {getDistanceLabel(driver.distancia)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFB020',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: THEME.textSecondary,
  },
  vehicle: {
    fontSize: 12,
    color: THEME.textSecondary,
  },
  status: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.primary,
    marginBottom: 4,
  },
  distance: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
});
