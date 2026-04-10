import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '../../src/constants/theme';

export default function SeguimientoScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapArea}>
        <View style={styles.gridOverlay} />
        <View style={styles.vignetteTop} />
        <View style={styles.vignetteBottom} />

        <View style={styles.roadVerticalMain} />
        <View style={styles.roadVerticalLeft} />
        <View style={styles.roadVerticalRight} />
        <View style={styles.roadHorizontalTop} />
        <View style={styles.roadHorizontalBottom} />

        <View style={[styles.cityBlock, styles.blockTopLeft]} />
        <View style={[styles.cityBlock, styles.blockTopRight]} />
        <View style={[styles.cityBlock, styles.blockBottomLeft]} />
        <View style={[styles.cityBlock, styles.blockBottomRight]} />

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.mapMarkerTop}>
          <View style={styles.markerRing}>
            <MaterialCommunityIcons name="motorbike" size={18} color={THEME.warning} />
          </View>
        </View>

        <View style={styles.routeGroup}>
          <View style={styles.routeTop} />
          <View style={styles.routeMiddle} />
          <View style={styles.routeBottom} />
        </View>

        <View style={styles.originMarker}>
          <View style={styles.pinHalo} />
          <View style={[styles.pinDot, { backgroundColor: THEME.primary }]} />
        </View>

        <View style={styles.destinationMarker}>
          <View style={styles.pinHalo} />
          <View style={[styles.pinDot, { backgroundColor: THEME.accent }]}>
            <Ionicons name="location-sharp" size={12} color="#ffca3a" />
          </View>
        </View>
      </View>

      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />

        <View style={styles.stepper}>
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepDone]}>
              <Ionicons name="checkmark" size={13} color="#0a0f1c" />
            </View>
            <Text style={styles.stepLabel}>Aceptado</Text>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepDone]}>
              <MaterialCommunityIcons name="bicycle" size={14} color="#0a0f1c" />
            </View>
            <Text style={styles.stepLabel}>En camino</Text>
          </View>

          <View style={[styles.stepLine, styles.stepLineActive]} />

          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepPending]}>
              <Ionicons name="checkmark" size={13} color="#6d6d6d" />
            </View>
            <Text style={styles.stepLabelMuted}>Entregado</Text>
          </View>
        </View>

        <View style={styles.driverCard}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverAvatarText}>🧑</Text>
          </View>

          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>Carlos Mendoza</Text>
            <Text style={styles.driverMeta}>🏍 Honda CB · ABC-123</Text>
          </View>

          <View style={styles.minutesBox}>
            <Text style={styles.minutesValue}>7</Text>
            <Text style={styles.minutesLabel}>MIN</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn}>
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
      </View>
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
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.45,
    backgroundColor: '#101a30',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderStyle: 'solid',
  },
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(8, 12, 22, 0.35)',
    zIndex: 1,
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: 'rgba(7, 10, 18, 0.45)',
    zIndex: 1,
  },
  roadVerticalMain: {
    position: 'absolute',
    top: -30,
    bottom: -20,
    left: '50%',
    marginLeft: -5,
    width: 10,
    backgroundColor: 'rgba(188, 202, 230, 0.16)',
    zIndex: 0,
  },
  roadVerticalLeft: {
    position: 'absolute',
    top: -10,
    bottom: 20,
    left: '22%',
    width: 7,
    backgroundColor: 'rgba(188, 202, 230, 0.1)',
    zIndex: 0,
  },
  roadVerticalRight: {
    position: 'absolute',
    top: -5,
    bottom: -10,
    right: '18%',
    width: 7,
    backgroundColor: 'rgba(188, 202, 230, 0.1)',
    zIndex: 0,
  },
  roadHorizontalTop: {
    position: 'absolute',
    top: 130,
    left: -20,
    right: -20,
    height: 8,
    backgroundColor: 'rgba(188, 202, 230, 0.14)',
    zIndex: 0,
  },
  roadHorizontalBottom: {
    position: 'absolute',
    top: 255,
    left: -20,
    right: -20,
    height: 8,
    backgroundColor: 'rgba(188, 202, 230, 0.12)',
    zIndex: 0,
  },
  cityBlock: {
    position: 'absolute',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
    zIndex: 0,
  },
  blockTopLeft: {
    top: 145,
    left: 20,
    width: 112,
    height: 92,
  },
  blockTopRight: {
    top: 145,
    right: 20,
    width: 112,
    height: 92,
  },
  blockBottomLeft: {
    top: 268,
    left: 20,
    width: 112,
    height: 70,
  },
  blockBottomRight: {
    top: 268,
    right: 20,
    width: 112,
    height: 70,
  },
  pinHalo: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(24, 216, 176, 0.18)',
    top: -6,
    left: -6,
  },
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
  mapMarkerTop: {
    position: 'absolute',
    top: 42,
    left: '50%',
    marginLeft: 18,
    zIndex: 3,
  },
  markerRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 3,
    borderColor: THEME.primary,
    backgroundColor: '#0d1221',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#18d8b0',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  routeGroup: {
    position: 'absolute',
    top: 75,
    left: '50%',
    width: 92,
    marginLeft: -46,
    alignItems: 'center',
    zIndex: 2,
  },
  routeTop: {
    width: 3,
    height: 32,
    backgroundColor: THEME.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    opacity: 0.95,
  },
  routeMiddle: {
    width: 56,
    height: 86,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderColor: THEME.primary,
    borderStyle: 'dashed',
    marginTop: 2,
    marginRight: 18,
    opacity: 0.95,
  },
  routeBottom: {
    width: 3,
    height: 66,
    backgroundColor: THEME.primary,
    borderRadius: 8,
    borderStyle: 'dashed',
    opacity: 0.95,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  originMarker: {
    position: 'absolute',
    top: 96,
    left: '50%',
    marginLeft: -7,
    zIndex: 4,
  },
  destinationMarker: {
    position: 'absolute',
    top: 270,
    left: '50%',
    marginLeft: -7,
    zIndex: 4,
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
});