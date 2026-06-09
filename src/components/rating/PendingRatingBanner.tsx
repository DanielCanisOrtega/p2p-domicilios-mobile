import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ratingService, type ServicioPendienteCalificar } from '../../services/ratingService';

interface Props {
  onNavigate: (servicio: ServicioPendienteCalificar) => void;
}

export default function PendingRatingBanner({ onNavigate }: Props) {
  const [pendientes, setPendientes] = useState<ServicioPendienteCalificar[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      const load = async () => {
        setLoading(true);
        try {
          const data = await ratingService.getPendientes();
          if (mounted) setPendientes(data);
        } catch {
          if (mounted) setPendientes([]);
        } finally {
          if (mounted) setLoading(false);
        }
      };
      void load();
      return () => { mounted = false; };
    }, [])
  );

  if (loading) return null;
  if (pendientes.length === 0) return null;

  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={() => onNavigate(pendientes[0])}
      activeOpacity={0.8}
    >
      <View style={styles.iconBox}>
        <Ionicons name="star" size={22} color="#f4b400" />
      </View>
      <View style={styles.textBox}>
        <Text style={styles.title}>
          {pendientes.length === 1
            ? 'Tienes 1 servicio pendiente de calificar'
            : `Tienes ${pendientes.length} servicios pendientes de calificar`}
        </Text>
        <Text style={styles.subtitle}>Toca para calificar ahora</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#8d95a4" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e2410',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(244, 180, 0, 0.3)',
    padding: 14, marginBottom: 16, gap: 12,
  },
  iconBox: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(244, 180, 0, 0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  textBox: { flex: 1 },
  title: { color: '#f4b400', fontSize: 13, fontWeight: '700' },
  subtitle: { color: '#8d95a4', fontSize: 12, marginTop: 2 },
});
