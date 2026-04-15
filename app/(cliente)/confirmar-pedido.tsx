import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MapView, Marker } from '../../src/components/map';
import { AuthContext } from '../../src/context/AuthContext';
import { driverService, NearbyDriver } from '../../src/services/driverService';
import { orderService } from '../../src/services/orderService';

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

const FARE_CONFIG = {
  base: 4000,
  perKm: 1200,
  perMinute: 120,
  minimum: 5000,
};

const AVERAGE_SPEED_KMPH = 22;
const MINUTES_BUFFER = 4;

const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function ConfirmarPedido() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  
  // Estados
  const [destino, setDestino] = useState('');
  const [origen, setOrigen] = useState('');
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState<NearbyDriver[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [driverListOpen, setDriverListOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<NearbyDriver | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [originCoords, setOriginCoords] = useState<Location.LocationGeocodedLocation | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<Location.LocationGeocodedLocation | null>(null);
  const [estimatedKm, setEstimatedKm] = useState(2.5);
  const [estimatedMinutes, setEstimatedMinutes] = useState(12);
  const [estimatedFare, setEstimatedFare] = useState(8500);
  const [isEstimating, setIsEstimating] = useState(false);

  const activeDrivers = useMemo(
    () => drivers.filter((driver) => driver.disponible !== false),
    [drivers]
  );

  const getClientId = () => user?.id || user?.userId || 1;

  useEffect(() => {
    const loadNearbyDrivers = async () => {
      setLoadingDrivers(true);

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          Alert.alert('Ubicación requerida', 'Permite la ubicación para cargar domiciliarios activos.');
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setCurrentLocation(location);

        const nearbyDrivers = await driverService.getNearbyDrivers(
          location.coords.latitude,
          location.coords.longitude,
          5
        );

        setDrivers(nearbyDrivers);

        const firstActiveDriver = nearbyDrivers.find((driver) => driver.disponible !== false) ?? null;
        setSelectedDriver(firstActiveDriver);
      } catch (error) {
        console.error('Error cargando domiciliarios activos:', error);
        Alert.alert('Sin domiciliarios', 'No se pudo cargar la lista de domiciliarios activos.');
      } finally {
        setLoadingDrivers(false);
      }
    };

    void loadNearbyDrivers();
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const recalculateEstimate = async () => {
      const pickupKm = Math.max(selectedDriver?.distancia ?? 0.3, 0.3);
      let travelKm = 2.5;
      let nextOriginCoords: Location.LocationGeocodedLocation | null = null;
      let nextDestinationCoords: Location.LocationGeocodedLocation | null = null;

      if (origen.trim() && destino.trim()) {
        setIsEstimating(true);

        try {
          const [originGeocode, destinationGeocode] = await Promise.all([
            Location.geocodeAsync(origen),
            Location.geocodeAsync(destino),
          ]);

          nextOriginCoords = originGeocode[0] ?? null;
          nextDestinationCoords = destinationGeocode[0] ?? null;

          if (nextOriginCoords && nextDestinationCoords) {
            travelKm = calculateDistanceKm(
              nextOriginCoords.latitude,
              nextOriginCoords.longitude,
              nextDestinationCoords.latitude,
              nextDestinationCoords.longitude
            );
          }
        } catch (error) {
          console.error('No se pudo geocodificar para estimar tarifa:', error);
        } finally {
          if (!isCancelled) {
            setIsEstimating(false);
          }
        }
      }

      if (isCancelled) {
        return;
      }

      const totalKm = Math.max(pickupKm + travelKm, 0.5);
      const minutesByDistance = (totalKm / AVERAGE_SPEED_KMPH) * 60;
      const computedMinutes = Math.max(Math.round(minutesByDistance + MINUTES_BUFFER), 8);
      const rawFare =
        FARE_CONFIG.base +
        totalKm * FARE_CONFIG.perKm +
        computedMinutes * FARE_CONFIG.perMinute;
      const computedFare = Math.max(Math.round(rawFare / 100) * 100, FARE_CONFIG.minimum);

      setEstimatedKm(totalKm);
      setEstimatedMinutes(computedMinutes);
      setEstimatedFare(computedFare);
      setOriginCoords(nextOriginCoords);
      setDestinationCoords(nextDestinationCoords);
    };

    void recalculateEstimate();

    return () => {
      isCancelled = true;
    };
  }, [origen, destino, selectedDriver]);

  const enviarPedido = async () => {
    console.log("LOG: 1. Iniciando proceso...");
    if (!origen.trim()) return Alert.alert('Error', 'Escribe el lugar de recogida');
    if (!destino.trim()) return Alert.alert("Error", "Escribe el destino");
    if (!selectedDriver) return Alert.alert('Sin domiciliario', 'Selecciona un domiciliario activo para continuar.');

    setLoading(true);
    try {
      const payload = {
        id_cliente: getClientId(),
        id_domiciliario: selectedDriver.id,
        direccion_origen: origen,
        direccion_destino: destino,
        lat_origen: originCoords?.latitude || currentLocation?.coords.latitude || 7.8939,
        lon_origen: originCoords?.longitude || currentLocation?.coords.longitude || -72.4842,
        lat_destino: destinationCoords?.latitude || (currentLocation?.coords.latitude || 7.8939) - 0.003,
        lon_destino: destinationCoords?.longitude || (currentLocation?.coords.longitude || -72.4842) + 0.003,
        tarifa: estimatedFare,
        tiempo_estimado: estimatedMinutes,
        descripcion: descripcion,
        estado: 'CREADO'
      };

      console.log("LOG: 2. Enviando a Java...", payload);
      const res = await orderService.createOrder(payload);
      
      console.log("LOG: 3. Éxito:", res);
      Alert.alert('Solicitud confirmada', 'Tu pedido fue creado con éxito. Te avisaremos cuando un domiciliario lo acepte.');
      
      router.push({
        pathname: '/(cliente)/seguimiento',
        params: {
          driverId: String(selectedDriver.id),
          driverName: selectedDriver.nombre || 'Domiciliario asignado',
          driverVehicle: selectedDriver.vehiculo || 'Moto',
          driverPlate: selectedDriver.placa || 'Sin placa',
          driverLat: String(selectedDriver.latitud || currentLocation?.coords.latitude || 7.8939),
          driverLon: String(selectedDriver.longitud || currentLocation?.coords.longitude || -72.4842),
          userLat: String(currentLocation?.coords.latitude || 7.8939),
          userLon: String(currentLocation?.coords.longitude || -72.4842),
        },
      });

    } catch (error: any) {
      console.error("❌ ERROR:", error.response?.data || error.message);
      Alert.alert('Error', 'No se pudo conectar. Mira la consola F12.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* CABECERA MAPA */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            customMapStyle={CUSTOM_MAP_STYLE}
            region={{
              latitude: currentLocation?.coords.latitude || 7.8939,
              longitude: currentLocation?.coords.longitude || -72.4842,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            {currentLocation && (
              <Marker
                coordinate={{
                  latitude: currentLocation.coords.latitude,
                  longitude: currentLocation.coords.longitude,
                }}
                title="Tu ubicación"
              >
                <View style={styles.userMarker}>
                  <View style={styles.userMarkerInner} />
                </View>
              </Marker>
            )}

            {selectedDriver && Number.isFinite(selectedDriver.latitud) && Number.isFinite(selectedDriver.longitud) && (
              <Marker
                coordinate={{
                  latitude: selectedDriver.latitud,
                  longitude: selectedDriver.longitud,
                }}
                title={selectedDriver.nombre || 'Domiciliario'}
              >
                <View style={styles.driverMarker}>
                  <Ionicons name="bicycle" size={16} color="#0a0f1c" />
                </View>
              </Marker>
            )}
          </MapView>

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsPanel}>
          <Text style={styles.panelTitle}>Detalles del servicio</Text>

          {/* CARD DOMICILIARIO */}
          <View style={styles.driverCard}>
            <View style={styles.driverInfo}>
              <View style={styles.avatar}><Text style={{fontSize: 20}}>🧑</Text></View>
              <View>
                <Text style={styles.driverName}>{selectedDriver?.nombre || 'Sin domiciliario asignado'}</Text>
                <Text style={styles.driverStats}>
                  {selectedDriver
                    ? `⭐ ${selectedDriver.calificacion?.toFixed(1) || 'N/A'} · ${selectedDriver.distancia?.toFixed(1) || '?'} km de ti`
                    : 'Elige un domiciliario activo'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setDriverListOpen((prev) => !prev)}>
              {loadingDrivers ? (
                <ActivityIndicator size="small" color="#17d5aa" />
              ) : (
                <Text style={styles.changeBtn}>Cambiar</Text>
              )}
            </TouchableOpacity>
          </View>

          {driverListOpen && (
            <View style={styles.driverListCard}>
              <Text style={styles.driverListTitle}>Domiciliarios activos ({activeDrivers.length})</Text>

              {activeDrivers.length === 0 ? (
                <Text style={styles.driverEmpty}>No hay domiciliarios activos disponibles.</Text>
              ) : (
                activeDrivers.map((driver) => {
                  const isSelected = selectedDriver?.id === driver.id;

                  return (
                    <TouchableOpacity
                      key={driver.id}
                      style={[styles.driverOption, isSelected && styles.driverOptionSelected]}
                      onPress={() => {
                        setSelectedDriver(driver);
                        setDriverListOpen(false);
                      }}
                    >
                      <View>
                        <Text style={styles.driverOptionName}>{driver.nombre}</Text>
                        <Text style={styles.driverOptionMeta}>
                          ⭐ {driver.calificacion?.toFixed(1) || 'N/A'} · {driver.distancia?.toFixed(1) || '?'} km
                        </Text>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={20} color="#17d5aa" />}
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}

          {/* CARD DIRECCIONES */}
          <View style={styles.addressCard}>
            <View style={styles.addressRow}>
              <View style={[styles.dot, {backgroundColor: '#17d5aa'}]} />
              <View style={{flex: 1}}>
                <Text style={styles.addrLabel}>ORIGEN</Text>
                <TextInput
                  style={[styles.addrInput, { color: 'white' }]}
                  value={origen}
                  onChangeText={setOrigen}
                  placeholder="Escriba su lugar de recogida"
                  placeholderTextColor="#6f7785"
                />
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.addressRow}>
              <View style={[styles.dot, {backgroundColor: '#f4b400'}]} />
              <View style={{flex: 1}}>
                <Text style={styles.addrLabel}>DESTINO</Text>
                <TextInput
                  style={[styles.addrInput, { color: 'white' }]}
                  value={destino}
                  onChangeText={setDestino}
                  placeholder="Escriba su destino"
                  placeholderTextColor="#6f7785"
                />
              </View>
            </View>
          </View>

          {/* DESCRIPCIÓN */}
          <TextInput 
            style={styles.textArea} 
            placeholder="Descripción del encargo (opcional)..." 
            placeholderTextColor="#555"
            multiline
            value={descripcion}
            onChangeText={setDescripcion}
          />

          {/* RESUMEN */}
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Tarifa estimada</Text>
              <Text style={styles.summaryPrice}>${estimatedFare.toLocaleString('es-CO')}</Text>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.summaryLabel}>Tiempo estimado</Text>
              <Text style={styles.summaryTime}>~{estimatedMinutes} min</Text>
              <Text style={styles.summaryDistance}>{estimatedKm.toFixed(1)} km</Text>
              {isEstimating && <Text style={styles.summaryCalculating}>Calculando...</Text>}
            </View>
          </View>

          {/* BOTÓN CONFIRMAR */}
          <TouchableOpacity style={styles.confirmBtn} onPress={enviarPedido} disabled={loading}>
            {loading ? <ActivityIndicator color="#0a0f1c" /> : <Text style={styles.confirmBtnText}>Confirmar solicitud</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1c' },
  mapContainer: { height: 350, backgroundColor: '#131b2f' },
  map: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.4)', padding: 10, borderRadius: 10 },
  userMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(23, 213, 170, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#17d5aa',
  },
  driverMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#17d5aa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0a0f1c',
  },
  detailsPanel: { marginTop: -20, backgroundColor: '#0a0f1c', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  panelTitle: { color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  driverCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#171a22', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(23, 213, 170, 0.3)', marginBottom: 15 },
  driverInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#0f1e20', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#17d5aa' },
  driverName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  driverStats: { color: '#8d95a4', fontSize: 12 },
  changeBtn: { color: '#17d5aa', fontWeight: 'bold' },
  driverListCard: {
    backgroundColor: '#171a22',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#2a3040',
  },
  driverListTitle: { color: '#c6cedd', fontSize: 13, marginBottom: 10, fontWeight: '600' },
  driverEmpty: { color: '#8d95a4', fontSize: 13 },
  driverOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#252b3a',
  },
  driverOptionSelected: { backgroundColor: 'rgba(23, 213, 170, 0.08)' },
  driverOptionName: { color: 'white', fontSize: 15, fontWeight: '600' },
  driverOptionMeta: { color: '#8d95a4', fontSize: 12, marginTop: 2 },
  addressCard: { backgroundColor: '#171a22', borderRadius: 10, padding: 15, marginBottom: 15 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  addrLabel: { color: '#8d95a4', fontSize: 10, fontWeight: 'bold' },
  addrInput: { fontSize: 16, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#2a3040', marginVertical: 12, marginLeft: 22 },
  textArea: { backgroundColor: '#171a22', borderRadius: 10, padding: 15, color: 'white', height: 80, marginBottom: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  summaryLabel: { color: '#8d95a4', fontSize: 14, marginBottom: 5 },
  summaryPrice: { color: '#17d5aa', fontSize: 42, fontWeight: 'bold' },
  summaryTime: { color: '#17d5aa', fontSize: 24, fontWeight: 'bold' },
  summaryDistance: { color: '#8d95a4', fontSize: 13, marginTop: 2 },
  summaryCalculating: { color: '#8d95a4', fontSize: 12, marginTop: 4 },
  confirmBtn: { backgroundColor: '#17d5aa', paddingVertical: 20, borderRadius: 10, alignItems: 'center' },
  confirmBtnText: { color: '#0a0f1c', fontSize: 22, fontWeight: 'bold' }
});