import { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
} from "react-native";
import { useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function DomiciliarioHomeScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [disponible, setDisponible] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Panel de Domiciliario</Text>
        <Text style={styles.subtitle}>
          Bienvenido, {user?.username || user?.nombre || "Domiciliario"}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Estado:</Text>
            <Text
              style={[
                styles.statusValue,
                disponible ? styles.statusAvailable : styles.statusUnavailable,
              ]}
            >
              {disponible ? "Disponible" : "No Disponible"}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>
              {disponible
                ? "Recibirás notificaciones de nuevos pedidos"
                : "Activa tu disponibilidad para recibir pedidos"}
            </Text>
            <Switch
              value={disponible}
              onValueChange={setDisponible}
              trackColor={{ false: "#ccc", true: "#34C759" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Map")}
        >
          <Text style={styles.cardIcon}>🗺️</Text>
          <Text style={styles.cardTitle}>Ver Mapa</Text>
          <Text style={styles.cardDescription}>
            Ubicación y pedidos cercanos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardIcon}>📋</Text>
          <Text style={styles.cardTitle}>Mis Entregas</Text>
          <Text style={styles.cardDescription}>
            Historial de entregas realizadas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardIcon}>💰</Text>
          <Text style={styles.cardTitle}>Ganancias</Text>
          <Text style={styles.cardDescription}>
            Ver resumen de ingresos
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "#34C759",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusAvailable: {
    color: "#34C759",
  },
  statusUnavailable: {
    color: "#ff3b30",
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    marginRight: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: "#ff3b30",
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
