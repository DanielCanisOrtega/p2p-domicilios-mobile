import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { incidentService, type Incidencia } from '../../src/services/incidentService';

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_REVISION: 'En revisión',
  RESUELTO: 'Resuelto',
  RECHAZADO: 'Rechazado',
};

const STATUS_COLORS: Record<string, string> = {
  PENDIENTE: '#f4b400',
  EN_REVISION: '#8fd6ff',
  RESUELTO: '#7bd85a',
  RECHAZADO: '#ff5a5f',
};

const formatDate = (value?: string) => {
  if (!value) return 'Sin fecha';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export default function AdminIncidenciasScreen() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadIncidents = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await incidentService.getAllIncidents();
      setIncidents(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'No se pudieron cargar las incidencias');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadIncidents();
  }, [loadIncidents]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadIncidents(true)} />}
      >
        <Text style={styles.title}>Incidencias</Text>
        <Text style={styles.subtitle}>Gestiona los reportes de incidencias de servicios.</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#17d5aa" />
            <Text style={styles.loadingText}>Cargando incidencias...</Text>
          </View>
        ) : incidents.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No hay incidencias registradas.</Text>
          </View>
        ) : (
          incidents.map((incident) => (
            <TouchableOpacity
              key={incident.id}
              style={styles.incidentCard}
              onPress={() =>
                router.push({
                  pathname: '/(admin)/incidencia-detalle',
                  params: { id: String(incident.id) },
                })
              }
            >
              <View style={styles.incidentHeader}>
                <Text style={styles.incidentId}>#{incident.id}</Text>
                <View style={[styles.statusPill, { borderColor: STATUS_COLORS[incident.estado] || '#666' }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[incident.estado] || '#666' }]}>
                    {STATUS_LABELS[incident.estado] || incident.estado}
                  </Text>
                </View>
              </View>

              <Text style={styles.incidentService}>Servicio #{incident.idServicio}</Text>

              {incident.tipo ? (
                <View style={styles.tipoBadge}>
                  <Text style={styles.tipoBadgeText}>{incident.tipo}</Text>
                </View>
              ) : null}

              <Text style={styles.incidentDesc} numberOfLines={2}>
                {incident.descripcion}
              </Text>

              <View style={styles.incidentFooter}>
                <Ionicons name="time-outline" size={12} color="#8d95a4" />
                <Text style={styles.incidentDate}>{formatDate(incident.fechaCreacion)}</Text>
              </View>
            </TouchableOpacity>
          ))
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
    color: '#f0b4b4', backgroundColor: '#241113', borderWidth: 1, borderColor: '#5b262b',
    borderRadius: 10, padding: 10, marginBottom: 12,
  },
  loadingBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 8 },
  loadingText: { color: '#8d95a4' },
  emptyBox: {
    backgroundColor: '#111720', borderRadius: 12, borderWidth: 1, borderColor: '#2a3040', padding: 16,
  },
  emptyText: { color: '#8d95a4' },
  incidentCard: {
    backgroundColor: '#111720', borderRadius: 12, borderWidth: 1, borderColor: '#2a3040',
    padding: 14, marginBottom: 10,
  },
  incidentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  incidentId: { color: '#8fd6ff', fontSize: 13, fontWeight: '700' },
  statusPill: {
    borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  incidentService: { color: '#c6cedd', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  tipoBadge: {
    alignSelf: 'flex-start', backgroundColor: '#11202d', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3, marginBottom: 6,
    borderWidth: 1, borderColor: '#2a5060',
  },
  tipoBadgeText: { color: '#8fd6ff', fontSize: 11, fontWeight: '600' },
  incidentDesc: { color: '#fff', fontSize: 14, lineHeight: 20, marginBottom: 8 },
  incidentFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  incidentDate: { color: '#8d95a4', fontSize: 11 },
});
