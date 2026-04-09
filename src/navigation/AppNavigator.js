import { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";

// Auth Screens
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

// Client Screens
import ClientHomeScreen from "../screens/ClientHomeScreen";

// Domiciliario Screens
import DomiciliarioHomeScreen from "../screens/DomiciliarioHomeScreen";

// Shared Screens
import MapScreen from "../screens/MapScreen";
import RequestServiceScreen from "../screens/RequestServiceScreen";

const Stack = createNativeStackNavigator();

// Stack de autenticación (no autenticado)
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Stack para clientes
function ClientStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ClientHome"
        component={ClientHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RequestService"
        component={RequestServiceScreen}
        options={{ title: "Solicitar Servicio" }}
      />
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{ title: "Mapa" }}
      />
    </Stack.Navigator>
  );
}

// Stack para domiciliarios
function DomiciliarioStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DomiciliarioHome"
        component={DomiciliarioHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{ title: "Mapa" }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useContext(AuthContext);

  // Pantalla de carga mientras verifica autenticación
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthStack />
      ) : user?.role === "CLIENT" ? (
        <ClientStack />
      ) : user?.role === "DOMICILIARIO" ? (
        <DomiciliarioStack />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});
