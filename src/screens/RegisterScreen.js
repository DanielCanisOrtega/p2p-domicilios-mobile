import { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    nombre: "",
    telefono: "",
    role: "CLIENT",
  });
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleRegister = async () => {
    // Validaciones
    if (
      !formData.username.trim() ||
      !formData.password.trim() ||
      !formData.email.trim()
    ) {
      Alert.alert("Error", "Por favor completa los campos obligatorios");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...dataToSend } = formData;
      await register(dataToSend);
      // La navegación se maneja automáticamente por el AppNavigator
    } catch (error) {
      Alert.alert(
        "Error de Registro",
        error.error || "No se pudo completar el registro. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Crear Cuenta</Text>

        <TextInput
          style={styles.input}
          placeholder="Usuario *"
          value={formData.username}
          onChangeText={(value) => updateField("username", value)}
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Email *"
          value={formData.email}
          onChangeText={(value) => updateField("email", value)}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={formData.nombre}
          onChangeText={(value) => updateField("nombre", value)}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Teléfono"
          value={formData.telefono}
          onChangeText={(value) => updateField("telefono", value)}
          keyboardType="phone-pad"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña *"
          value={formData.password}
          onChangeText={(value) => updateField("password", value)}
          secureTextEntry
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirmar Contraseña *"
          value={formData.confirmPassword}
          onChangeText={(value) => updateField("confirmPassword", value)}
          secureTextEntry
          editable={!loading}
        />

        <Text style={styles.label}>Tipo de cuenta:</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              formData.role === "CLIENT" && styles.roleButtonSelected,
            ]}
            onPress={() => updateField("role", "CLIENT")}
            disabled={loading}
          >
            <Text
              style={[
                styles.roleButtonText,
                formData.role === "CLIENT" && styles.roleButtonTextSelected,
              ]}
            >
              Cliente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              formData.role === "DOMICILIARIO" && styles.roleButtonSelected,
            ]}
            onPress={() => updateField("role", "DOMICILIARIO")}
            disabled={loading}
          >
            <Text
              style={[
                styles.roleButtonText,
                formData.role === "DOMICILIARIO" &&
                  styles.roleButtonTextSelected,
              ]}
            >
              Domiciliario
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}>Inicia Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ddd",
    marginHorizontal: 5,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  roleButtonSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#007AFF",
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  roleButtonTextSelected: {
    color: "#fff",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  loginText: {
    color: "#666",
    fontSize: 16,
  },
  loginLink: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
