import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '../../src/constants/theme';

export default function PerfilDomiciliarioScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    driverId?: string;
    driverName?: string;
    driverPhone?: string;
    driverEmail?: string;
    driverVehicle?: string;
    driverPlate?: string;
    driverVerified?: string;
    driverRating?: string;
    driverDistanceKm?: string;
  }>();

  const driverId = Number(params.driverId);
  const driverName = params.driverName || 'Domiciliario';
  const driverPhone = params.driverPhone || 'No disponible';
  const driverEmail = params.driverEmail || 'No disponible';
  const driverVehicle = params.driverVehicle || 'Moto';
  const driverPlate = params.driverPlate || 'No registrada';
  const driverVerified = params.driverVerified === 'true';
  const driverRating = params.driverRating ? Number(params.driverRating) : null;
  const distanceKm = params.driverDistanceKm ? Number(params.driverDistanceKm) : null;

  const goToPedidos = () => {
    router.push({
      pathname: '/(cliente)/pedidos',
      params: {
        preferredDriverId: Number.isFinite(driverId) ? String(driverId) : '',
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={THEME.textPrimary} />
      </TouchableOpacity>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{driverName.charAt(0).toUpperCase()}</Text>
        </View>

        <Text style={styles.name}>{driverName}</Text>
        <Text style={styles.metaText}>
          ⭐ {driverRating ? driverRating.toFixed(1) : 'N/A'} · {distanceKm ? `${distanceKm.toFixed(1)} km` : 'Cerca de ti'}
        </Text>

        <View style={styles.badgesRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{driverVehicle}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Placa {driverPlate}</Text>
          </View>
          <View style={[styles.badge, driverVerified ? styles.badgeVerified : styles.badgePending]}>
            <Text style={[styles.badgeText, styles.badgeStatusText]}>
              {driverVerified ? 'Verificado' : 'Sin verificar'}
            </Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Teléfono</Text>
            <Text style={styles.detailValue}>{driverPhone}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Correo</Text>
            <Text style={styles.detailValue}>{driverEmail}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={goToPedidos}>
        <Text style={styles.primaryButtonText}>Realizar pedido</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  backButton: {
    marginTop: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  profileCard: {
    flex: 1,
    marginTop: 10,
    backgroundColor: THEME.card,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: THEME.warning,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#111',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.textPrimary,
  },
  metaText: {
    marginTop: 6,
    color: THEME.textSecondary,
    fontSize: 14,
  },
  badgesRow: {
    marginTop: 18,
    width: '100%',
    gap: 8,
  },
  badge: {
    backgroundColor: THEME.accent,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  badgeText: {
    color: THEME.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  badgeVerified: {
    backgroundColor: 'rgba(0, 214, 154, 0.2)',
  },
  badgePending: {
    backgroundColor: 'rgba(255, 176, 32, 0.2)',
  },
  badgeStatusText: {
    color: THEME.primary,
  },
  detailsCard: {
    marginTop: 16,
    width: '100%',
    backgroundColor: THEME.background,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailLabel: {
    color: THEME.textSecondary,
    fontSize: 13,
  },
  detailValue: {
    color: THEME.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  primaryButton: {
    marginTop: 16,
    backgroundColor: THEME.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
