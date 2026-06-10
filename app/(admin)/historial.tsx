import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { orderService, type Order } from '../../src/services/orderService';

type EstadoFilter = 'ALL' | 'COMPLETADO' | 'CANCELADO';
type EstadoServicio = 'Completado' | 'Cancelado';

interface ServicioHistorial {
  id: number;
  codigo: string;
  fecha: string;
  hora: string;
  cliente: string;
  calificacionCliente: number;
  domiciliario: string;
  estado: EstadoServicio;
  valor: number;
  tarifa?: number;
  origen: string;
  destino: string;
  descripcion: string;
  tiempoEstimado?: number;
  latOrigen?: number;
  lonOrigen?: number;
  latDestino?: number;
  lonDestino?: number;
  ultimaOfertaPor?: string;
}

const STATUS_OPTIONS: EstadoFilter[] = ['ALL', 'COMPLETADO', 'CANCELADO'];

const formatDate = (value?: string) => {
  if (!value) return 'Sin fecha';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatMoney = (value: number) => `$${value.toLocaleString('es-CO')}`;

const normalizeServicio = (order: Order): ServicioHistorial => {
  const estadoRaw = `${order.estado ?? ''}`.toLowerCase();
  const estado: EstadoServicio = estadoRaw.includes('cancel') ? 'Cancelado' : 'Completado';
  const clienteNombre =
    order.cliente?.nombre ??
    order.nombre_cliente ??
    order.clienteNombre ??
    order.cliente_nombre ??
    order.clientName ??
    order.customerName ??
    order.cliente?.email ??
    `Cliente #${order.id_cliente}`;
  const domiciliarioNombre =
    order.domiciliario?.nombre ??
    order.nombre_domiciliario ??
    order.domiciliarioNombre ??
    order.domiciliario_nombre ??
    order.driverName ??
    order.repartidorNombre ??
    order.domiciliario?.username ??
    `Domiciliario #${order.id_domiciliario}`;

  return {
    id: order.id,
    codigo: `#DG-${String(order.id).padStart(4, '0')}`,
    fecha: formatDate(order.fecha_creacion),
    hora: order.fecha_creacion ? new Date(order.fecha_creacion).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '',
    cliente: clienteNombre,
    calificacionCliente: order.cliente?.calificacion ?? 4.9,
    domiciliario: domiciliarioNombre,
    estado,
    valor: order.precio ?? order.tarifa ?? 0,
    tarifa: order.tarifa ?? order.precio ?? 0,
    origen: order.direccion_origen ?? 'Origen no disponible',
    destino: order.direccion_destino ?? 'Destino no disponible',
    descripcion: order.descripcion ?? '',
    tiempoEstimado: order.tiempo_estimado,
    latOrigen: order.lat_origen,
    lonOrigen: order.lon_origen,
    latDestino: order.lat_destino,
    lonDestino: order.lon_destino,
    ultimaOfertaPor: order.ultima_oferta_por,
  };
};

export default function HistorialServicios() {
  const { width } = useWindowDimensions();
  const compact = width < 390;
  const [servicios, setServicios] = useState<ServicioHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EstadoFilter>('ALL');

  const loadServicios = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await orderService.getAdminOrders();
      setServicios(data.map(normalizeServicio));
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'No se pudo cargar el historial');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadServicios();
  }, [loadServicios]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return servicios.filter((servicio) => {
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'COMPLETADO' && servicio.estado !== 'Completado') return false;
        if (statusFilter === 'CANCELADO' && servicio.estado !== 'Cancelado') return false;
      }

      if (query) {
        const hayMatch =
          servicio.codigo.toLowerCase().includes(query) ||
          servicio.cliente.toLowerCase().includes(query) ||
          servicio.domiciliario.toLowerCase().includes(query) ||
          servicio.origen.toLowerCase().includes(query) ||
          servicio.destino.toLowerCase().includes(query);

        if (!hayMatch) return false;
      }

      return true;
    });
  }, [search, servicios, statusFilter]);

  const total = servicios.length;
  const completados = servicios.filter((servicio) => servicio.estado === 'Completado').length;
  const cancelados = servicios.filter((servicio) => servicio.estado === 'Cancelado').length;
  const promedio = servicios.length
    ? (servicios.reduce((acc, servicio) => acc + servicio.calificacionCliente, 0) / servicios.length).toFixed(1)
    : '0.0';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadServicios(true)} />}
      >
        <Text style={styles.title}>Historial de servicios</Text>
        <Text style={styles.subtitle}>Gestión y revisión de órdenes completadas o canceladas</Text>

        <View style={[styles.statsRow, compact && styles.statsRowCompact]}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TOTAL</Text>
            <Text style={styles.statValue}>{total.toLocaleString('es-CO')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>COMPLETADOS</Text>
            <Text style={[styles.statValue, styles.statSuccess]}>{completados.toLocaleString('es-CO')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>CANCELADOS</Text>
            <Text style={[styles.statValue, styles.statDanger]}>{cancelados.toLocaleString('es-CO')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>CALIF. PROM.</Text>
            <Text style={[styles.statValue, styles.statWarning]}>{promedio}</Text>
          </View>
        </View>

        <View style={styles.filterCard}>
          <TextInput
            style={styles.input}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por código, cliente, domiciliario"
            placeholderTextColor="#8d95a4"
          />

          <Text style={styles.filterLabel}>Estado</Text>
          <View style={styles.pillRow}>
            {STATUS_OPTIONS.map((option) => {
              const active = statusFilter === option;
              const label = option === 'ALL' ? 'TODOS' : option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => setStatusFilter(option)}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.searchBtn} onPress={() => void loadServicios(true)}>
            <Text style={styles.searchBtnText}>Aplicar filtros</Text>
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#17d5aa" />
            <Text style={styles.loadingText}>Cargando historial...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No hay resultados para los filtros aplicados.</Text>
          </View>
        ) : (
          filtered.map((servicio) => {
            const estadoIsOk = servicio.estado === 'Completado';

            return (
              <View key={servicio.id} style={styles.card}>
                {compact ? (
                  <>
                    <View style={styles.mobileTopRow}>
                      <View style={styles.mobileLeft}>
                        <Text style={styles.codigo} numberOfLines={1}>{servicio.codigo}</Text>
                        <Text style={styles.fecha} numberOfLines={1}>{servicio.fecha}</Text>
                      </View>

                      <View style={styles.mobileRight}>
                        <View style={[styles.statusBadge, estadoIsOk ? styles.statusOk : styles.statusBad, styles.statusBadgeCompact]}>
                          <Text style={[styles.statusText, styles.statusTextCompact]}>{servicio.estado}</Text>
                        </View>
                        <Text style={styles.valueText}>{formatMoney(servicio.tarifa ?? servicio.valor)}</Text>
                      </View>
                    </View>

                    <View style={styles.mobileBody}>
                      <Text style={styles.clientName} numberOfLines={1}>{servicio.cliente}</Text>
                      <Text style={styles.extraText} numberOfLines={1}>
                        {servicio.origen} → {servicio.destino}
                      </Text>
                      <Text style={styles.ratingLine} numberOfLines={1}>★ {servicio.calificacionCliente.toFixed(1)} · {servicio.domiciliario}</Text>
                    </View>

                    <View style={styles.mobileActions}>
                      <TouchableOpacity style={styles.detailBtn} onPress={() => Alert.alert('Detalle', `Servicio ${servicio.codigo}`)}>
                        <Text style={styles.detailBtnText}>Detalle</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.tableHeaderRow}>
                      <Text style={[styles.columnLabel, styles.codeBlock]}>CODIGO</Text>
                      <Text style={[styles.columnLabel, styles.clientBlock]}>CLIENTE</Text>
                      <Text style={[styles.columnLabel, styles.driverBlock]}>DOMICILIARIO</Text>
                      <Text style={[styles.columnLabel, styles.statusBlock]}>ESTADO</Text>
                      <Text style={[styles.columnLabel, styles.valueBlock]}>VALOR</Text>
                    </View>

                    <View style={styles.headerRow}>
                      <View style={styles.codeBlock}>
                        <Text style={styles.codigo}>{servicio.codigo}</Text>
                        <Text style={styles.fecha}>{servicio.fecha}</Text>
                      </View>

                      <View style={styles.clientBlock}>
                        <Text style={styles.clientName} numberOfLines={1}>{servicio.cliente}</Text>
                        <Text style={styles.ratingLine}>★ {servicio.calificacionCliente.toFixed(1)}</Text>
                      </View>

                      <View style={styles.driverBlock}>
                        <Text style={styles.driverText} numberOfLines={1}>{servicio.domiciliario}</Text>
                      </View>

                      <View style={styles.statusBlock}>
                        <View style={[styles.statusBadge, estadoIsOk ? styles.statusOk : styles.statusBad]}>
                          <Text style={styles.statusText}>{servicio.estado}</Text>
                        </View>
                      </View>

                      <View style={styles.valueBlock}>
                        <Text style={styles.valueText}>{formatMoney(servicio.tarifa ?? servicio.valor)}</Text>
                        <TouchableOpacity style={styles.detailBtn} onPress={() => Alert.alert('Detalle', `Servicio ${servicio.codigo}`)}>
                          <Text style={styles.detailBtnText}>Detalle</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.extraRow}>
                      <Text style={styles.extraText} numberOfLines={1}>
                        Origen: {servicio.origen}
                      </Text>
                      <Text style={styles.extraText} numberOfLines={1}>
                        Destino: {servicio.destino}
                      </Text>
                      {!!servicio.descripcion && (
                        <Text style={styles.extraText} numberOfLines={1}>
                          Descripción: {servicio.descripcion}
                        </Text>
                      )}
                      <Text style={styles.extraText} numberOfLines={1}>
                        Precio del servicio: {formatMoney(servicio.tarifa ?? servicio.valor)}
                      </Text>
                      <Text style={styles.extraText} numberOfLines={1}>
                        Hora: {servicio.hora || 'N/D'}
                      </Text>
                    </View>
                  </>
                )}

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => Alert.alert('Estado', `Servicio ${servicio.estado.toLowerCase()}`)}
                  >
                    <Text style={styles.secondaryBtnText}>Estado final</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1c',
  },
  content: {
    padding: 18,
    paddingBottom: 28,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#8d95a4',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statsRowCompact: {
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111720',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3040',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
  },
  statLabel: {
    color: '#8d95a4',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 4,
  },
  statSuccess: { color: '#17d5aa' },
  statDanger: { color: '#ff6b6b' },
  statWarning: { color: '#f4b400' },
  filterCard: {
    backgroundColor: '#111720',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3040',
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  input: {
    backgroundColor: '#0a0f1c',
    borderWidth: 1,
    borderColor: '#2a3040',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
  },
  filterLabel: {
    color: '#c6cedd',
    fontWeight: '600',
    fontSize: 12,
    marginTop: 4,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    borderWidth: 1,
    borderColor: '#2a3040',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillActive: {
    borderColor: '#17d5aa',
    backgroundColor: '#0f2a22',
  },
  pillText: {
    color: '#8d95a4',
    fontSize: 11,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#17d5aa',
  },
  searchBtn: {
    backgroundColor: '#17d5aa',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 11,
    marginTop: 6,
  },
  searchBtnText: {
    color: '#0a0f1c',
    fontWeight: '700',
  },
  errorText: {
    color: '#f0b4b4',
    backgroundColor: '#241113',
    borderWidth: 1,
    borderColor: '#5b262b',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  loadingText: {
    color: '#8d95a4',
  },
  emptyBox: {
    backgroundColor: '#111720',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3040',
    padding: 16,
  },
  emptyText: {
    color: '#8d95a4',
  },
  card: {
    backgroundColor: '#111720',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3040',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 12,
    marginBottom: 10,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  columnLabel: {
    color: '#565d6d',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRowCompact: {
    flexWrap: 'wrap',
    gap: 6,
  },
  mobileTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  mobileLeft: {
    flex: 1,
    minWidth: 0,
  },
  mobileRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  mobileBody: {
    marginTop: 8,
    gap: 2,
  },
  mobileActions: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  codeBlock: { width: 72 },
  codeBlockCompact: { width: '48%' },
  codigo: {
    color: '#00d69a',
    fontSize: 13,
    fontWeight: '800',
  },
  codigoCompact: { fontSize: 12 },
  clientBlock: { flex: 1.45 },
  clientBlockCompact: { width: '48%', flex: 0 },
  clientName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  clientNameCompact: { fontSize: 12 },
  ratingLine: {
    color: '#8d95a4',
    fontSize: 10,
    marginTop: 2,
  },
  ratingLineCompact: { fontSize: 9 },
  driverBlock: { width: 72 },
  driverBlockCompact: { width: '48%' },
  driverText: {
    color: '#d3d3d3',
    fontSize: 12,
  },
  driverTextCompact: { fontSize: 11 },
  statusBlock: { width: 86, alignItems: 'flex-start' },
  statusBlockCompact: { width: '48%', alignItems: 'flex-start' },
  fecha: {
    color: '#8d95a4',
    fontSize: 10,
    marginTop: 1,
  },
  fechaCompact: { fontSize: 9 },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusBadgeCompact: { paddingHorizontal: 8, paddingVertical: 4 },
  statusOk: {
    backgroundColor: '#0f6b4a',
  },
  statusBad: {
    backgroundColor: '#7a2929',
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextCompact: { fontSize: 9 },
  valueBlock: {
    width: 62,
    alignItems: 'flex-end',
  },
  valueBlockCompact: { width: '48%' },
  valueText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  valueTextCompact: { fontSize: 12 },
  detailBtn: {
    marginTop: 6,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  detailBtnCompact: { alignSelf: 'flex-end', marginTop: 4, paddingHorizontal: 7, paddingVertical: 2 },
  detailBtnText: {
    color: '#9a9a9a',
    fontSize: 10,
    fontWeight: '700',
  },
  detailBtnTextCompact: { fontSize: 9 },
  extraRow: {
    marginTop: 6,
    gap: 1,
  },
  extraRowCompact: {
    marginTop: 4,
  },
  extraText: {
    color: '#8d95a4',
    fontSize: 10,
  },
  footerRow: {
    marginTop: 6,
    gap: 1,
  },
  footerText: {
    color: '#666',
    fontSize: 9,
  },
  metaBlock: {
    width: '48%',
  },
  metaLabel: {
    color: '#8d95a4',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metaValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a3040',
    backgroundColor: '#0a0f1c',
    alignItems: 'center',
    paddingVertical: 8,
  },
  secondaryBtnText: {
    color: '#c6cedd',
    fontSize: 11,
    fontWeight: '700',
  },
});
