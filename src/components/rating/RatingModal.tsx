import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { ratingService } from '../../services/ratingService';

interface RatingModalProps {
  visible: boolean;
  idServicio: number;
  driverName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RatingModal({
  visible,
  idServicio,
  driverName = 'el domiciliario',
  onClose,
  onSuccess,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Por favor selecciona una calificación');
      return;
    }

    try {
      setLoading(true);
      await ratingService.createRating({
        idServicio,
        puntuacion: rating,
        comentario: comment.trim() || undefined,
      });

      Alert.alert('¡Gracias!', 'Tu calificación ha sido enviada');
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', error?.error || 'No se pudo enviar la calificación');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={THEME.textSecondary} />
          </TouchableOpacity>

          <Text style={styles.title}>Calificar servicio</Text>
          <Text style={styles.subtitle}>¿Cómo fue tu experiencia con {driverName}?</Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={40}
                  color={star <= rating ? THEME.warning : THEME.inactive}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Comentario (opcional)"
            placeholderTextColor={THEME.textSecondary}
            multiline
            maxLength={500}
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitButton, (rating === 0 || loading) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={rating === 0 || loading}
          >
            {loading ? (
              <ActivityIndicator color={THEME.background} />
            ) : (
              <Text style={styles.submitButtonText}>Enviar calificación</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 24,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  commentInput: {
    backgroundColor: THEME.background,
    borderRadius: 8,
    padding: 12,
    color: THEME.textPrimary,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 20,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: THEME.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: THEME.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
