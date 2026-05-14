import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MapView, Marker } from '../../src/components/map';
import ServicioCompletadoScreen from '../../src/components/ServicioCompletadoScreen';
import { orderService } from '../../src/services/orderService';
import { pendingOrderStore } from '../../src/services/pendingOrderStore';
import RatingModal from '../../src/components/rating/RatingModal';

// 🎨 Paleta de colores Premium Dark
const THEME = {
  background: '#0a0f1c',
  panel: '#12151c',
  card: '#1b1f2a',
  primary: '#17d5aa',
  accent: '#f4b400',
  dangerBg: '#2d1417',
  dangerText: '#ff5252',
  textSecondary: '#8d959f',
  divider: '#262d3a',
};

export default function DetallePedidoDomiciliario() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const orderId = Number(params.orderId);
  const clientName = String(params.clientName || 'Cliente');
  const clientRating = String(params.clientRating || '4.5');
  const clientServices = String(params.clientServices || '0');
  const originAddress = String(params.originAddress || 'Origen desconocido');
  const destinationAddress = String(params.destinationAddress || 'Destino desconocido');
  const fare = String(params.fare || '$0');
  const distance = String(params.distance || '0m');
  
  const [isLoading, setIsLoading] = useState(false);
  const [pedidoEstado, setPedidoEstado] = useState<'pendiente' | 'aceptado' | 'rechazado' | 'finalizado'>('pendiente');
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);
  const [counterOfferPrice, setCounterOfferPrice] = useState('');
  const [latestObservedOffer, setLatestObservedOffer] = useState<number | null>(null);
  const [showClientOfferModal, setShowClientOfferModal] = useState(false);
  const [clientOfferValue, setClientOfferValue] = useState<number | null>(null);
  const pollingRef = useRef<number | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    setPedidoEstado('pendiente');
    setShowCounterOfferModal(false);
    setCounterOfferPrice('');
    setIsLoading(false);
  }, [orderId]);

  // Poll order to detect client's counteroffers (oferta_actual changes)
  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      if (!orderId) return;
      try {
        const order = await orderService.getOrderById(orderId);
        const oferta = order.oferta_actual ?? order.tarifa ?? order.precio ?? null;
        const ofertaNum = oferta ? Number(oferta) : null;

        if (mounted && ofertaNum && ofertaNum !== latestObservedOffer) {
          // New offer detected — show modal to driver
          setLatestObservedOffer(ofertaNum);
          setClientOfferValue(ofertaNum);
          setShowClientOfferModal(true);
        }
      } catch (err) {
        console.error('Error polling order for client offers:', err);
      } finally {
        if (mounted) pollingRef.current = window.setTimeout(poll, 4000);
      }
    };

    poll();

    return () => {
      mounted = false;
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, [orderId, latestObservedOffer]);

  const originLat = Number(params.originLat || 7.8939);
  const originLon = Number(params.originLon || -72.5078);
  const destinationLat = Number(params.destinationLat || originLat + 0.002);
  const destinationLon = Number(params.destinationLon || originLon + 0.002);
  const clientId = Number(params.clientId || params.idCliente || params.id_cliente || 0);

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
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }],
    },
  ];

  const ejecutarAceptar = async () => {
    if (!orderId) {
      Alert.alert('Error', 'No se pudo identificar el pedido');
      return;
    }

    setIsLoading(true);
    try {
      await orderService.acceptOrder(orderId);
      pendingOrderStore.dismiss(orderId);
      setPedidoEstado('aceptado');
      Alert.alert('Pedido aceptado', 'La solicitud fue tomada correctamente');
    } catch (error: any) {
      console.error('Error aceptando pedido:', error);
      if (error?.status === 403) {
        Alert.alert(
          'No autorizado',
          'No tienes permisos para aceptar este pedido. Verifica que estés autenticado como domiciliario y que tu cuenta esté verificada y disponible.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/(domiciliario)/mapa'),
            },
          ]
        );
      } else if (error?.status === 400 || error?.status === 409) {
        Alert.alert('Pedido no disponible', 'Este pedido ya fue tomado o cambió de estado.');
      } else {
        const msg =
          (typeof error?.error === 'string' && error.error) ||
          error?.error?.error ||
          'No se pudo aceptar el servicio. Intenta de nuevo.';
        Alert.alert('Error', msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const ejecutarRechazar = async () => {
    if (!orderId) {
      Alert.alert('Error', 'No se pudo identificar el pedido');
      return;
    }

    setIsLoading(true);
    try {
      await orderService.rejectOrder(orderId);
      pendingOrderStore.dismiss(orderId);
      setPedidoEstado('rechazado');
      Alert.alert('Pedido rechazado', 'La solicitud fue rechazada y ya no aparecerá en pendientes', [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/(domiciliario)/mapa');
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error rechazando pedido:', error);
      if (error?.status === 403) {
        Alert.alert(
          'No autorizado',
          'No tienes permisos para rechazar este pedido. Verifica que estés autenticado como domiciliario y que tu cuenta esté verificada y disponible.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/(domiciliario)/mapa'),
            },
          ]
        );
      } else if (error?.status === 400 || error?.status === 409) {
        Alert.alert('Pedido no disponible', 'Este pedido ya fue tomado o cambió de estado.');
      } else {
        const msg =
          (typeof error?.error === 'string' && error.error) ||
          error?.error?.error ||
          'No se pudo rechazar el servicio. Intenta de nuevo.';
        Alert.alert('Error', msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAceptar = async () => {
    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined' ? window.confirm('¿Deseas aceptar este servicio?') : true;
      if (!ok) return;
      await ejecutarAceptar();
      return;
    }

    Alert.alert('Confirmar aceptación', '¿Deseas aceptar este servicio?', [
      { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
      { text: 'Aceptar', onPress: () => { void ejecutarAceptar(); }, style: 'default' },
    ]);
  };

  const handleRechazar = () => {
    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined' ? window.confirm('¿Deseas rechazar este servicio?') : true;
      if (!ok) return;
      void ejecutarRechazar();
      return;
    }

    Alert.alert('Confirmar rechazo', '¿Deseas rechazar este servicio?', [
      { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
      { text: 'Rechazar', onPress: () => { void ejecutarRechazar(); }, style: 'destructive' },
    ]);
  };

  const handleContraoferta = async () => {
    if (!orderId) {
      Alert.alert('Error', 'No se pudo identificar el pedido');
      return;
    }

    const newPrice = parseFloat(counterOfferPrice);
    if (isNaN(newPrice) || newPrice <= 0) {
      Alert.alert('Error', 'Por favor ingresa un precio válido');
      return;
    }

    setIsLoading(true);
    try {
      await orderService.counterOfferOrder(orderId, newPrice);
      pendingOrderStore.dismiss(orderId);
      setShowCounterOfferModal(false);
      setCounterOfferPrice('');
      Alert.alert('Contraoferta enviada', 'Tu contraoferta fue enviada correctamente', [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/(domiciliario)/mapa');
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error enviando contraoferta:', error);
      if (error?.status === 403) {
        Alert.alert(
          'No autorizado',
          'No tienes permisos para hacer una contraoferta. Verifica que estés autenticado como domiciliario y que tu cuenta esté verificada y disponible.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/(domiciliario)/mapa'),
            },
          ]
        );
      } else if (error?.status === 409) {
        Alert.alert('Pedido no disponible', 'Este pedido ya no está disponible para contrapropuesta');
      } else {
        const msg =
          (typeof error?.error === 'string' && error.error) ||
          error?.error?.error ||
          'No se pudo enviar la contraoferta. Intenta de nuevo.';
        Alert.alert('Error', msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminarServicio = () => {
    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined' ? window.confirm('¿Confirmas que el servicio fue completado?') : true;
      if (!ok) return;
      setPedidoEstado('finalizado');
      setShowRatingModal(true);
      return;
    }

    Alert.alert('Terminar servicio', '¿Confirmas que el servicio fue completado?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Terminar',
        onPress: () => {
          setPedidoEstado('finalizado');
          setShowRatingModal(true);
        },
      },
    ]);
  };

  // Si el servicio está finalizado, mostrar solo la pantalla de completado
  if (pedidoEstado === 'finalizado') {
    return (
      <>
        <ServicioCompletadoScreen
          clientName={clientName}
          orderId={orderId}
          fare={fare}
          clientRating={clientRating}
          comment='"Muy puntual y amable, recogió el paquete sin problema. ¡Excelente!"'
          tags={['Puntual', 'Amable', 'Paquete en buen estado']}
          earnings={fare}
          dailyTotal="$42.000"
          onSearchNew={() => router.replace('/(domiciliario)/mapa')}
        />

        <RatingModal
          visible={showRatingModal}
          idServicio={orderId}
          driverName={clientName}
          role="DOMICILIARIO"
          idCliente={clientId || undefined}
          onClose={() => setShowRatingModal(false)}
          onSuccess={() => {
            Alert.alert('Éxito', 'Calificación enviada correctamente');
            setShowRatingModal(false);
          }}
        />
      </>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        
        {/* MAPA COMPARTIDO */}
        <View style={styles.mapArea}>
          <MapView
            style={styles.map}
            customMapStyle={CUSTOM_MAP_STYLE}
            region={{
              latitude: (originLat + destinationLat) / 2,
              longitude: (originLon + destinationLon) / 2,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            <Marker coordinate={{ latitude: originLat, longitude: originLon }} title="Origen">
              <View style={styles.markerA}>
                <Text style={styles.markerText}>A</Text>
              </View>
            </Marker>

            <Marker coordinate={{ latitude: destinationLat, longitude: destinationLon }} title="Destino">
              <View style={styles.markerB}>
                <Text style={styles.markerText}>B</Text>
              </View>
            </Marker>
          </MapView>

          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} disabled={isLoading}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* 📄 PANEL INFERIOR */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Detalles del servicio</Text>

          {(pedidoEstado === 'aceptado' || pedidoEstado === 'rechazado') && (
            <View
              style={[
                styles.statusCard,
                pedidoEstado === 'aceptado' ? styles.statusCardAccepted : styles.statusCardRejected,
              ]}
            >
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusIcon,
                    pedidoEstado === 'aceptado' ? styles.statusIconAccepted : styles.statusIconRejected,
                  ]}
                >
                  <Ionicons
                    name={pedidoEstado === 'aceptado' ? 'checkmark' : 'close'}
                    size={18}
                    color={pedidoEstado === 'aceptado' ? '#0a0f1c' : '#fff'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.statusTitle}>
                    {pedidoEstado === 'aceptado' ? 'Pedido aceptado' : 'Pedido rechazado'}
                  </Text>
                  <Text style={styles.statusText}>
                    {pedidoEstado === 'aceptado'
                      ? 'La solicitud quedó tomada por ti y sigue en esta misma pantalla.'
                      : 'La solicitud fue rechazada y ya no aparecerá en pendientes.'}
                  </Text>
                </View>
              </View>

              {pedidoEstado === 'aceptado' && (
                <View style={styles.acceptedActionsRow}>
                  <TouchableOpacity style={styles.finishServiceBtn} onPress={handleTerminarServicio}>
                    <Text style={styles.finishServiceText}>Terminar servicio</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.statusActionBtn} onPress={() => router.replace('/(domiciliario)/mapa')}>
                    <Text style={styles.statusActionText}>Volver al mapa</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {pedidoEstado !== 'finalizado' && (
            <>
              {/* TARJETA DEL CLIENTE */}
              <View style={styles.clientCard}>
                <View style={styles.clientAvatar}>
                  <Text style={{ fontSize: 24 }}>👤</Text>
                </View>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{clientName}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color={THEME.accent} />
                    <Text style={styles.ratingText}>{clientRating} · {clientServices} servicios</Text>
                  </View>
                </View>
              </View>

              {/* TARJETA DE DIRECCIONES */}
              <View style={styles.addressCard}>
                <View style={styles.addressRow}>
                  <View style={[styles.dot, { backgroundColor: THEME.primary }]} />
                  <View>
                    <Text style={styles.addrLabel}>ORIGEN</Text>
                    <Text style={styles.addrValue}>{originAddress}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.addressRow}>
                  <View style={[styles.dot, { backgroundColor: THEME.accent }]} />
                  <View>
                    <Text style={styles.addrLabel}>DESTINO</Text>
                    <Text style={styles.addrValue}>{destinationAddress}</Text>
                  </View>
                </View>
              </View>

              {/* CAJAS DE TARIFA Y DISTANCIA */}
              <View style={styles.statsRow}>
                <View style={styles.tarifaBox}>
                  <Text style={styles.statLabel}>TARIFA</Text>
                  <Text style={styles.tarifaValue}>{fare}</Text>
                </View>

                <View style={styles.distanciaBox}>
                  <Text style={styles.statLabel}>DISTANCIA AL ORIGEN</Text>
                  <Text style={styles.distanciaValue}>{distance}</Text>
                </View>
              </View>

              {/* BOTONES DE RECHAZAR, CONTRAOFERTA Y ACEPTAR */}
              {pedidoEstado === 'pendiente' && (
                <>
                  <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.btnRechazar, isLoading && styles.buttonDisabled]}
                  onPress={handleRechazar}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={THEME.dangerText} size="small" />
                  ) : (
                    <Text style={styles.textRechazar}>Rechazar</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btnContraoferta, isLoading && styles.buttonDisabled]}
                  onPress={() => setShowCounterOfferModal(true)}
                  disabled={isLoading}
                >
                  <Text style={styles.textContraoferta}>Contraoferta</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btnAceptar, isLoading && styles.buttonDisabled]}
                  onPress={handleAceptar}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#0a0f1c" size="small" />
                  ) : (
                    <Text style={styles.textAceptar}>Aceptar</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* MODAL DE CONTRAOFERTA */}
              <Modal
                visible={showCounterOfferModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {
                  setShowCounterOfferModal(false);
                  setCounterOfferPrice('');
                }}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Hacer Contraoferta</Text>
                    <Text style={styles.modalSubtitle}>Tarifa actual: {fare}</Text>

                    <TextInput
                      style={styles.priceInput}
                      placeholder="Ingresa tu precio"
                      placeholderTextColor={THEME.textSecondary}
                      keyboardType="decimal-pad"
                      value={counterOfferPrice}
                      onChangeText={setCounterOfferPrice}
                      editable={!isLoading}
                    />

                    <View style={styles.modalButtonsRow}>
                      <TouchableOpacity
                        style={[styles.btnCancel, isLoading && styles.buttonDisabled]}
                        onPress={() => {
                          setShowCounterOfferModal(false);
                          setCounterOfferPrice('');
                        }}
                        disabled={isLoading}
                      >
                        <Text style={styles.textCancel}>Cancelar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.btnSendOffer, isLoading && styles.buttonDisabled]}
                        onPress={handleContraoferta}
                        disabled={isLoading || !counterOfferPrice}
                      >
                        {isLoading ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={styles.textSendOffer}>Enviar Contraoferta</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
              
              {/* MODAL: Oferta enviada por el CLIENTE (visible al domiciliario) */}
              <Modal
                visible={showClientOfferModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {
                  setShowClientOfferModal(false);
                }}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Nueva oferta del cliente</Text>
                    <Text style={styles.modalSubtitle}>El cliente propone: {clientOfferValue ?? '—'}</Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
                      <TouchableOpacity
                        style={[styles.btnAcceptOffer, isLoading && styles.buttonDisabled]}
                        onPress={async () => {
                          // Aceptar la oferta del cliente — continuar flujo como si aceptaras el pedido
                          setShowClientOfferModal(false);
                          await ejecutarAceptar();
                        }}
                        disabled={isLoading}
                      >
                        <Text style={styles.textAcceptOffer}>Aceptar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.btnCounterFromClient, isLoading && styles.buttonDisabled]}
                        onPress={() => {
                          // Abrir modal de contraoferta y prefill con la oferta del cliente
                          setShowClientOfferModal(false);
                          setCounterOfferPrice(String(clientOfferValue ?? ''));
                          setShowCounterOfferModal(true);
                        }}
                        disabled={isLoading}
                      >
                        <Text style={styles.textCounterFromClient}>Contraoferta</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.btnRejectOffer, isLoading && styles.buttonDisabled]}
                        onPress={async () => {
                          setShowClientOfferModal(false);
                          await ejecutarRechazar();
                        }}
                        disabled={isLoading}
                      >
                        <Text style={styles.textRejectOffer}>Rechazar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </>
          )}
            </>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  
  // MAPA
  mapArea: { height: 380, backgroundColor: '#131b2f', overflow: 'hidden' },
  map: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10, width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  markerA: { width: 28, height: 28, borderRadius: 14, backgroundColor: THEME.primary, alignItems: 'center', justifyContent: 'center' },
  markerB: { width: 28, height: 28, borderRadius: 14, backgroundColor: THEME.accent, alignItems: 'center', justifyContent: 'center' },
  markerText: { color: '#0a0f1c', fontSize: 12, fontWeight: 'bold' },

  // PANEL
  panel: { backgroundColor: THEME.background, padding: 20, marginTop: -20 },
  panelTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },

  // CARD CLIENTE
  clientCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111720', borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#174033' },
  clientAvatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: THEME.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0f1c' },
  clientInfo: { marginLeft: 15 },
  clientName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { color: THEME.textSecondary, fontSize: 13, marginLeft: 5 },

  // CARD DIRECCIONES
  addressCard: { backgroundColor: '#171a22', borderRadius: 12, padding: 18, marginBottom: 20 },
  addressRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 15 },
  addrLabel: { color: THEME.textSecondary, fontSize: 10, fontWeight: 'bold', marginBottom: 3 },
  addrValue: { color: '#fff', fontSize: 16 },
  divider: { height: 1, backgroundColor: THEME.divider, marginVertical: 15, marginLeft: 27 },

  // ESTADISTICAS
  statsRow: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  tarifaBox: { flex: 1, backgroundColor: '#0e241c', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tarifaValue: { color: THEME.primary, fontSize: 24, fontWeight: 'bold', marginTop: 5 },
  distanciaBox: { flex: 1, backgroundColor: '#1a1b26', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  distanciaValue: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 5 },
  statLabel: { color: THEME.textSecondary, fontSize: 10, fontWeight: 'bold' },

  // BOTONES
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  btnRechazar: { flex: 1, backgroundColor: THEME.dangerBg, paddingVertical: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  textRechazar: { color: THEME.dangerText, fontSize: 14, fontWeight: 'bold' },
  btnContraoferta: { flex: 1, backgroundColor: THEME.accent, paddingVertical: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  textContraoferta: { color: '#0a0f1c', fontSize: 14, fontWeight: 'bold' },
  btnAceptar: { flex: 1, backgroundColor: THEME.primary, paddingVertical: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  textAceptar: { color: '#0a0f1c', fontSize: 14, fontWeight: 'bold' },
  buttonDisabled: { opacity: 0.6 },

  // MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: THEME.panel, borderRadius: 15, padding: 24, width: '85%', maxWidth: 400 },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  modalSubtitle: { color: THEME.textSecondary, fontSize: 14, marginBottom: 16 },
  priceInput: {
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtonsRow: { flexDirection: 'row', gap: 12 },
  btnCancel: { flex: 1, backgroundColor: THEME.card, paddingVertical: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: THEME.divider },
  textCancel: { color: '#fff', fontSize: 14, fontWeight: '600' },
  btnSendOffer: { flex: 1, backgroundColor: THEME.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  textSendOffer: { color: '#0a0f1c', fontSize: 14, fontWeight: 'bold' },

  // ESTADO PEDIDO
  statusCard: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1 },
  statusCardAccepted: { backgroundColor: '#0e241c', borderColor: '#1d5d47' },
  statusCardRejected: { backgroundColor: '#241113', borderColor: '#5b262b' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  statusIconAccepted: { backgroundColor: THEME.primary },
  statusIconRejected: { backgroundColor: THEME.dangerText },
  statusTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  statusText: { color: THEME.textSecondary, fontSize: 13, lineHeight: 18 },
  statusActionBtn: { marginTop: 14, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fff' },
  statusActionText: { color: '#0a0f1c', fontWeight: '700' },
  acceptedActionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  finishServiceBtn: { flex: 1, backgroundColor: THEME.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  finishServiceText: { color: '#0a0f1c', fontWeight: '800' },
});
