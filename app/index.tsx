import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../src/context/AuthContext';
import { THEME } from '../src/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useContext(AuthContext);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Redirigir según el rol
      if (user.role === 'CLIENT') {
        router.replace('/(cliente)/mapa');
      } else if (user.role === 'DOMICILIARIO') {
        router.replace('/(domiciliario)/mapa');
      }
    }
  }, [isAuthenticated, user, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Logo con efecto glow */}
      <View style={styles.logoContainer}>
        <View style={styles.logoGlow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>🛵</Text>
          </View>
        </View>

        <Text style={styles.logoText}>
          Domi<Text style={styles.logoTextHighlight}>Go</Text>
        </Text>

        <Text style={styles.tagline}>
          Tu domiciliario más cercano,{'\n'}en segundos.
        </Text>
      </View>

      {/* Botones */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.primaryButtonText}>Crear cuenta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.secondaryButtonText}>Ya tengo cuenta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    justifyContent: 'space-between',
    padding: 20,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoGlow: {
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 20,
  },
  logoBox: {
    width: 120,
    height: 120,
    backgroundColor: THEME.primary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoIcon: {
    fontSize: 60,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 10,
  },
  logoTextHighlight: {
    color: THEME.primary,
  },
  tagline: {
    fontSize: 16,
    color: THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingText: {
    color: THEME.textPrimary,
    fontSize: 16,
  },
  buttonContainer: {
    gap: 15,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: THEME.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.textPrimary,
  },
  secondaryButtonText: {
    color: THEME.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
