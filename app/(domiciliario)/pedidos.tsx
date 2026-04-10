import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../src/constants/theme';

export default function DomiciliarioPedidosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Entregas</Text>
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
