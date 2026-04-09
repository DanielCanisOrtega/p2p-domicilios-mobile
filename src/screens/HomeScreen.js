import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function HomeScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: logout,
        },
      ]
    );
  };

  // Servicios para clientes
  const clientServices = [
    {
      title: "Solicitar Servicio",
      description: "Solicita un domicilio",
      icon: "📦",
      onPress: () => navigation.navigate("RequestService"),
    },
    {
      title: "Ver Mapa",
      description: "Domiciliarios cercanos",
      icon: "🗺️",
      onPress: () => navigation.navigate("Map"),
    },
    {
      title: "Mis Servicios",
      description: "Historial de pedidos",
      icon: "📋",
      onPress: () => Alert.alert("Próximamente", "Esta función estará disponible pronto"),
    },
  ];

  // Servicios para domiciliarios
  const domiciliarioServices = [
    {
      title: "Servicios Disponibles",
      description: "Ver servicios pendientes",
      icon: "📦",
      onPress: () => Alert.alert("Próximamente", "Esta función estará disponible pronto"),
    },
    {
      title: "Ver Mapa",
      description: "Mapa de servicios",
      icon: "🗺️",
      onPress: () => navigation.navigate("Map"),
    },
    {
      title: "Mis Entregas",
      description: "Historial de entregas",
      icon: "✅",
      onPress: () => Alert.alert("Próximamente", "Esta función estará disponible pronto"),
    },
    {
      title: "Configuración",
      description: "Disponibilidad y ajustes",
      icon: "⚙️",
      onPress: () => Alert.alert("Próximamente", "Esta función estará disponible pronto"),
    },
  ];

  const services = user?.role === "CLIENT" ? clientServices : domiciliarioServices;

  return (
    <ScrollView style={styles.container}>
      {/* Header con info del usuario */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.username?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.welcomeText}>Bienvenido</Text>
            <Text style={styles.userName}>{user?.username}</Text>
            <Text style={styles.userRole}>
              {user?.role === "CLIENT" ? "Cliente" : "Domiciliario"}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Título de servicios */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Servicios Disponibles</Text>
        <Text style={styles.sectionSubtitle}>
          {user?.role === "CLIENT"
            ? "Selecciona un servicio para comenzar"
            : "Gestiona tus entregas"}
        </Text>
      </View>

      {/* Grid de servicios */}
      <View style={styles.servicesGrid}>
        {services.map((service, index) => (
          <TouchableOpacity
            key={index}
            style={styles.serviceCard}
            onPress={service.onPress}
            activeOpacity={0.7}
          >
            <Text style={styles.serviceIcon}>{service.icon}</Text>
            <Text style={styles.serviceTitle}>{service.title}</Text>
            <Text style={styles.serviceDescription}>{service.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#007AFF",
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007AFF",
  },
  userDetails: {
    marginLeft: 15,
    flex: 1,
  },
  welcomeText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  userName: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 2,
  },
  userRole: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "white",
    alignSelf: "flex-start",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  sectionHeader: {
    padding: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  servicesGrid: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  serviceCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 10,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  serviceDescription: {
    fontSize: 14,
    color: "#666",
  },
});
