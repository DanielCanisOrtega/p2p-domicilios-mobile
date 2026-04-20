import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MapView, Marker } from '../../src/components/map';
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

export default function SeguimientoScreen() {
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
    driverLat?: string;
    driverLon?: string;
    userLat?: string;
    userLon?: string;
  }>();

  const userLat = Number(params.userLat ?? 7.8939);
  const userLon = Number(params.userLon ?? -72.4842);
  const driverLat = Number(params.driverLat ?? userLat + 0.0015);
  const driverLon = Number(params.driverLon ?? userLon + 0.0015);
  const driverId = params.driverId || 'N/A';
  const driverName = params.driverName || 'Domiciliario asignado';
  const phone = params.driverPhone || 'No disponible';
  const email = params.driverEmail || 'No disponible';
  const vehicle = params.driverVehicle || 'Moto';
  const plate = params.driverPlate || 'Sin placa';
  const verified = params.driverVerified === 'true';
  const rating = params.driverRating || 'N/A';
  const distance = params.driverDistanceKm ? `${Number(params.driverDistanceKm).toFixed(1)} km` : 'N/A';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapArea}>
        <MapView
          style={styles.map}
          customMapStyle={CUSTOM_MAP_STYLE}
          region={{
            latitude: userLat,
            longitude: userLon,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          <Marker coordinate={{ latitude: userLat, longitude: userLon }} title="Origen">
            <View style={styles.originMarkerPin}>
              <View style={styles.originMarkerDot} />
            </View>
          </Marker>

          <Marker coordinate={{ latitude: driverLat, longitude: driverLon }} title={driverName}>
            <View style={styles.driverMarkerPin}>
              <MaterialCommunityIcons name="motorbike" size={16} color="#0a0f1c" />
            </View>
          </Marker>
        </MapView>

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />

        <View style={styles.stepper}>
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepDone]}>
              <Ionicons name="checkmark" size={13} color="#0a0f1c" />
            </View>
            <Text style={styles.stepLabel}>Aceptado</Text>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepDone]}>
              <MaterialCommunityIcons name="bicycle" size={14} color="#0a0f1c" />
            </View>
            <Text style={styles.stepLabel}>En camino</Text>
          </View>

          <View style={[styles.stepLine, styles.stepLineActive]} />

          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepPending]}>
              <Ionicons name="checkmark" size={13} color="#6d6d6d" />
            </View>
            <Text style={styles.stepLabelMuted}>Entregado</Text>
          </View>
        </View>

        <View style={styles.driverCard}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverAvatarText}>🧑</Text>
          </View>

          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{driverName}</Text>
            <Text style={styles.driverMeta}>🏍 {vehicle} · {plate}</Text>
            <Text style={styles.driverMeta}>📞 {phone}</Text>
          </View>

          <View style={styles.minutesBox}>
            <Text style={styles.minutesValue}>7</Text>
            <Text style={styles.minutesLabel}>MIN</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ID</Text>
            <Text style={styles.detailValue}>#{driverId}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Verificación</Text>
            <Text style={[styles.detailValue, { color: verified ? THEME.primary : '#f4b400' }]}>
              {verified ? 'Verificado' : 'Pendiente'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Calificación</Text>
            <Text style={styles.detailValue}>⭐ {rating}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Distancia</Text>
            <Text style={styles.detailValue}>{distance}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Teléfono</Text>
            <Text style={styles.detailValue}>{phone}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Correo</Text>
            <Text style={styles.detailValue}>{email}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vehículo</Text>
            <Text style={styles.detailValue}>{vehicle}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Placa</Text>
            <Text style={styles.detailValue}>{plate}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <MaterialCommunityIcons name="message-text-outline" size={20} color="#e8e8e8" />
            <Text style={styles.actionText}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="call" size={20} color="#e8e8e8" />
            <Text style={styles.actionText}>Llamar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="help-circle-outline" size={20} color="#e8e8e8" />
            <Text style={styles.actionText}>Ayuda</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  mapArea: {
    flex: 1,
    backgroundColor: '#101a30',
    overflow: 'hidden',
  },
  map: { flex: 1 },
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 18,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  originMarkerPin: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(24, 216, 176, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  originMarkerDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: THEME.primary,
  },
  driverMarkerPin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: THEME.warning,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0d1221',
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    backgroundColor: '#0a0a0b',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -22,
  },
  sheetHandle: {
    width: 34,
    height: 4,
    borderRadius: 99,
    backgroundColor: '#444',
    alignSelf: 'center',
    marginBottom: 12,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  stepItem: {
    alignItems: 'center',
    width: 78,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDone: {
    backgroundColor: THEME.primary,
  },
  stepPending: {
    backgroundColor: '#292929',
  },
  stepLabel: {
    color: '#adadad',
    marginTop: 8,
    fontSize: 12,
  },
  stepLabelMuted: {
    color: '#8a8a8a',
    marginTop: 8,
    fontSize: 12,
  },
  stepLine: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    marginHorizontal: 4,
    backgroundColor: '#2d2d2d',
    marginBottom: 16,
  },
  stepLineActive: {
    backgroundColor: THEME.primary,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191919',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#2b2b2b',
    marginBottom: 18,
  },
  driverAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111b1f',
  },
  driverAvatarText: {
    fontSize: 22,
  },
  driverInfo: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 10,
  },
  driverName: {
    color: '#f3f3f3',
    fontSize: 18,
    fontWeight: '700',
  },
  driverMeta: {
    color: '#9a9a9a',
    fontSize: 12,
    marginTop: 2,
  },
  minutesBox: {
    width: 66,
    height: 54,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minutesValue: {
    color: THEME.primary,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 24,
  },
  minutesLabel: {
    color: THEME.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 8,
    marginTop: 14,
  },
  detailsCard: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2d2d2d',
    backgroundColor: '#151515',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  detailLabel: {
    color: '#8f8f8f',
    fontSize: 12,
  },
  detailValue: {
    color: '#e9e9e9',
    fontSize: 12,
    fontWeight: '700',
    maxWidth: '62%',
    textAlign: 'right',
  },
  actionBtn: {
    flex: 1,
    height: 60,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#2e2e2e',
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  actionText: {
    color: '#ededed',
    fontSize: 14,
    fontWeight: '500',
  },
});