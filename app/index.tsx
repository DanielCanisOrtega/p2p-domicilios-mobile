import { Ionicons } from '@expo/vector-icons';
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

// --- TEMA DE COLORES FIGMA (Domigo App) ---
const DARK_THEME = {
  background: '#121212',
  card: '#1E1E1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#ADB5BD',
  primary: '#00D69A', // Verde Teal
  destination: '#FFC107', // Amarillo
  border: '#333333',
};

export default function DomigoApp() {
  // --- 1. ESTADOS PARA HACER LA APP DINÁMICA ---
  const [origen, setOrigen] = useState("Cra 7 #12-34, Centro");
  const [destino, setDestino] = useState("Cll 18 #8-20, Las Palmas");
  const [descripcion, setDescripcion] = useState("");
  const [tarifa, setTarifa] = useState("8.500");
  const [tiempo, setTiempo] = useState(12);
  const [loading, setLoading] = useState(false);

  // --- 2. FUNCIÓN DE ENVÍO AL BACKEND ---
  const handleConfirmarPedido = async () => {
    setLoading(true);
    try {
      // RECUERDA: Si usas celular físico, cambia 'localhost' por la IP de tu PC
      const response = await fetch('http://localhost:8080/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('admin:password123')
        },
        body: JSON.stringify({
          id_cliente: 1,
          id_domiciliario: 2,
          direccion_origen: origen, // <--- Dinámico
          direccion_destino: destino, // <--- Dinámico
          descripcion: descripcion || "Sin descripción", // <--- Dinámico
          lat_origen: 7.8939,
          lon_origen: -72.4842,
          lat_destino: 7.8890,
          lon_destino: -72.5023,
          tiempo_estimado: tiempo
        })
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert(
          "✅ Pedido Confirmado", 
          `ID: ${data.id_servicio}\nDe: ${origen}\nPara: ${destino}`
        );
      } else {
        Alert.alert("❌ Error", "No se pudo guardar en Neon.");
      }
    } catch (error) {
      Alert.alert("❌ Error de Red", "Verifica que el Backend esté corriendo.");
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
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={DARK_THEME.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles del servicio</Text>
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          
          {/* TARJETA CONDUCTOR (Visual) */}
          <View style={styles.driverCard}>
            <Ionicons name="person-circle" size={50} color={DARK_THEME.primary} />
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>Carlos Mendoza</Text>
              <Text style={styles.driverRating}>⭐ 4.9 · 320 m de ti</Text>
            </View>
            <Text style={styles.changeText}>Cambiar</Text>
          </View>

          {/* TARJETA DE RUTA DINÁMICA */}
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
            placeholder="Descripción del encargo (opcional)..."
            placeholderTextColor={DARK_THEME.textSecondary}
            multiline
            value={descripcion}
            onChangeText={setDescripcion}
          />

          {/* RESUMEN TARIFA */}
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Tarifa estimada</Text>
              <Text style={styles.summaryValue}>${tarifa}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.summaryLabel}>Tiempo estimado</Text>
              <Text style={styles.summaryValue}>~{tiempo} min</Text>
            </View>
          </View>

        </ScrollView>

        {/* BOTÓN DE ACCIÓN */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.confirmButton, loading && { opacity: 0.7 }]}
            onPress={handleConfirmarPedido}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.confirmButtonText}>Confirmar solicitud</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: DARK_THEME.background },
  container: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginLeft: 15 },
  backButton: { padding: 5 },
  
  driverCard: { 
    flexDirection: 'row', backgroundColor: DARK_THEME.card, 
    padding: 15, borderRadius: 15, alignItems: 'center', marginBottom: 20 
  },
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

  textArea: { 
    backgroundColor: DARK_THEME.card, color: '#FFF', padding: 15, 
    borderRadius: 12, height: 100, textAlignVertical: 'top', marginBottom: 25 
  },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  summaryLabel: { color: DARK_THEME.textSecondary, fontSize: 12 },
  summaryValue: { color: DARK_THEME.primary, fontSize: 28, fontWeight: 'bold' },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#222' },
  confirmButton: { backgroundColor: DARK_THEME.primary, padding: 18, borderRadius: 15, alignItems: 'center' },
  confirmButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold' }
});