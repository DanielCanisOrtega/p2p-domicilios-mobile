import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../../src/context/AuthContext';
import { orderService } from '../../src/services/orderService';

export default function ConfirmarPedido() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  
  // Estados
  const [destino, setDestino] = useState("Cll 18 #8-20, Las Palmas");
  const [origen, setOrigen] = useState("Cra 7 #12-34, Centro");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);

  const getClientId = () => user?.id || user?.user_id || user?.id_cliente || 1;

  const enviarPedido = async () => {
    console.log("LOG: 1. Iniciando proceso...");
    if (!destino.trim()) return Alert.alert("Error", "Escribe el destino");

    setLoading(true);
    try {
      const payload = {
        id_cliente: getClientId(),
        id_domiciliario: 2, // Carlos Mendoza
        direccion_origen: origen,
        direccion_destino: destino,
        lat_origen: 7.8939,
        lon_origen: -72.4842,
        lat_destino: 7.889,
        lon_destino: -72.5023,
        tarifa: 8500,
        tiempo_estimado: 12,
        descripcion: descripcion,
        estado: 'CREADO'
      };

      console.log("LOG: 2. Enviando a Java...", payload);
      const res = await orderService.createOrder(payload);
      
      console.log("LOG: 3. Éxito:", res);
      Alert.alert('¡Listo ne!', 'Tu pedido fue creado en Neon.');
      
      // ✅ Navegación explícita dentro del grupo cliente
      router.push('/(cliente)/seguimiento'); 

    } catch (error: any) {
      console.error("❌ ERROR:", error.response?.data || error.message);
      Alert.alert('Error', 'No se pudo conectar. Mira la consola F12.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* CABECERA MAPA */}
        <View style={styles.mapContainer}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.routeContainer}>
            <View style={styles.line} />
            <View style={[styles.marker, {top: '20%', backgroundColor: '#17d5aa'}]}><Text style={styles.markerText}>A</Text></View>
            <View style={[styles.marker, {bottom: '20%', backgroundColor: '#f4b400'}]}><Text style={styles.markerText}>B</Text></View>
            <View style={styles.bikeMarker}><Ionicons name="bicycle" size={12} color="#f4b400" /></View>
          </View>
        </View>

        <View style={styles.detailsPanel}>
          <Text style={styles.panelTitle}>Detalles del servicio</Text>

          {/* CARD DOMICILIARIO */}
          <View style={styles.driverCard}>
            <View style={styles.driverInfo}>
              <View style={styles.avatar}><Text style={{fontSize: 20}}>🧑</Text></View>
              <View>
                <Text style={styles.driverName}>Carlos Mendoza</Text>
                <Text style={styles.driverStats}>⭐ 4.9 · 320 m de ti</Text>
              </View>
            </View>
            <TouchableOpacity><Text style={styles.changeBtn}>Cambiar</Text></TouchableOpacity>
          </View>

          {/* CARD DIRECCIONES */}
          <View style={styles.addressCard}>
            <View style={styles.addressRow}>
              <View style={[styles.dot, {backgroundColor: '#17d5aa'}]} />
              <View style={{flex: 1}}>
                <Text style={styles.addrLabel}>ORIGEN</Text>
                <TextInput style={[styles.addrInput, { color: 'white' }]} value={origen} onChangeText={setOrigen} />
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.addressRow}>
              <View style={[styles.dot, {backgroundColor: '#f4b400'}]} />
              <View style={{flex: 1}}>
                <Text style={styles.addrLabel}>DESTINO</Text>
                <TextInput style={[styles.addrInput, { color: 'white' }]} value={destino} onChangeText={setDestino} />
              </View>
            </View>
          </View>

          {/* DESCRIPCIÓN */}
          <TextInput 
            style={styles.textArea} 
            placeholder="Descripción del encargo (opcional)..." 
            placeholderTextColor="#555"
            multiline
            value={descripcion}
            onChangeText={setDescripcion}
          />

          {/* RESUMEN */}
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Tarifa estimada</Text>
              <Text style={styles.summaryPrice}>$8.500</Text>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.summaryLabel}>Tiempo estimado</Text>
              <Text style={styles.summaryTime}>~12 min</Text>
            </View>
          </View>

          {/* BOTÓN CONFIRMAR */}
          <TouchableOpacity style={styles.confirmBtn} onPress={enviarPedido} disabled={loading}>
            {loading ? <ActivityIndicator color="#0a0f1c" /> : <Text style={styles.confirmBtnText}>Confirmar solicitud</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1c' },
  mapContainer: { height: 350, backgroundColor: '#131b2f' },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.4)', padding: 10, borderRadius: 10 },
  routeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  line: { width: 2, height: '50%', backgroundColor: '#17d5aa', opacity: 0.5 },
  marker: { position: 'absolute', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  markerText: { fontSize: 12, fontWeight: 'bold', color: '#0a0f1c' },
  bikeMarker: { position: 'absolute', top: '45%', right: '35%', width: 26, height: 26, borderRadius: 13, backgroundColor: '#171a22', borderWidth: 1, borderColor: '#17d5aa', justifyContent: 'center', alignItems: 'center' },
  detailsPanel: { marginTop: -20, backgroundColor: '#0a0f1c', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  panelTitle: { color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  driverCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#171a22', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(23, 213, 170, 0.3)', marginBottom: 15 },
  driverInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#0f1e20', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#17d5aa' },
  driverName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  driverStats: { color: '#8d95a4', fontSize: 12 },
  changeBtn: { color: '#17d5aa', fontWeight: 'bold' },
  addressCard: { backgroundColor: '#171a22', borderRadius: 10, padding: 15, marginBottom: 15 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  addrLabel: { color: '#8d95a4', fontSize: 10, fontWeight: 'bold' },
  addrInput: { fontSize: 16, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#2a3040', marginVertical: 12, marginLeft: 22 },
  textArea: { backgroundColor: '#171a22', borderRadius: 10, padding: 15, color: 'white', height: 80, marginBottom: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  summaryLabel: { color: '#8d95a4', fontSize: 14, marginBottom: 5 },
  summaryPrice: { color: '#17d5aa', fontSize: 42, fontWeight: 'bold' },
  summaryTime: { color: '#17d5aa', fontSize: 24, fontWeight: 'bold' },
  confirmBtn: { backgroundColor: '#17d5aa', paddingVertical: 20, borderRadius: 10, alignItems: 'center' },
  confirmBtnText: { color: '#0a0f1c', fontSize: 22, fontWeight: 'bold' }
});