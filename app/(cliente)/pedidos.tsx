import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function PedidosTab() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={{ fontSize: 40 }}>👨‍🍳</Text>
          </View>
          <Text style={styles.driverName}>Carlos Mendoza</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Disponible ahora</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: '#f4b400' }]}>4.9</Text>
            <Text style={styles.statLab}>CALIFICACIÓN</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>247</Text>
            <Text style={styles.statLab}>ENTREGAS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: '#17d5aa' }]}>320m</Text>
            <Text style={styles.statLab}>DISTANCIA</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🛵 Vehículo</Text>
            <Text style={styles.detailValue}>Moto · 2022</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📍 Zona</Text>
            <Text style={styles.detailValue}>Centro · Norte</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>⏱️ Resp. prom.</Text>
            <Text style={[styles.detailValue, { color: '#17d5aa' }]}>~3 min</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>✅ Verificado</Text>
            <Text style={[styles.detailValue, { color: '#17d5aa' }]}>Sí</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.btn} 
        onPress={() => router.push('/(cliente)/confirmar-pedido')}
      >
        <Text style={styles.btnText}>Solicitar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1c', paddingHorizontal: 20 },
  content: { flex: 1, paddingTop: 60 },
  profileHeader: { alignItems: 'center', marginBottom: 30 },
  avatarContainer: { width: 90, height: 90, borderRadius: 15, backgroundColor: '#171a22', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#17d5aa' },
  driverName: { color: 'white', fontSize: 28, fontWeight: 'bold', marginTop: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#17d5aa', marginRight: 8 },
  statusText: { color: '#17d5aa', fontSize: 14 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statCard: { width: (width - 60) / 3, backgroundColor: '#171a22', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  statVal: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  statLab: { color: '#8d95a4', fontSize: 10, marginTop: 4 },
  detailsCard: { backgroundColor: '#171a22', borderRadius: 12, padding: 15 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  detailLabel: { color: '#8d95a4', fontSize: 15 },
  detailValue: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  separator: { height: 1, backgroundColor: '#2a3040' },
  btn: { backgroundColor: '#17d5aa', paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginBottom: 30 },
  btnText: { color: '#0a0f1c', fontSize: 18, fontWeight: 'bold' }
});