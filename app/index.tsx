import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView, Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet, Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';

const DARK_THEME = {
  background: '#121212',
  card: '#1E1E1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#ADB5BD',
  primary: '#00D69A', 
  destination: '#FFC107', 
  border: '#333333',
};

export default function DomigoApp() {
  const router = useRouter();

  // ESTADOS
  const [origen, setOrigen] = useState("Cra 7 #12-34, Centro");
  const [destino, setDestino] = useState("Cll 18 #8-20, Las Palmas");
  const [descripcion, setDescripcion] = useState("");
  const [tarifaReal, setTarifaReal] = useState("8.500"); // Se actualizará tras el primer pedido
  const [tiempo, setTiempo] = useState(12);
  const [loading, setLoading] = useState(false);

  // VALIDACIÓN
  const esFormularioValido = 
    origen.trim().length > 5 && 
    destino.trim().length > 5 && 
    !loading;

  const handleConfirmarPedido = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('admin:password123')
        },
        body: JSON.stringify({
          id_cliente: 1, // 🌟 Coincide con tu Backend
          id_domiciliario: 2,
          direccion_origen: origen,
          direccion_destino: destino,
          descripcion: descripcion || "Sin descripción",
          lat_origen: 7.8939,
          lon_origen: -72.4842,
          lat_destino: 7.8890,
          lon_destino: -72.5023,
          tiempo_estimado: tiempo
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Actualizamos la tarifa con lo que calculó el Backend (Haversine)
        if (data.tarifa) setTarifaReal(data.tarifa.toLocaleString());

        // 🚀 Navegamos al seguimiento pasando el ID real de Neon
        router.push({
          pathname: "/seguimiento",
          params: { idServicio: data.id_servicio || data.idServicio }
        });

      } else {
        const errorMsg = await response.text();
        Alert.alert("❌ Error", "El servidor rechazó el pedido. Verifica los IDs en Neon.");
        console.log("Error detalles:", errorMsg);
      }
    } catch (error) {
      Alert.alert("❌ Error de Red", "No se pudo conectar al Backend. ¿Está encendido el puerto 8080?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={DARK_THEME.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles del servicio</Text>
        </View>

        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          
          {/* TARJETA CONDUCTOR */}
          <View style={styles.driverCard}>
            <Ionicons name="person-circle" size={50} color={DARK_THEME.primary} />
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>Carlos Mendoza</Text>
              <Text style={styles.driverRating}>⭐ 4.9 · 320 m de ti</Text>
            </View>
            <TouchableOpacity onPress={() => Alert.alert("Próximamente", "Podrás elegir otros domis.")}>
                <Text style={styles.changeText}>Cambiar</Text>
            </TouchableOpacity>
          </View>

          {/* RUTA */}
          <View style={styles.routeCard}>
            <View style={styles.row}>
              <Ionicons name="radio-button-on" size={20} color={DARK_THEME.primary} />
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>ORIGEN</Text>
                <TextInput 
                  style={styles.textInput}
                  value={origen}
                  onChangeText={setOrigen}
                  placeholderTextColor={DARK_THEME.textSecondary}
                />
              </View>
            </View>

            <View style={styles.line} />

            <View style={styles.row}>
              <Ionicons name="location" size={20} color={DARK_THEME.destination} />
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>DESTINO</Text>
                <TextInput 
                  style={styles.textInput}
                  value={destino}
                  onChangeText={setDestino}
                  placeholderTextColor={DARK_THEME.textSecondary}
                />
              </View>
            </View>
          </View>

          {/* DESCRIPCIÓN */}
          <TextInput 
            style={styles.textArea}
            placeholder="¿Qué debemos llevar? Ejemplo: Unas papas de la UFPS..."
            placeholderTextColor={DARK_THEME.textSecondary}
            multiline
            value={descripcion}
            onChangeText={setDescripcion}
          />

          {/* RESUMEN */}
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Tarifa estimada</Text>
              <Text style={styles.summaryValue}>${tarifaReal}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.summaryLabel}>Tiempo estimado</Text>
              <Text style={styles.summaryValue}>~{tiempo} min</Text>
            </View>
          </View>

        </ScrollView>

        {/* FOOTER */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[
              styles.confirmButton, 
              (!esFormularioValido) && { backgroundColor: '#333' }
            ]}
            onPress={handleConfirmarPedido}
            disabled={!esFormularioValido}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={[
                styles.confirmButtonText,
                (!esFormularioValido) && { color: '#666' }
              ]}>
                Confirmar solicitud
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: DARK_THEME.background },
  container: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginLeft: 15 },
  backButton: { padding: 5 },
  driverCard: { flexDirection: 'row', backgroundColor: DARK_THEME.card, padding: 15, borderRadius: 15, alignItems: 'center', marginBottom: 20 },
  driverInfo: { flex: 1, marginLeft: 12 },
  driverName: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  driverRating: { color: DARK_THEME.textSecondary, fontSize: 12 },
  changeText: { color: DARK_THEME.primary, fontWeight: 'bold' },
  routeCard: { backgroundColor: DARK_THEME.card, padding: 20, borderRadius: 15, marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  inputWrapper: { marginLeft: 15, flex: 1 },
  inputLabel: { color: DARK_THEME.textSecondary, fontSize: 10, fontWeight: 'bold' },
  textInput: { color: '#FFF', fontSize: 15, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#333' },
  line: { width: 2, height: 20, backgroundColor: '#333', marginLeft: 9, marginVertical: 5 },
  textArea: { backgroundColor: DARK_THEME.card, color: '#FFF', padding: 15, borderRadius: 12, height: 100, textAlignVertical: 'top', marginBottom: 25 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  summaryLabel: { color: DARK_THEME.textSecondary, fontSize: 12 },
  summaryValue: { color: DARK_THEME.primary, fontSize: 28, fontWeight: 'bold' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#222', backgroundColor: DARK_THEME.background },
  confirmButton: { backgroundColor: DARK_THEME.primary, padding: 18, borderRadius: 15, alignItems: 'center' },
  confirmButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold' }
});