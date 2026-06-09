import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { adminService, type DriverVerification } from '../../src/services/adminService';

export default function DriverVerificationScreen() {
  const [drivers, setDrivers] = useState<DriverVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<DriverVerification | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadDrivers = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await adminService.getPendingDrivers(false);
      setDrivers(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'No se pudo cargar domiciliarios pendientes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDrivers();
  }, [loadDrivers]);

  const viewDocuments = async (userId: number) => {
    setProcessingId(userId);
    try {
      const detail = await adminService.getDriverDocuments(userId);
      setSelected(detail);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo consultar la informacion del domiciliario');
    } finally {
      setProcessingId(null);
    }
  };

  const decide = async (userId: number, decision: 'APPROVE' | 'REJECT') => {
    setProcessingId(userId);
    try {
      const updated =
        decision === 'APPROVE'
          ? await adminService.approveDriver(userId)
          : await adminService.rejectDriver(userId);

      setSelected(updated);
      setDrivers((prev) => prev.filter((driver) => driver.userId !== userId));
      Alert.alert('Exito', decision === 'APPROVE' ? 'Domiciliario aprobado' : 'Domiciliario rechazado');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo registrar la decision');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadDrivers(true)} />}
      >
        <Text style={styles.title}>Verificacion de domiciliarios</Text>
        <Text style={styles.subtitle}>RF15: validar metadata y aprobar o rechazar</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#17d5aa" />
            <Text style={styles.loadingText}>Cargando pendientes...</Text>
          </View>
        ) : drivers.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No hay domiciliarios pendientes por verificar.</Text>
          </View>
        ) : (
          drivers.map((driver) => {
            const busy = processingId === driver.userId;
            return (
              <View key={driver.userId} style={styles.driverCard}>
                <View style={styles.driverHeader}>
                  <Text style={styles.driverName}>{driver.nombre || driver.username}</Text>
                  <Text style={styles.driverStatus}>{driver.verificado ? 'VERIFICADO' : 'PENDIENTE'}</Text>
                </View>
                <Text style={styles.driverMeta}>@{driver.username}</Text>
                <Text style={styles.driverMeta}>{driver.email}</Text>
                <Text style={styles.driverMeta}>Doc: {driver.numeroDocumento || 'N/A'}</Text>
                <Text style={styles.driverMeta}>Vehiculo: {driver.vehiculo || 'N/A'} - {driver.placa || 'N/A'}</Text>
                <Text style={styles.driverMeta}>Estado usuario: {driver.estadoUsuario || 'N/A'}</Text>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.metaBtn}
                    onPress={() => void viewDocuments(driver.userId)}
                    disabled={busy}
                  >
                    <Text style={styles.metaBtnText}>Ver informacion</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => void decide(driver.userId, 'APPROVE')}
                    disabled={busy}
                  >
                    <Text style={styles.actionText}>Aprobar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => void decide(driver.userId, 'REJECT')}
                    disabled={busy}
                  >
                    <Text style={styles.actionText}>Rechazar</Text>
                  </TouchableOpacity>
                </View>

                {busy && (
                  <View style={styles.processingRow}>
                    <ActivityIndicator size="small" color="#17d5aa" />
                    <Text style={styles.processingText}>Procesando...</Text>
                  </View>
                )}
              </View>
            );
          })
        )}

        {selected && (
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>Detalle seleccionado</Text>
            <Text style={styles.detailLine}>User ID: {selected.userId}</Text>
            <Text style={styles.detailLine}>Domiciliario ID: {selected.domiciliarioId || 'N/A'}</Text>
            <Text style={styles.detailLine}>Nombre: {selected.nombre || selected.username}</Text>
            <Text style={styles.detailLine}>Email: {selected.email}</Text>
            <Text style={styles.detailLine}>Telefono: {selected.telefono || 'N/A'}</Text>
            <Text style={styles.detailLine}>Documento: {selected.numeroDocumento || 'N/A'}</Text>
            <Text style={styles.detailLine}>Vehiculo: {selected.vehiculo || 'N/A'}</Text>
            <Text style={styles.detailLine}>Placa: {selected.placa || 'N/A'}</Text>
            <Text style={styles.detailLine}>Verificado: {selected.verificado ? 'true' : 'false'}</Text>
            <Text style={styles.detailLine}>Disponible: {selected.disponible ? 'true' : 'false'}</Text>
            <Text style={styles.detailLine}>Enabled: {selected.enabled ? 'true' : 'false'}</Text>
            <Text style={styles.detailLine}>Estado usuario: {selected.estadoUsuario || 'N/A'}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1c' },
  content: { padding: 18, paddingBottom: 28 },
  title: { color: '#fff', fontSize: 28, fontWeight: '700' },
  subtitle: { color: '#8d95a4', fontSize: 12, marginTop: 4, marginBottom: 14 },
  errorText: {
    color: '#f0b4b4',
    backgroundColor: '#241113',
    borderWidth: 1,
    borderColor: '#5b262b',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  loadingBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 8 },
  loadingText: { color: '#8d95a4' },
  emptyBox: {
    backgroundColor: '#111720',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3040',
    padding: 16,
  },
  emptyText: { color: '#8d95a4' },
  driverCard: {
    backgroundColor: '#111720',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3040',
    padding: 12,
    marginBottom: 10,
  },
  driverHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  driverName: { color: '#fff', fontSize: 16, fontWeight: '700', flexShrink: 1, paddingRight: 8 },
  driverStatus: { color: '#17d5aa', fontSize: 11, fontWeight: '700' },
  driverMeta: { color: '#8d95a4', fontSize: 12, marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  metaBtn: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8fd6ff',
    backgroundColor: '#11202d',
    alignItems: 'center',
    paddingVertical: 8,
  },
  metaBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  approveBtn: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#17d5aa',
    backgroundColor: '#0f2a22',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rejectBtn: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff5a5f',
    backgroundColor: '#301317',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  processingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  processingText: { color: '#8d95a4', fontSize: 12 },
  detailCard: {
    marginTop: 10,
    backgroundColor: '#111720',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3040',
    padding: 12,
  },
  detailTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 8 },
  detailLine: { color: '#c6cedd', fontSize: 12, marginTop: 2 },
});
