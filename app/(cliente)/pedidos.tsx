import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { orderService, type Order } from '../../src/services/orderService';

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: 'Solicitud enviada',
  ACEPTADO: 'Aceptado',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  PENDIENTE: '#8fd6ff',
  ACEPTADO: '#17d5aa',
  EN_CAMINO: '#f4b400',
  ENTREGADO: '#7bd85a',
  CANCELADO: '#ff5a5f',
};

const formatDate = (value?: string) => {
  if (!value) return 'Fecha no disponible';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const normalizeStatus = (estado?: string) => (estado || 'PENDIENTE').toUpperCase();

const isActiveStatus = (estado?: string) => {
  const status = normalizeStatus(estado);
  return status === 'PENDIENTE' || status === 'ACEPTADO' || status === 'EN_CAMINO';
};

export default function PedidosCliente() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<number | null>(null);

  const activeOrder = useMemo(() => orders.find((order) => isActiveStatus(order.estado)), [orders]);
  const historyOrders = useMemo(
    () => orders.filter((order) => !isActiveStatus(order.estado)),
    [orders]
  );

  const loadOrders = async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const data = await orderService.getOrdersByClient();
      setOrders(data);
      setError(null);
    } catch (err: any) {
      console.error('Error cargando pedidos cliente:', err);
      setError('No se pudieron cargar tus pedidos. Reintenta.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      if (!mounted) return;
      await loadOrders();
      if (mounted) pollingRef.current = setTimeout(poll, 12000);
    };

    void loadOrders();
    pollingRef.current = setTimeout(poll, 12000);

    return () => {
      mounted = false;
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, []);

  const handleNewOrder = () => {
    router.push('/(cliente)/confirmar-pedido');
  };

  const handleTrackOrder = (orderId: number) => {
    router.push({
      pathname: '/(cliente)/seguimiento',
      params: { idServicio: String(orderId) },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void loadOrders(true)} />}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Mis pedidos</Text>
            <Text style={styles.subtitle}>Sigue tus pedidos activos y revisa tu historial.</Text>
          </View>
          <TouchableOpacity style={styles.newOrderBtn} onPress={handleNewOrder}>
            <Ionicons name="add" size={20} color="#0a0f1c" />
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => void loadOrders(true)}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {isLoading && !orders.length ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#17d5aa" />
            <Text style={styles.loadingText}>Cargando tus pedidos...</Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pedido en curso</Text>
              {activeOrder ? (
                <Text style={styles.sectionMeta}>{STATUS_LABELS[normalizeStatus(activeOrder.estado)]}</Text>
              ) : (
                <Text style={styles.sectionMeta}>Sin pedidos activos</Text>
              )}
            </View>

            {activeOrder ? (
              <View style={styles.activeCard}>
                <View style={styles.activeHeader}>
                  <View>
                    <Text style={styles.activeLabel}>#{activeOrder.id}</Text>
                    <Text style={styles.activeTitle}>{activeOrder.direccion_origen} → {activeOrder.direccion_destino}</Text>
                  </View>
                  <View style={[styles.statusPill, { borderColor: STATUS_COLORS[normalizeStatus(activeOrder.estado)] }]}
                  >
                    <Text style={[styles.statusPillText, { color: STATUS_COLORS[normalizeStatus(activeOrder.estado)] }]}
                    >
                      {STATUS_LABELS[normalizeStatus(activeOrder.estado)]}
                    </Text>
                  </View>
                </View>

                <View style={styles.activeMetaRow}>
                  <Text style={styles.activeMeta}>Tarifa: ${activeOrder.tarifa?.toFixed(0) ?? '--'}</Text>
                  <Text style={styles.activeMeta}>{formatDate(activeOrder.fecha_creacion)}</Text>
                </View>

                <TouchableOpacity style={styles.trackBtn} onPress={() => handleTrackOrder(activeOrder.id)}>
                  <Ionicons name="location" size={18} color="#0a0f1c" />
                  <Text style={styles.trackBtnText}>Ver seguimiento</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No tienes pedidos en curso</Text>
                <Text style={styles.emptyText}>Crea un nuevo pedido para empezar.</Text>
                <TouchableOpacity style={styles.primaryBtn} onPress={handleNewOrder}>
                  <Text style={styles.primaryBtnText}>Nuevo pedido</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Historial</Text>
              <Text style={styles.sectionMeta}>{historyOrders.length} pedidos</Text>
            </View>

            {historyOrders.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Text style={styles.emptyText}>Aun no tienes pedidos finalizados.</Text>
              </View>
            ) : (
              historyOrders.map((order) => (
                <View key={order.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyId}>#{order.id}</Text>
                    <Text style={[styles.historyStatus, { color: STATUS_COLORS[normalizeStatus(order.estado)] }]}
                    >
                      {STATUS_LABELS[normalizeStatus(order.estado)]}
                    </Text>
                  </View>
                  <Text style={styles.historyRoute}>{order.direccion_origen} → {order.direccion_destino}</Text>
                  <View style={styles.historyMetaRow}>
                    <Text style={styles.historyMeta}>Tarifa: ${order.tarifa?.toFixed(0) ?? '--'}</Text>
                    <Text style={styles.historyMeta}>{formatDate(order.fecha_creacion)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.historyAction}
                    onPress={() => handleTrackOrder(order.id)}
                  >
                    <Text style={styles.historyActionText}>Ver detalle</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1c' },
  content: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { color: '#fff', fontSize: 26, fontWeight: '700' },
  subtitle: { color: '#8d95a4', fontSize: 13, marginTop: 4, maxWidth: 240 },
  newOrderBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#17d5aa', alignItems: 'center', justifyContent: 'center' },
  loadingBox: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  loadingText: { color: '#8d95a4', fontSize: 13 },
  errorBanner: { backgroundColor: '#241113', borderColor: '#5b262b', borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#f0b4b4', fontSize: 12, marginBottom: 10 },
  retryBtn: { alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  retryText: { color: '#0a0f1c', fontWeight: '700', fontSize: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { color: '#c6cedd', fontSize: 14, fontWeight: '700' },
  sectionMeta: { color: '#8d95a4', fontSize: 12 },
  activeCard: { backgroundColor: '#111720', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#174033', marginBottom: 20 },
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  activeLabel: { color: '#8fd6ff', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  activeTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  activeMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  activeMeta: { color: '#8d95a4', fontSize: 12 },
  statusPill: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  trackBtn: { marginTop: 14, backgroundColor: '#17d5aa', borderRadius: 10, paddingVertical: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  trackBtnText: { color: '#0a0f1c', fontWeight: '700' },
  emptyCard: { backgroundColor: '#171a22', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#2a3040', marginBottom: 20 },
  emptyTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptyText: { color: '#8d95a4', fontSize: 12 },
  primaryBtn: { marginTop: 12, backgroundColor: '#17d5aa', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  primaryBtnText: { color: '#0a0f1c', fontWeight: '700' },
  emptyHistory: { backgroundColor: '#171a22', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#2a3040' },
  historyCard: { backgroundColor: '#111720', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#2a3040', marginBottom: 12 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyId: { color: '#8fd6ff', fontSize: 12, fontWeight: '700' },
  historyStatus: { fontSize: 12, fontWeight: '700' },
  historyRoute: { color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 8 },
  historyMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  historyMeta: { color: '#8d95a4', fontSize: 12 },
  historyAction: { marginTop: 12, alignSelf: 'flex-start', backgroundColor: '#17d5aa', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  historyActionText: { color: '#0a0f1c', fontWeight: '700', fontSize: 12 },
});
