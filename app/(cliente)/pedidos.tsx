import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NearbyDriver, driverService } from '../../src/services/driverService';

const { width } = Dimensions.get('window');

export default function PedidosTab() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<NearbyDriver[]>([]);
  const [loading, setLoading] = useState(true);

  const activeDrivers = useMemo(
    () => drivers.filter((driver) => driver.disponible !== false),
    [drivers]
  );

  const featuredDriver = activeDrivers[0] ?? null;

  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const nearbyDrivers = await driverService.getNearbyDrivers(
          location.coords.latitude,
          location.coords.longitude,
          5
        );

        setDrivers(nearbyDrivers);
      } catch (error) {
        console.error('Error cargando domiciliarios en solicitar:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadDrivers();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={{ fontSize: 40 }}>👨‍🍳</Text>
          </View>
          <Text style={styles.driverName}>{featuredDriver?.nombre || 'Sin domiciliario cercano'}</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{featuredDriver ? 'Disponible ahora' : 'Sin disponibilidad'}</Text>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#17d5aa" />
            <Text style={styles.loadingText}>Buscando domiciliario real...</Text>
          </View>
        )}

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: '#f4b400' }]}>{featuredDriver?.calificacion?.toFixed(1) || 'N/A'}</Text>
            <Text style={styles.statLab}>CALIFICACIÓN</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{activeDrivers.length}</Text>
            <Text style={styles.statLab}>ENTREGAS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: '#17d5aa' }]}>{featuredDriver?.distancia ? `${featuredDriver.distancia.toFixed(1)}km` : '--'}</Text>
            <Text style={styles.statLab}>DISTANCIA</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🛵 Vehículo</Text>
            <Text style={styles.detailValue}>{featuredDriver?.vehiculo || 'No disponible'}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📍 Zona</Text>
            <Text style={styles.detailValue}>Cúcuta</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>⏱️ Resp. prom.</Text>
            <Text style={[styles.detailValue, { color: '#17d5aa' }]}>{featuredDriver ? '~5 min' : 'N/A'}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>✅ Verificado</Text>
            <Text style={[styles.detailValue, { color: '#17d5aa' }]}>{featuredDriver ? 'Sí' : 'N/A'}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.btn} 
        onPress={() => router.push('/(cliente)/confirmar-pedido')}
      >
        <Text style={styles.btnText}>Solicitar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1c', paddingHorizontal: 20 },
  content: { flex: 1, paddingTop: 60 },
  profileHeader: { alignItems: 'center', marginBottom: 30 },
  avatarContainer: { width: 90, height: 90, borderRadius: 15, backgroundColor: '#171a22', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#17d5aa' },
  driverName: { color: 'white', fontSize: 28, fontWeight: 'bold', marginTop: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#17d5aa', marginRight: 8 },
  statusText: { color: '#17d5aa', fontSize: 14 },
  loadingBox: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  loadingText: { color: '#8d95a4', fontSize: 13 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statCard: { width: (width - 60) / 3, backgroundColor: '#171a22', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  statVal: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  statLab: { color: '#8d95a4', fontSize: 10, marginTop: 4 },
  detailsCard: { backgroundColor: '#171a22', borderRadius: 12, padding: 15 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  detailLabel: { color: '#8d95a4', fontSize: 15 },
  detailValue: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  separator: { height: 1, backgroundColor: '#2a3040' },
  btn: { backgroundColor: '#17d5aa', paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginBottom: 30 },
  btnText: { color: '#0a0f1c', fontSize: 18, fontWeight: 'bold' }
});