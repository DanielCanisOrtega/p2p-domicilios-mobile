import { View, StyleSheet } from 'react-native';
import { ReactNode } from 'react';

type MapViewProps = {
  style?: any;
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  customMapStyle?: any[];
  children?: ReactNode;
};

type MarkerProps = {
  coordinate: { latitude: number; longitude: number };
  title?: string;
  children?: ReactNode;
};

// MapView para Web - Placeholder con grid oscuro
export function MapView({ style, region, children }: MapViewProps) {
  return (
    <View style={[styles.webMapContainer, style]}>
      <View style={styles.webMapContent}>
        {/* Simular grid de calles */}
        <View style={styles.gridOverlay} />
        {children}
      </View>
    </View>
  );
}

// Marker para Web - Posicionado en el centro como demo
export function Marker({ children }: MarkerProps) {
  return (
    <View style={styles.webMarker}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  webMapContainer: {
    backgroundColor: '#1a2332',
    position: 'relative',
    overflow: 'hidden',
  },
  webMapContent: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
    // @ts-ignore - backgroundImage no está en tipos de RN pero funciona en web
    backgroundImage: `
      linear-gradient(0deg, transparent 24%, rgba(56, 65, 78, .8) 25%, rgba(56, 65, 78, .8) 26%, transparent 27%, transparent 74%, rgba(56, 65, 78, .8) 75%, rgba(56, 65, 78, .8) 76%, transparent 77%, transparent),
      linear-gradient(90deg, transparent 24%, rgba(56, 65, 78, .8) 25%, rgba(56, 65, 78, .8) 26%, transparent 27%, transparent 74%, rgba(56, 65, 78, .8) 75%, rgba(56, 65, 78, .8) 76%, transparent 77%, transparent)
    `,
    backgroundSize: '80px 80px',
  },
  webMarker: {
    position: 'absolute',
  },
});
