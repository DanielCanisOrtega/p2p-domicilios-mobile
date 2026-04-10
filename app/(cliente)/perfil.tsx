import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useContext } from 'react';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../src/context/AuthContext';
import { THEME } from '../../src/constants/theme';

export default function ClientePerfilScreen() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('¿Estás seguro que deseas cerrar sesión?');
      if (!confirmed) return;
    } else {
      return Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => performLogout(),
        },
      ]);
    }

    await performLogout();
  };

  const performLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Error: No se pudo cerrar sesión');
      } else {
        Alert.alert('Error', 'No se pudo cerrar sesión');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.nombre || user?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>Cliente</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Editar Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Direcciones Guardadas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Métodos de Pago</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Ayuda y Soporte</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginBottom: 5,
  },
  role: {
    fontSize: 12,
    color: THEME.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: 30,
  },
  menuItem: {
    backgroundColor: THEME.card,
    padding: 18,
    borderRadius: 12,
    marginBottom: 10,
  },
  menuText: {
    color: THEME.textPrimary,
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: THEME.danger,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: THEME.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
