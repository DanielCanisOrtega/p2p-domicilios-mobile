import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NearbyDriver, driverService } from '../../src/services/driverService';

const { width } = Dimensions.get('window');

export default function PedidosTab() {
  const router = useRouter();
  const { preferredDriverId } = useLocalSearchParams<{ preferredDriverId?: string }>();
  const [drivers, setDrivers] = useState<NearbyDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverListOpen, setDriverListOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<NearbyDriver | null>(null);

  const activeDrivers = useMemo(
    () => drivers.filter((driver) => driver.disponible !== false),
    [drivers]
  );

  const featuredDriver = selectedDriver ?? activeDrivers[0] ?? null;

  const getDriverName = (driver: NearbyDriver | null) => {
    if (!driver) {
      return 'Sin domiciliario cercano';
    }

    return driver.nombre?.trim() || `Domiciliario ${driver.id}`;
  };

  const getDriverContact = (driver: NearbyDriver | null) => {
    if (!driver) {
      return 'No disponible';
    }

    return driver.email?.trim() || 'No disponible';
  };

  const getDriverPhone = (driver: NearbyDriver | null) => {
    if (!driver) {
      return 'No disponible';
    }

    return driver.telefono?.trim() || 'No disponible';
  };

  const pickPreferredDriver = useCallback(
    (availableDrivers: NearbyDriver[]) => {
      const activeDrivers = availableDrivers.filter((driver) => driver.disponible !== false);
      const parsedPreferredDriverId = Number(preferredDriverId);

      if (Number.isFinite(parsedPreferredDriverId) && parsedPreferredDriverId > 0) {
        const preferredDriver = activeDrivers.find((driver) => driver.id === parsedPreferredDriverId);
        if (preferredDriver) {
          return preferredDriver;
        }
      }

      return activeDrivers[0] ?? null;
    },
    [preferredDriverId]
  );

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
        setSelectedDriver(pickPreferredDriver(nearbyDrivers));
      } catch (error) {
        console.error('Error cargando domiciliarios en solicitar:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadDrivers();
  }, [pickPreferredDriver]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={{ fontSize: 40 }}>👨‍🍳</Text>
          </View>
          <Text style={styles.driverName}>{getDriverName(featuredDriver)}</Text>
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
            <Text style={styles.statVal}>{featuredDriver?.verificado ? 'SI' : 'NO'}</Text>
            <Text style={styles.statLab}>VERIFICADO</Text>
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
            <Text style={styles.detailLabel}>🔖 Placa</Text>
            <Text style={styles.detailValue}>{featuredDriver?.placa || 'No registrada'}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📩 Contacto</Text>
            <Text style={styles.detailValue}>{getDriverContact(featuredDriver)}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📞 Teléfono</Text>
            <Text style={styles.detailValue}>{getDriverPhone(featuredDriver)}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>✅ Verificado</Text>
            <Text style={[styles.detailValue, { color: featuredDriver?.verificado ? '#17d5aa' : '#f4b400' }]}>
              {featuredDriver ? (featuredDriver.verificado ? 'Sí' : 'Pendiente') : 'N/A'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.reloadDriverButton}
          onPress={() => {
            setLoading(true);
            void (async () => {
              try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
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
                setSelectedDriver((prev) => {
                  if (!prev) {
                    return nearbyDrivers.find((driver) => driver.disponible !== false) ?? null;
                  }

                  return nearbyDrivers.find((driver) => driver.id === prev.id && driver.disponible !== false)
                    ?? nearbyDrivers.find((driver) => driver.disponible !== false)
                    ?? null;
                });
              } catch (error) {
                console.error('Error recargando domiciliarios en solicitar:', error);
              } finally {
                setLoading(false);
              }
            })();
          }}
          disabled={loading}
        >
          <Text style={styles.reloadDriverButtonText}>{loading ? 'Recargando...' : 'Recargar domiciliarios'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.changeDriverButton}
          onPress={() => setDriverListOpen((prev) => !prev)}
          disabled={loading || activeDrivers.length === 0}
        >
          <Text style={styles.changeDriverButtonText}>
            {driverListOpen ? 'Ocultar domiciliarios' : 'Cambiar domiciliario'}
          </Text>
        </TouchableOpacity>

        {driverListOpen && (
          <View style={styles.driverListCard}>
            <Text style={styles.driverListTitle}>Domiciliarios activos ({activeDrivers.length})</Text>

            {activeDrivers.length === 0 ? (
              <Text style={styles.driverListEmpty}>No hay domiciliarios activos disponibles.</Text>
            ) : (
              activeDrivers.map((driver) => {
                const isSelected = featuredDriver?.id === driver.id;

                return (
                  <TouchableOpacity
                    key={driver.id}
                    style={[styles.driverOption, isSelected && styles.driverOptionSelected]}
                    onPress={() => {
                      setSelectedDriver(driver);
                      setDriverListOpen(false);
                    }}
                  >
                    <View style={styles.driverOptionMain}>
                      <Text style={styles.driverOptionName}>{getDriverName(driver)}</Text>
                      <Text style={styles.driverOptionMeta}>
                        ⭐ {driver.calificacion?.toFixed(1) || 'N/A'} · {driver.distancia?.toFixed(1) || '?'} km
                      </Text>
                      <Text style={styles.driverOptionMeta}>
                        {driver.vehiculo || 'Moto'} · Placa {driver.placa || 'No registrada'}
                      </Text>
                      <Text style={styles.driverOptionMeta}>Contacto: {getDriverContact(driver)}</Text>
                    </View>
                    <Text style={[styles.driverOptionAction, isSelected && styles.driverOptionActionSelected]}>
                      {isSelected ? 'Seleccionado' : 'Seleccionar'}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.btn} 
        onPress={() =>
          router.push({
            pathname: '/(cliente)/confirmar-pedido',
            params: {
              preferredDriverId: featuredDriver ? String(featuredDriver.id) : '',
            },
          })
        }
        disabled={!featuredDriver}
      >
        <Text style={styles.btnText}>Solicitar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1c', paddingHorizontal: 20 },
  content: { flex: 1 },
  contentContainer: { paddingTop: 60, paddingBottom: 16 },
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
  changeDriverButton: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#17d5aa',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  changeDriverButtonText: { color: '#17d5aa', fontSize: 14, fontWeight: '700' },
  driverListCard: {
    marginTop: 12,
    backgroundColor: '#171a22',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3040',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  driverListTitle: { color: '#c6cedd', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  driverListEmpty: { color: '#8d95a4', fontSize: 13, marginBottom: 6 },
  driverOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3040',
    paddingVertical: 10,
  },
  driverOptionSelected: { backgroundColor: 'rgba(23, 213, 170, 0.08)' },
  driverOptionMain: { flex: 1 },
  driverOptionName: { color: 'white', fontSize: 15, fontWeight: '700' },
  driverOptionMeta: { color: '#8d95a4', fontSize: 12, marginTop: 2 },
  driverOptionAction: { color: '#17d5aa', fontSize: 12, fontWeight: '700', marginTop: 2 },
  driverOptionActionSelected: { color: '#0a0f1c', backgroundColor: '#17d5aa', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 999 },
  reloadDriverButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#2a3040',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#171a22',
  },
  reloadDriverButtonText: { color: '#8fd6ff', fontSize: 13, fontWeight: '700' },
  btn: { backgroundColor: '#17d5aa', paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginBottom: 30 },
  btnText: { color: '#0a0f1c', fontSize: 18, fontWeight: 'bold' }
});
