import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { incidentService, type Incidencia, type IncidenciaEstado } from '../../src/services/incidentService';

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

const TRANSITIONS: { label: string; estado: IncidenciaEstado; color: string; bg: string; border: string }[] = [
  { label: 'En revisión', estado: 'EN_REVISION', color: '#0a0f1c', bg: '#8fd6ff', border: '#8fd6ff' },
  { label: 'Resolver', estado: 'RESUELTO', color: '#0a0f1c', bg: '#7bd85a', border: '#7bd85a' },
  { label: 'Rechazar', estado: 'RECHAZADO', color: '#fff', bg: '#301317', border: '#ff5a5f' },
];

const formatDate = (value?: string) => {
  if (!value) return 'Sin fecha';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export default function IncidenciaDetalleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [incident, setIncident] = useState<Incidencia | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadIncident = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await incidentService.getAllIncidents();
      const found = data.find((i) => i.id === Number(id));
      if (found) {
        setIncident(found);
        setError(null);
      } else {
        setError('Incidencia no encontrada');
      }
    } catch (err: any) {
      setError(err?.message || 'No se pudo cargar la incidencia');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadIncident();
  }, [loadIncident]);

  const handleUpdateStatus = async (estado: IncidenciaEstado) => {
    if (!id) return;
    setUpdating(true);
    try {
      const updated = await incidentService.updateIncidentStatus(Number(id), estado);
      setIncident(updated);
      Alert.alert('Actualizado', `Incidencia marcada como "${STATUS_LABELS[estado] || estado}".`);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo actualizar el estado');
    } finally {
      setUpdating(false);
    }
  };

  const confirmUpdate = (estado: IncidenciaEstado) => {
    const label = STATUS_LABELS[estado] || estado;
    Alert.alert(
      'Confirmar cambio',
      `¿Estás seguro de marcar esta incidencia como "${label}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => void handleUpdateStatus(estado) },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#17d5aa" />
          <Text style={styles.loadingText}>Cargando incidencia...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !incident) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.errorText}>{error || 'Incidencia no encontrada'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentStatusColor = STATUS_COLORS[incident.estado] || '#666';
  const availableTransitions = TRANSITIONS.filter((t) => t.estado !== incident.estado);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerRow}>
          <Text style={styles.title}>Incidencia #{incident.id}</Text>
          <View style={[styles.statusPill, { borderColor: currentStatusColor }]}>
            <Text style={[styles.statusText, { color: currentStatusColor }]}>
              {STATUS_LABELS[incident.estado] || incident.estado}
            </Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Servicio</Text>
            <Text style={styles.detailValue}>#{incident.idServicio}</Text>
          </View>
          {incident.tipo ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tipo</Text>
              <Text style={styles.detailValue}>{incident.tipo}</Text>
            </View>
          ) : null}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Creada</Text>
            <Text style={styles.detailValue}>{formatDate(incident.fechaCreacion)}</Text>
          </View>
          {incident.fechaActualizacion ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Actualizada</Text>
              <Text style={styles.detailValue}>{formatDate(incident.fechaActualizacion)}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Descripción</Text>
        <View style={styles.descCard}>
          <Text style={styles.descText}>{incident.descripcion}</Text>
        </View>

        {incident.estado !== 'RESUELTO' && incident.estado !== 'RECHAZADO' ? (
          <>
            <Text style={styles.sectionTitle}>Acciones</Text>
            <View style={styles.actionsRow}>
              {availableTransitions.map((action) => (
                <TouchableOpacity
                  key={action.estado}
                  style={[styles.actionBtn, { backgroundColor: action.bg, borderColor: action.border }]}
                  onPress={() => confirmUpdate(action.estado)}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color={action.color} />
                  ) : (
                    <Text style={[styles.actionBtnText, { color: action.color }]}>{action.label}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1c' },
  content: { padding: 18, paddingBottom: 28 },
  backBtn: {
    width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  loadingText: { color: '#8d95a4' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700' },
  statusPill: {
    borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6,
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  detailCard: {
    backgroundColor: '#111720', borderRadius: 12, borderWidth: 1, borderColor: '#2a3040',
    padding: 14, marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#1f2638',
  },
  detailLabel: { color: '#8d95a4', fontSize: 13 },
  detailValue: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'right', maxWidth: '60%' },
  sectionTitle: { color: '#c6cedd', fontSize: 14, fontWeight: '700', marginBottom: 10 },
  descCard: {
    backgroundColor: '#111720', borderRadius: 12, borderWidth: 1, borderColor: '#2a3040',
    padding: 14, marginBottom: 20,
  },
  descText: { color: '#fff', fontSize: 14, lineHeight: 22 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1, borderRadius: 10, borderWidth: 1, paddingVertical: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  actionBtnText: { fontSize: 13, fontWeight: '700' },
  errorText: {
    color: '#f0b4b4', backgroundColor: '#241113', borderWidth: 1, borderColor: '#5b262b',
    borderRadius: 10, padding: 10,
  },
});
