import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { THEME } from '../../src/constants/theme';
import { chatService, ChatMessage } from '../../src/services/chatService';
import { websocketService } from '../../src/services/websocketService';
import { AuthContext } from '../../src/context/AuthContext';

export default function DomiciliarioMensajesScreen() {
  const router = useRouter();
  const { idServicio } = useLocalSearchParams<{ idServicio?: string }>();
  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!idServicio) {
      Alert.alert('Error', 'No se proporcionó ID de servicio');
      router.back();
      return;
    }

    initializeChat();

    return () => {
      websocketService.unsubscribeFromChat(Number(idServicio));
    };
  }, [idServicio]);

  const initializeChat = async () => {
    try {
      setLoading(true);

      await websocketService.connect();
      setConnected(true);

      await chatService.initChat(Number(idServicio!));
      const previousMessages = await chatService.getMessages(Number(idServicio!));
      setMessages(previousMessages);

      websocketService.subscribeToChat(Number(idServicio!), (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      });
    } catch (error: any) {
      console.error('Error initializing chat:', error);
      Alert.alert('Error', error?.error || 'No se pudo inicializar el chat');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!inputText.trim() || !connected) {
      return;
    }

    try {
      websocketService.sendMessage(Number(idServicio!), inputText.trim());
      setInputText('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.idUsuario === user?.userId || item.idUsuario === user?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        {!isOwnMessage && (
          <Text style={styles.senderName}>{item.nombreUsuario || 'Usuario'}</Text>
        )}
        <Text style={styles.messageText}>{item.contenido}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.fechaEnvio).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={styles.loadingText}>Cargando chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat - Pedido #{idServicio}</Text>
        <View style={[styles.statusIndicator, connected && styles.statusConnected]} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => item.idMensaje?.toString() || index.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay mensajes aún</Text>
            <Text style={styles.emptySubtext}>Inicia la conversación</Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={THEME.textSecondary}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || !connected}
        >
          <Ionicons name="send" size={20} color={THEME.background} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: THEME.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: THEME.textSecondary,
    marginTop: 10,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: THEME.card,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: THEME.textPrimary,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.inactive,
  },
  statusConnected: {
    backgroundColor: THEME.primary,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: THEME.primary,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.card,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textSecondary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: THEME.textPrimary,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 10,
    color: THEME.textSecondary,
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: THEME.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: THEME.inactive,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: THEME.card,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  input: {
    flex: 1,
    backgroundColor: THEME.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    color: THEME.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
