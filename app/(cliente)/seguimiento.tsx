import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MapView, Marker } from '../../src/components/map';
import RatingModal from '../../src/components/rating/RatingModal';
import { THEME } from '../../src/constants/theme';
import { driverService, type DriverDetail } from '../../src/services/driverService';
import { orderService } from '../../src/services/orderService';
import { websocketService, type TrackingUpdate } from '../../src/services/websocketService';

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
    idServicio?: string;
    originalTarifa?: string;
  }>();

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasPromptedRating, setHasPromptedRating] = useState(false);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [tracking, setTracking] = useState<TrackingUpdate | null>(null);
  const [pollingError, setPollingError] = useState<string | null>(null);
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);
  const [counterOfferPrice, setCounterOfferPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const userLat = Number(params.userLat ?? 7.8939);
  const userLon = Number(params.userLon ?? -72.4842);
  const [driverInfo, setDriverInfo] = useState<DriverDetail | null>(null);

  const driverLat = Number(driverInfo?.latitud ?? userLat);
  const driverLon = Number(driverInfo?.longitud ?? userLon);
  const driverId = driverInfo?.id != null ? String(driverInfo.id) : '';
  const driverName = driverInfo?.nombre || 'Cargando domiciliario...';
  const phone = 'Cargando...';
  const email = driverInfo?.email || 'Cargando...';
  const vehicle = driverInfo?.vehiculo || 'Cargando...';
  const plate = driverInfo?.placa || 'Cargando...';
  const verified = driverInfo?.verificado ?? false;
  const rating = driverInfo?.calificacion != null ? driverInfo.calificacion.toFixed(1) : 'N/A';
  const distance = driverInfo?.distancia != null
    ? `${Number(driverInfo.distancia).toFixed(1)} km`
    : 'N/A';
  const idServicio = params.idServicio;
  const originalTarifa = Number(params.originalTarifa ?? '0');

  const [latestOffer, setLatestOffer] = useState<number | null>(null);
  const pollingRef = useRef<number | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isHandlingOffer, setIsHandlingOffer] = useState(false);
  const trackingPollRef = useRef<number | null>(null);
  const pollingErrorCountRef = useRef(0);

  const trackingCoords = useMemo(() => {
    if (tracking && Number.isFinite(tracking.latitud) && Number.isFinite(tracking.longitud)) {
      return {
        latitude: Number(tracking.latitud),
        longitude: Number(tracking.longitud),
      };
    }

    return {
      latitude: driverLat,
      longitude: driverLon,
    };
  }, [tracking, driverLat, driverLon]);

  const normalizedStatus = useMemo(() => {
    const raw = (orderStatus || '').toString().trim().toUpperCase();
    if (!raw) return 'PENDIENTE';
    return raw;
  }, [orderStatus]);

  const statusConfig = useMemo(() => {
    const isPending = normalizedStatus === 'PENDIENTE';
    const isAccepted = normalizedStatus === 'ACEPTADO';
    const isEnCamino = normalizedStatus === 'EN_CAMINO';
    const isEntregado = normalizedStatus === 'ENTREGADO';
    const isCancelado = normalizedStatus === 'CANCELADO';

    const canTrack = isAccepted || isEnCamino || isEntregado;
    const showDriver = canTrack;

    let statusTitle = 'Solicitud enviada';
    let statusSubtitle = 'Esperando respuesta del domiciliario.';

    if (isAccepted) {
      statusTitle = 'Pedido aceptado';
      statusSubtitle = 'Tu domiciliario va en camino.';
    } else if (isEnCamino) {
      statusTitle = 'En camino';
      statusSubtitle = 'Tu pedido va en camino.';
    } else if (isEntregado) {
      statusTitle = 'Pedido entregado';
      statusSubtitle = 'El servicio fue finalizado.';
    } else if (isCancelado) {
      statusTitle = 'Pedido cancelado';
      statusSubtitle = 'Puedes crear una nueva solicitud.';
    }

    return {
      isPending,
      isAccepted,
      isEnCamino,
      isEntregado,
      isCancelado,
      canTrack,
      showDriver,
      statusTitle,
      statusSubtitle,
    };
  }, [normalizedStatus]);

  useEffect(() => {
    if (!idServicio) return;

    let mounted = true;
    const poll = async () => {
      try {
        setIsPolling(true);
        const order = await orderService.getOrderById(Number(idServicio));

        if (mounted) setOrderStatus((order.estado || '').toString());
        if (mounted) setPollingError(null);
        pollingErrorCountRef.current = 0;

        const oferta = order.oferta_actual ?? order.tarifa ?? order.precio ?? null;
        const ofertaNum = oferta ? Number(oferta) : null;
        const offerBy = (order.ultima_oferta_por || '').toString().trim().toUpperCase();
        const isDriverOffer = offerBy === 'DOMICILIARIO';

        if (
          mounted &&
          ofertaNum &&
          ofertaNum !== latestOffer &&
          ofertaNum !== originalTarifa &&
          !isHandlingOffer &&
          isDriverOffer
        ) {
          setLatestOffer(ofertaNum);
          setIsHandlingOffer(true);

          const title = 'Contraoferta recibida';
          const message = `El domiciliario propone ${ofertaNum}. ¿Aceptas, rechazas o haces contraoferta?`;

          if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
            const choice = window.confirm(message + '\n\nAceptar = OK, Cancelar = abrir diálogo de rechazo/contraoferta');
            if (choice) {
              try {
                await orderService.changeState(Number(idServicio), 'ACEPTADO');
                Alert.alert('Aceptado', 'Has aceptado la contraoferta. Continúa el flujo.');
              } catch (err: any) {
                console.error('Error aceptando contraoferta:', err);
                Alert.alert('Error', 'No se pudo aceptar la contraoferta. Intenta de nuevo.');
              }
            } else {
              const value = window.prompt('Escribe tu contraoferta (número):', String(originalTarifa || ''));
              if (value && !isNaN(Number(value))) {
                try {
                  await orderService.counterOfferOrder(Number(idServicio), Number(value));
                  Alert.alert('Contraoferta enviada', 'Tu contraoferta fue enviada al domiciliario.');
                } catch (err: any) {
                  console.error('Error enviando contraoferta cliente:', err);
                  Alert.alert('Error', 'No se pudo enviar la contraoferta. Intenta de nuevo.');
                }
              } else {
                try {
                  await orderService.changeState(Number(idServicio), 'CANCELADO');
                  Alert.alert('Rechazado', 'Has rechazado la oferta. Puedes solicitar un nuevo servicio.');
                } catch (err: any) {
                  console.error('Error rechazando contraoferta:', err);
                  Alert.alert('Error', 'No se pudo rechazar la contraoferta. Intenta de nuevo.');
                }
              }
            }
          } else {
            Alert.alert(title, message, [
              {
                text: 'Aceptar',
                onPress: async () => {
                  try {
                    await orderService.changeState(Number(idServicio), 'ACEPTADO');
                    Alert.alert('Aceptado', 'Has aceptado la contraoferta. Continúa el flujo.');
                  } catch (err: any) {
                    console.error('Error aceptando contraoferta:', err);
                    Alert.alert('Error', 'No se pudo aceptar la contraoferta. Intenta de nuevo.');
                  } finally {
                    setIsHandlingOffer(false);
                  }
                },
              },
              {
                text: 'Contraoferta',
                onPress: async () => {
                  setIsHandlingOffer(false);
                  setCounterOfferPrice(String(ofertaNum));
                  setShowCounterOfferModal(true);
                },
              },
              {
                text: 'Rechazar',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await orderService.changeState(Number(idServicio), 'CANCELADO');
                    Alert.alert('Rechazado', 'Has rechazado la oferta. Puedes solicitar un nuevo servicio.');
                  } catch (err: any) {
                    console.error('Error rechazando contraoferta:', err);
                    Alert.alert('Error', 'No se pudo rechazar la contraoferta. Intenta de nuevo.');
                  } finally {
                    setIsHandlingOffer(false);
                  }
                },
              },
            ]);
          }
        }
      } catch (err) {
        console.error('Error polling order:', err);
        if (mounted) {
          setPollingError('No se pudo actualizar el estado. Reintentando...');
        }
        pollingErrorCountRef.current = Math.min(pollingErrorCountRef.current + 1, 6);
      } finally {
        setIsPolling(false);
        const backoffMs = 5000 + pollingErrorCountRef.current * 2000;
        if (mounted) pollingRef.current = setTimeout(poll, backoffMs);
      }
    };

    poll();

    return () => {
      mounted = false;
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, [idServicio, latestOffer, isHandlingOffer, originalTarifa, router]);

  useEffect(() => {
    if (!idServicio) return;
    setHasPromptedRating(false);
  }, [idServicio]);

  useEffect(() => {
    if (!idServicio) return;

    setDriverInfo(null);

    let mounted = true;
    const loadDriver = async () => {
      try {
        const info = await driverService.getDriverByOrder(Number(idServicio));
        if (mounted) setDriverInfo(info);
      } catch (err) {
        if (mounted) setDriverInfo(null);
      }
    };

    loadDriver();
    const refresh = setInterval(loadDriver, 15000);
    return () => {
      mounted = false;
      clearInterval(refresh);
    };
  }, [idServicio]);

  useEffect(() => {
    if (!idServicio) return;

    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    const pollTracking = async () => {
      try {
        const data = await driverService.getTracking(Number(idServicio));
        if (mounted) {
          setTracking({
            idServicio: data.idServicio,
            latitud: data.latitud ?? undefined,
            longitud: data.longitud ?? undefined,
            tiempoEstimado: data.tiempoEstimado ?? undefined,
          });
        }
      } catch (err) {
        // ignore polling errors, rely on ws
      } finally {
        if (mounted) trackingPollRef.current = setTimeout(pollTracking, 15000);
      }
    };

    const connectTracking = async () => {
      try {
        await websocketService.connect();
        if (!mounted) return;
        unsubscribe = websocketService.subscribeToTracking(Number(idServicio), (update) => {
          setTracking(update);
        });
      } catch (err) {
        pollTracking();
      }
    };

    connectTracking();
    pollTracking();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
      if (trackingPollRef.current) clearTimeout(trackingPollRef.current);
    };
  }, [idServicio]);

  const currentStep = useMemo(() => {
    const status = (orderStatus || '').toLowerCase();
    if (status.includes('entreg')) return 3;
    if (status.includes('camino')) return 2;
    if (status.includes('acept')) return 1;
    return 0;
  }, [orderStatus]);

  const statusBadge = useMemo(() => {
    const status = (orderStatus || '').toLowerCase();
    if (status.includes('entreg')) return 'Entregado';
    if (status.includes('camino')) return 'En camino';
    if (status.includes('acept')) return 'Aceptado';
    if (status.includes('pend')) return 'Pendiente';
    if (status.includes('cancel')) return 'Cancelado';
    return 'Pendiente';
  }, [orderStatus]);

  useEffect(() => {
    const status = (orderStatus || '').toLowerCase();
    if (!idServicio) return;

    if (status.includes('entreg') && !hasPromptedRating) {
      setShowRatingModal(true);
      setHasPromptedRating(true);
    }
  }, [orderStatus, hasPromptedRating, idServicio]);

  const canCancel = useMemo(() => {
    const status = (orderStatus || '').toLowerCase();
    return status.includes('pend') || status.includes('acept');
  }, [orderStatus]);

  const handleCancelService = async () => {
    if (!idServicio) {
      Alert.alert('Error', 'ID de servicio no disponible');
      return;
    }

    Alert.alert('Cancelar servicio', '¿Deseas cancelar este servicio?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            await orderService.updateOrderState(Number(idServicio), 'CANCELADO');
            setOrderStatus('cancelado');
            Alert.alert('Cancelado', 'El servicio fue cancelado.');
          } catch (err: any) {
            const msg =
              (typeof err?.error === 'string' && err.error) ||
              err?.error?.error ||
              'No se pudo cancelar el servicio. Intenta de nuevo.';
            Alert.alert('Error', msg);
          }
        },
      },
    ]);
  };

  const handleSendCounterOffer = async () => {
    if (!idServicio) return;
    const price = parseFloat(counterOfferPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Por favor ingresa un precio válido');
      return;
    }

    setIsLoading(true);
    try {
      await orderService.counterOfferOrder(Number(idServicio), price);
      setShowCounterOfferModal(false);
      setCounterOfferPrice('');
      setIsHandlingOffer(false);
      Alert.alert('Contraoferta enviada', 'Tu nueva propuesta ha sido enviada al domiciliario.');
    } catch (err: any) {
      console.error('Error enviando contraoferta:', err);
      const msg = (typeof err?.error === 'string' && err.error) || err?.error?.error || 'No se pudo enviar la contraoferta. Intenta de nuevo.';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

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

          {statusConfig.showDriver && (
            <Marker coordinate={trackingCoords} title={driverName}>
              <View style={styles.driverMarkerPin}>
                <MaterialCommunityIcons name="motorbike" size={16} color="#0a0f1c" />
              </View>
            </Marker>
          )}
        </MapView>

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />

        <View style={styles.statusBadgeRow}>
          <Text style={styles.statusBadgeLabel}>Estado del servicio</Text>
          <View style={styles.statusBadgePill}>
            <Text style={styles.statusBadgeText}>{statusBadge}</Text>
          </View>
        </View>

        <View style={styles.stepper}>
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, currentStep >= 1 ? styles.stepDone : styles.stepPending]}>
              <Ionicons name={currentStep >= 1 ? 'checkmark' : 'ellipse'} size={13} color={currentStep >= 1 ? '#0a0f1c' : '#6d6d6d'} />
            </View>
            <Text style={currentStep >= 1 ? styles.stepLabel : styles.stepLabelMuted}>Aceptado</Text>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, currentStep >= 2 ? styles.stepDone : styles.stepPending]}>
              <MaterialCommunityIcons name="bicycle" size={14} color={currentStep >= 2 ? '#0a0f1c' : '#6d6d6d'} />
            </View>
            <Text style={currentStep >= 2 ? styles.stepLabel : styles.stepLabelMuted}>En camino</Text>
          </View>

          <View style={[styles.stepLine, currentStep >= 2 ? styles.stepLineActive : undefined]} />

          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, currentStep >= 3 ? styles.stepDone : styles.stepPending]}>
              <Ionicons name="checkmark" size={13} color={currentStep >= 3 ? '#0a0f1c' : '#6d6d6d'} />
            </View>
            <Text style={currentStep >= 3 ? styles.stepLabel : styles.stepLabelMuted}>Entregado</Text>
          </View>
        </View>

        {pollingError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{pollingError}</Text>
            <TouchableOpacity
              style={styles.errorAction}
              onPress={() => {
                if (pollingRef.current) clearTimeout(pollingRef.current);
                pollingErrorCountRef.current = 0;
                setPollingError(null);
                pollingRef.current = window.setTimeout(() => {
                  void (async () => {
                    try {
                      setIsPolling(true);
                      const order = await (await import('../../src/services/orderService')).orderService.getOrderById(Number(idServicio));
                      setOrderStatus((order.estado || '').toString());
                      setPollingError(null);
                    } catch (err) {
                      console.error('Error polling order (manual):', err);
                      setPollingError('No se pudo actualizar el estado. Reintentando...');
                    } finally {
                      setIsPolling(false);
                    }
                  })();
                }, 300);
              }}
            >
              <Text style={styles.errorActionText}>{isPolling ? 'Actualizando...' : 'Reintentar'}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>{statusConfig.statusTitle}</Text>
          <Text style={styles.statusSubtitle}>{statusConfig.statusSubtitle}</Text>
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
            <Text style={styles.minutesValue}>
              {statusConfig.canTrack && tracking?.tiempoEstimado != null ? String(tracking.tiempoEstimado) : '--'}
            </Text>
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
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              if (!idServicio) {
                Alert.alert('Error', 'ID de servicio no disponible');
                return;
              }
              router.push({
                pathname: '/(cliente)/mensajes',
                params: { idServicio }
              });
            }}
          >
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

        {statusConfig.isPending && (
          <TouchableOpacity 
            style={[styles.rateButton, { backgroundColor: THEME.accent, marginTop: 10 }]} 
            onPress={() => {
              setCounterOfferPrice(String(originalTarifa));
              setShowCounterOfferModal(true);
            }}
          >
            <Ionicons name="cash-outline" size={20} color={THEME.background} />
            <Text style={styles.rateButtonText}>Enviar Contraoferta</Text>
          </TouchableOpacity>
        )}

        {canCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelService}>
            <Ionicons name="close-circle" size={18} color="#ff8b8b" />
            <Text style={styles.cancelButtonText}>Cancelar servicio</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.rateButton}
          onPress={() => {
            if (!idServicio) {
              Alert.alert('Error', 'ID de servicio no disponible');
              return;
            }
            if (!statusConfig.isEntregado) {
              Alert.alert('Aun no', 'Podras calificar cuando el servicio este entregado.');
              return;
            }
            setShowRatingModal(true);
          }}
        >
          <Ionicons name="star" size={20} color={THEME.background} />
          <Text style={styles.rateButtonText}>Calificar servicio</Text>
        </TouchableOpacity>
      </View>

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
            <Text style={styles.modalSubtitle}>Tarifa actual: ${originalTarifa}</Text>

            <TextInput
              style={styles.priceInput}
              placeholder="Ingresa tu nuevo precio"
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
                onPress={handleSendCounterOffer}
                disabled={isLoading || !counterOfferPrice}
              >
                {isLoading ? (
                  <ActivityIndicator color="#0a0f1c" size="small" />
                ) : (
                  <Text style={styles.textSendOffer}>Enviar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <RatingModal
        visible={showRatingModal}
        idServicio={idServicio ? Number(idServicio) : 0}
        driverName={driverName}
        role="CLIENT"
        idCliente={Number(driverId) || undefined}
        onClose={() => setShowRatingModal(false)}
        onSuccess={() => {
          Alert.alert('Éxito', 'Calificación enviada correctamente');
        }}
      />
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
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statusBadgeLabel: {
    color: '#9a9a9a',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadgePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(23, 213, 170, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(23, 213, 170, 0.35)',
  },
  statusBadgeText: {
    color: THEME.primary,
    fontSize: 12,
    fontWeight: '700',
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
  rateButton: {
    backgroundColor: THEME.warning,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  rateButtonText: {
    color: THEME.background,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.35)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 82, 82, 0.08)',
  },
  cancelButtonText: {
    color: '#ff8b8b',
    fontSize: 14,
    fontWeight: '700',
  },
  statusCard: {
    backgroundColor: '#151515',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#2d2d2d',
    marginBottom: 14,
  },
  statusTitle: {
    color: '#e9e9e9',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusSubtitle: {
    color: '#9a9a9a',
    fontSize: 12,
  },
  errorBanner: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5b262b',
    backgroundColor: '#241113',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  errorText: {
    color: '#f0b4b4',
    fontSize: 12,
    flex: 1,
  },
  errorAction: {
    borderRadius: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  errorActionText: {
    color: '#0a0f1c',
    fontSize: 12,
    fontWeight: '700',
  },
  buttonDisabled: { opacity: 0.6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#12151c', borderRadius: 15, padding: 24, width: '85%', maxWidth: 400 },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  modalSubtitle: { color: THEME.textSecondary, fontSize: 14, marginBottom: 16 },
  priceInput: {
    backgroundColor: '#1b1f2a',
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
  btnCancel: { flex: 1, backgroundColor: '#1b1f2a', paddingVertical: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#262d3a' },
  textCancel: { color: '#fff', fontSize: 14, fontWeight: '600' },
  btnSendOffer: { flex: 1, backgroundColor: THEME.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  textSendOffer: { color: '#0a0f1c', fontSize: 14, fontWeight: 'bold' },
});
