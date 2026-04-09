import { View, Text, StyleSheet } from 'react-native';

const THEME = {
  background: '#121212',
  textPrimary: '#FFFFFF',
  textSecondary: '#ADB5BD',
};

export default function ClientePedidosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Pedidos</Text>
      <Text style={styles.subtitle}>Próximamente...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.textSecondary,
  },
});
