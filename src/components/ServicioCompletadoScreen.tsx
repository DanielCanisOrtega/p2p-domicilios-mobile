import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 🎨 Paleta de colores Premium Dark
const THEME = {
  background: '#0a0f1c',
  panel: '#12151c',
  card: '#171a22',
  primary: '#17d5aa',
  accent: '#f4b400',
  textSecondary: '#8d959f',
  divider: '#262d3a',
};

interface ServicioCompletadoScreenProps {
  clientName: string;
  orderId: string | number;
  fare: string;
  clientRating?: string | number;
  comment?: string;
  tags?: string[];
  earnings?: string;
  dailyTotal?: string;
  onSearchNew: () => void;
}

export default function ServicioCompletadoScreen({
  clientName,
  orderId,
  fare,
  clientRating = '5.0',
  comment = '"Muy puntual y amable, recogió el paquete sin problema. ¡Excelente!"',
  tags = ['Puntual', 'Amable', 'Paquete en buen estado'],
  earnings = fare,
  dailyTotal = '$42.000',
  onSearchNew,
}: ServicioCompletadoScreenProps) {
  const ratingNumber = typeof clientRating === 'string' ? parseFloat(clientRating) : clientRating;
  const fullStars = Math.floor(ratingNumber);
  const hasHalfStar = ratingNumber % 1 >= 0.5;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER: Icono y Títulos */}
        <View style={styles.header}>
          <View style={styles.iconRing}>
            <Ionicons name="checkmark" size={40} color={THEME.primary} />
          </View>
          <Text style={styles.title}>¡Servicio completado!</Text>
          <Text style={styles.subtitle}>Cuéntanos cómo fue tu experiencia con {clientName}</Text>
        </View>

        {/* TARJETA DEL CLIENTE */}
        <View style={styles.clientCard}>
          <View style={styles.avatar}><Text style={{fontSize: 22}}>👩</Text></View>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{clientName}</Text>
            <Text style={styles.clientMeta}>Servicio #DG-{orderId} · {fare}</Text>
            <View style={styles.starsRow}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < fullStars ? 'star' : i === fullStars && hasHalfStar ? 'star-half' : 'star-outline'}
                  size={14}
                  color={THEME.accent}
                />
              ))}
              <Text style={styles.ratingText}> {ratingNumber.toFixed(1)}</Text>
            </View>
          </View>
        </View>

        {/* COMENTARIO DEL CLIENTE */}
        <View style={styles.commentBox}>
          <Text style={styles.commentLabel}>Comentario del cliente</Text>
          <Text style={styles.commentText}>{comment}</Text>
        </View>

        {/* ETIQUETAS */}
        <Text style={styles.tagsLabel}>Etiquetas recibidas</Text>
        <View style={styles.tagsRow}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* TARJETA DE GANANCIAS */}
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Ganaste en esta entrega</Text>
          <Text style={styles.earningsValue}>{earnings}</Text>
          <Text style={styles.earningsTotal}>Acumulado hoy: {dailyTotal}</Text>
        </View>

        {/* TARJETA DE CALIFICACIÓN PROMEDIO */}
        <View style={styles.averageCard}>
          <Text style={styles.averageLabel}>Tu calificación promedio</Text>
          <View style={styles.averageStarsRow}>
            {[...Array(4)].map((_, i) => (
              <Ionicons key={i} name="star" size={30} color={THEME.accent} />
            ))}
            <Ionicons name="star-outline" size={30} color={THEME.accent} />
            <Text style={styles.averageValue}> 4.9</Text>
          </View>
        </View>

        {/* BOTONES DE ACCIÓN FINALES */}
        <TouchableOpacity style={styles.searchNewBtn} onPress={onSearchNew}>
          <Text style={styles.searchNewText}>Buscar nuevo servicio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.historyLink}>
          <Text style={styles.historyLinkText}>Ver historial de entregas</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 40, alignItems: 'center' },
  
  // HEADER
  header: { alignItems: 'center', marginBottom: 30 },
  iconRing: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: THEME.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 20, backgroundColor: 'rgba(23, 213, 170, 0.1)' },
  title: { color: 'white', fontSize: 30, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: THEME.textSecondary, fontSize: 15, textAlign: 'center' },

  // TARJETA CLIENTE
  clientCard: { width: '100%', backgroundColor: THEME.card, borderRadius: 12, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: THEME.divider },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#0a0f1c', borderWidth: 1, borderColor: THEME.primary, alignItems: 'center', justifyContent: 'center' },
  clientInfo: { marginLeft: 15 },
  clientName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  clientMeta: { color: THEME.textSecondary, fontSize: 13, marginTop: 3, marginBottom: 6 },
  starsRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { color: 'white', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },

  // COMENTARIO
  commentBox: { width: '100%', backgroundColor: '#13241e', borderRadius: 10, padding: 18, marginBottom: 25, borderWidth: 1, borderColor: '#1b3b30' },
  commentLabel: { color: THEME.textSecondary, fontSize: 12, marginBottom: 8 },
  commentText: { color: 'white', fontSize: 15, fontStyle: 'italic', lineHeight: 22 },

  // ETIQUETAS
  tagsLabel: { color: THEME.textSecondary, fontSize: 13, alignSelf: 'flex-start', marginBottom: 12 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: '100%', marginBottom: 30 },
  tag: { borderWidth: 1, borderColor: THEME.primary, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
  tagText: { color: THEME.primary, fontSize: 13, fontWeight: 'bold' },

  // GANANCIAS
  earningsCard: { width: '100%', backgroundColor: THEME.card, borderRadius: 12, padding: 25, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: THEME.divider },
  earningsLabel: { color: THEME.textSecondary, fontSize: 14, marginBottom: 8 },
  earningsValue: { color: THEME.primary, fontSize: 46, fontWeight: 'bold', marginBottom: 8 },
  earningsTotal: { color: THEME.textSecondary, fontSize: 13 },

  // PROMEDIO
  averageCard: { width: '100%', backgroundColor: THEME.card, borderRadius: 12, padding: 25, alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: THEME.divider },
  averageLabel: { color: THEME.textSecondary, fontSize: 14, marginBottom: 15 },
  averageStarsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  averageValue: { color: THEME.accent, fontSize: 30, fontWeight: 'bold', marginLeft: 15 },

  // BOTONES
  searchNewBtn: { width: '100%', backgroundColor: THEME.primary, borderRadius: 12, paddingVertical: 20, alignItems: 'center', marginBottom: 25 },
  searchNewText: { color: '#0a0f1c', fontSize: 20, fontWeight: 'bold' },
  historyLink: { paddingBottom: 20 },
  historyLinkText: { color: THEME.textSecondary, fontSize: 16 },
});
