import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { incidentService } from '../../src/services/incidentService';

export default function ReportarIncidenciaScreen() {
  const router = useRouter();
  const { idServicio } = useLocalSearchParams<{ idServicio: string }>();
  const [descripcion, setDescripcion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!descripcion.trim()) {
      Alert.alert('Campo requerido', 'Por favor describe la incidencia.');
      return;
    }

    if (!idServicio) {
      Alert.alert('Error', 'ID de servicio no disponible');
      return;
    }

    setIsSubmitting(true);
    try {
      await incidentService.createIncident({
        idServicio: Number(idServicio),
        descripcion: descripcion.trim(),
      });
      Alert.alert('Incidencia reportada', 'Tu incidencia ha sido enviada. El equipo de soporte la revisará pronto.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo reportar la incidencia. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>Reportar incidencia</Text>
        <Text style={styles.subtitle}>Servicio #{idServicio}</Text>

        <Text style={styles.label}>Descripción *</Text>
        <TextInput
          style={styles.textArea}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Describe lo sucedido con el mayor detalle posible..."
          placeholderTextColor="#8d95a4"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting || !descripcion.trim()}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#0a0f1c" size="small" />
          ) : (
            <>
              <Ionicons name="send" size={18} color="#0a0f1c" />
              <Text style={styles.submitBtnText}>Enviar reporte</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1c' },
  content: { padding: 20, paddingBottom: 40 },
  backBtn: {
    width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title: { color: '#fff', fontSize: 26, fontWeight: '700' },
  subtitle: { color: '#8d95a4', fontSize: 14, marginTop: 4, marginBottom: 20 },
  label: { color: '#c6cedd', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  textArea: {
    backgroundColor: '#111720', borderWidth: 1, borderColor: '#2a3040',
    borderRadius: 12, padding: 14, color: '#fff', fontSize: 14,
    minHeight: 120, marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: '#17d5aa', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  submitBtnText: { color: '#0a0f1c', fontWeight: '700', fontSize: 16 },
  buttonDisabled: { opacity: 0.6 },
});
