import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const THEME = {
  background: '#121212',
  card: '#1E1E1E',
  primary: '#00D69A', // Verde Domigo
  text: '#FFFFFF',
  secondaryText: '#ADB5BD',
  accent: '#2D2D2D',
  line: '#333333'
};

export default function SeguimientoScreen() {
  const router = useRouter();
  const { idServicio } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulamos una carga de 1.5 segundos para que parezca que consulta Neon
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={{ color: THEME.secondaryText, marginTop: 10 }}>Localizando tu pedido...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ÁREA DE MAPA (Simulada) */}
      <View style={styles.mapPlaceholder}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        {/* Icono de la moto moviéndose */}
        <Ionicons name="bicycle" size={60} color={THEME.primary} style={styles.bikeIcon} />
        <Text style={styles.orderIdText}>ID Pedido: #{idServicio}</Text>
      </View>

      {/* DETALLES DEL SEGUIMIENTO (Bottom Sheet) */}
      <View style={styles.detailsSheet}>
        <View style={styles.handle} />
        
        {/* PROGRESO DEL SERVICIO (Stepper) */}
        <View style={styles.stepperContainer}>
          <View style={styles.step}>
            <View style={[styles.circle, styles.activeCircle]}>
              <Ionicons name="checkmark" size={14} color="black" />
            </View>
          </View>
          <View style={[styles.line, styles.activeLine]} />
          
          <View style={styles.step}>
            <View style={[styles.circle, styles.activeCircle]}>
              <Ionicons name="checkmark" size={14} color="black" />
            </View>
            <Text style={styles.stepLabel}>Aceptado</Text>
          </View>
          <View style={[styles.line, styles.activeLine]} />
          
          <View style={styles.step}>
            <View style={[styles.circle, styles.activeCircle]}>
              <Ionicons name="arrow-forward" size={14} color="black" />
            </View>
            <Text style={[styles.stepLabel, { color: THEME.primary, fontWeight: 'bold' }]}>En camino</Text>
          </View>
          <View style={styles.line} />
          
          <View style={styles.step}>
            <View style={styles.circle} />
            <Text style={styles.stepLabel}>Entregado</Text>
          </View>
        </View>

        {/* TARJETA DEL CONDUCTOR */}
        <View style={styles.driverCard}>
          <Ionicons name="person-circle" size={55} color={THEME.primary} />
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>Carlos Mendoza</Text>
            <Text style={styles.vehicleInfo}>🛵 Honda CB · ABC-123</Text>
          </View>
          <View style={styles.etaBadge}>
            <Text style={styles.etaNumber}>7</Text>
            <Text style={styles.etaUnit}>MIN</Text>
          </View>
        </View>

        {/* BOTONES DE ACCIÓN */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="white" />
            <Text style={styles.actionText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="call-outline" size={20} color="white" />
            <Text style={styles.actionText}>Llamar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => Alert.alert("Ayuda", "Soporte Domigo en camino.")}
          >
            <Ionicons name="help-buoy-outline" size={20} color="white" />
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
    backgroundColor: THEME.background 
  },
  mapPlaceholder: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#1a1a1a' // Un gris un poco diferente para el "mapa"
  },
  backButton: { 
    position: 'absolute', 
    top: 50, 
    left: 20, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    padding: 12, 
    borderRadius: 12 
  },
  bikeIcon: { 
    marginBottom: 20,
    shadowColor: THEME.primary,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10
  },
  orderIdText: {
    color: THEME.secondaryText,
    fontSize: 14,
    fontWeight: '500'
  },
  detailsSheet: { 
    backgroundColor: THEME.card, 
    borderTopLeftRadius: 35, 
    borderTopRightRadius: 35, 
    padding: 25, 
    paddingBottom: 40,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20
  },
  handle: { 
    width: 45, 
    height: 5, 
    backgroundColor: '#333', 
    alignSelf: 'center', 
    marginBottom: 25, 
    borderRadius: 10 
  },
  stepperContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 45 
  },
  step: { 
    alignItems: 'center', 
    width: 60 
  },
  circle: { 
    width: 26, 
    height: 26, 
    borderRadius: 13, 
    backgroundColor: '#333', 
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 2
  },
  activeCircle: { 
    backgroundColor: THEME.primary 
  },
  line: { 
    flex: 1, 
    height: 3, 
    backgroundColor: '#333', 
    marginBottom: 0, // Alineado con los círculos
    marginHorizontal: -15 
  },
  activeLine: { 
    backgroundColor: THEME.primary 
  },
  stepLabel: { 
    fontSize: 10, 
    color: THEME.secondaryText, 
    marginTop: 8, 
    position: 'absolute', 
    top: 25, 
    textAlign: 'center', 
    width: 80 
  },
  driverCard: { 
    flexDirection: 'row', 
    backgroundColor: THEME.accent, 
    padding: 18, 
    borderRadius: 20, 
    alignItems: 'center', 
    marginBottom: 25 
  },
  driverInfo: { 
    flex: 1, 
    marginLeft: 15 
  },
  driverName: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  vehicleInfo: { 
    color: THEME.secondaryText, 
    fontSize: 13,
    marginTop: 2
  },
  etaBadge: { 
    backgroundColor: 'rgba(0,214,154,0.15)', 
    paddingVertical: 10,
    paddingHorizontal: 15, 
    borderRadius: 15, 
    alignItems: 'center', 
    borderWidth: 1.5, 
    borderColor: THEME.primary 
  },
  etaNumber: { 
    color: THEME.primary, 
    fontSize: 22, 
    fontWeight: 'bold' 
  },
  etaUnit: { 
    color: THEME.primary, 
    fontSize: 9,
    fontWeight: 'bold'
  },
  actionsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  actionButton: { 
    flex: 1, 
    flexDirection: 'column', 
    backgroundColor: THEME.accent, 
    paddingVertical: 15, 
    borderRadius: 18, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#2a2a2a'
  },
  actionText: { 
    color: 'white', 
    marginTop: 8, 
    fontSize: 12,
    fontWeight: '500'
  }
});