import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { THEME } from "../../src/constants/theme";
import { AuthContext } from "../../src/context/AuthContext";
import { ChatMessage, chatService } from "../../src/services/chatService";
import { websocketService } from "../../src/services/websocketService";

export default function DomiciliarioMensajesScreen() {
  const router = useRouter();
  const { idServicio } = useLocalSearchParams<{ idServicio?: string }>();
  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [hasService, setHasService] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Esperar a que idServicio y user (token) estén listos
    if (!idServicio || Number.isNaN(Number(idServicio)) || !user) {
      if (!idServicio || Number.isNaN(Number(idServicio))) {
        setHasService(false);
        setLoading(false);
      }
      return;
    }

    setHasService(true);
    initializeChat();

    return () => {
      websocketService.unsubscribeFromChat(Number(idServicio));
    };
  }, [idServicio, user]);

  const initializeChat = async () => {
    try {
      setLoading(true);

      await websocketService.connect();
      setConnected(true);

      await chatService.initChat(Number(idServicio!));
      const previousMessages = await chatService.getMessages(
        Number(idServicio!),
      );
      setMessages(previousMessages);

      websocketService.subscribeToChat(Number(idServicio!), (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      });
    } catch (error: any) {
      console.error("Error initializing chat:", error);
      Alert.alert("Error", error?.error || "No se pudo inicializar el chat");
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
      setInputText("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "No se pudo enviar el mensaje");
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const currentUserId = String(user?.userId ?? user?.id ?? '');
    const senderId = String(item.idUsuario ?? '');
    const isOwnMessage = currentUserId !== '' && currentUserId === senderId;

    return (
      <View style={[styles.bubbleWrapper, isOwnMessage ? styles.myBubbleWrapper : styles.theirBubbleWrapper]}>
        <View style={[styles.bubble, isOwnMessage ? styles.myBubble : styles.theirBubble]}>
          {!isOwnMessage && (
            <Text style={styles.senderName}>{item.nombreUsuario || "Cliente"}</Text>
          )}
          <Text style={[styles.messageText, isOwnMessage ? styles.myBubbleText : styles.theirBubbleText]}>
            {item.contenido}
          </Text>
          <Text style={[styles.messageTime, isOwnMessage ? styles.myTime : styles.theirTime]}>
            {new Date(item.fechaEnvio).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
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

  if (!hasService) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          No tienes un servicio activo para chatear.
        </Text>
        <Text style={styles.loadingText}>
          Abre el chat desde el seguimiento del pedido.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatarMini}>
            <Text style={{ fontSize: 16 }}>👤</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Pedido #{idServicio}</Text>
            <Text style={styles.onlineText}>En línea</Text>
          </View>
        </View>
        <View
          style={[styles.statusIndicator, connected && styles.statusConnected]}
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) =>
          item.idMensaje?.toString() || index.toString()
        }
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

      <View style={styles.footer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#6b7280"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || !connected}
        >
          <Ionicons name="send" size={18} color="#0a0f1c" style={{ marginLeft: 3 }} />
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
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: THEME.textSecondary,
    marginTop: 10,
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: '#12151c',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1f2e',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1c1f2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  avatarMini: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#1c1f2a', alignItems: 'center', justifyContent: 'center', marginRight: 10, borderWidth: 1, borderColor: THEME.primary },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: 'white',
  },
  onlineText: { color: THEME.primary, fontSize: 11, fontWeight: 'bold' },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.inactive,
  },
  statusConnected: {
    backgroundColor: THEME.primary,
  },
  messagesList: {
    padding: 20,
    flexGrow: 1,
  },
  bubbleWrapper: { marginBottom: 20, maxWidth: '85%' },
  myBubbleWrapper: { alignSelf: 'flex-end' },
  theirBubbleWrapper: { alignSelf: 'flex-start' },
  bubble: { paddingHorizontal: 16, paddingVertical: 12 },
  myBubble: {
    backgroundColor: THEME.primary,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#363842',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 4,
  },
  myBubbleText: { color: '#0a0f1c', fontSize: 15, fontWeight: '500' },
  theirBubbleText: { color: 'white', fontSize: 15 },
  senderName: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.primary,
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  messageText: { fontSize: 15, lineHeight: 20 },
  messageTime: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTime: { color: 'rgba(10, 15, 28, 0.5)' },
  theirTime: { color: 'rgba(255, 255, 255, 0.5)' },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 15,
    backgroundColor: '#12151c',
    borderTopWidth: 1,
    borderTopColor: '#1a1f2e',
  },
  input: {
    flex: 1,
    backgroundColor: '#1c1f2a',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    marginRight: 10,
    color: 'white',
    maxHeight: 100,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#2a2f40',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
