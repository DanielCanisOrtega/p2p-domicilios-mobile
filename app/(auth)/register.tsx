import { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../src/context/AuthContext';
import { THEME } from '../../src/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useContext(AuthContext);

  const [role, setRole] = useState<'CLIENT' | 'DOMICILIARIO'>('CLIENT');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validaciones
    if (!nombre.trim() || !apellido.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const username = `${nombre.toLowerCase()}_${Date.now()}`;
      await register({
        username,
        password,
        email,
        role,
        nombre: `${nombre} ${apellido}`,
        telefono,
      });
      // La navegación se maneja en index.tsx
    } catch (error: any) {
      Alert.alert('Error de Registro', error.error || 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>

        {/* Título */}
        <Text style={styles.title}>Crea tu cuenta</Text>
        <Text style={styles.subtitle}>Elige tu rol para continuar</Text>

        {/* Toggle Cliente/Domiciliario */}
        <View style={styles.roleToggle}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'CLIENT' && styles.roleButtonActive]}
            onPress={() => setRole('CLIENT')}
          >
            <Text style={[styles.roleIcon, role === 'CLIENT' && styles.roleIconActive]}>
              🛍️
            </Text>
            <Text style={[styles.roleText, role === 'CLIENT' && styles.roleTextActive]}>
              Cliente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleButton, role === 'DOMICILIARIO' && styles.roleButtonActive]}
            onPress={() => setRole('DOMICILIARIO')}
          >
            <Text style={[styles.roleIcon, role === 'DOMICILIARIO' && styles.roleIconActive]}>
              🛵
            </Text>
            <Text style={[styles.roleText, role === 'DOMICILIARIO' && styles.roleTextActive]}>
              Domiciliario
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>NOMBRE</Text>
              <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="María"
                placeholderTextColor={THEME.textSecondary}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>APELLIDO</Text>
              <TextInput
                style={styles.input}
                value={apellido}
                onChangeText={setApellido}
                placeholder="Pérez"
                placeholderTextColor={THEME.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="maria@correo.com"
              placeholderTextColor={THEME.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>CONTRASEÑA</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={THEME.textSecondary}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>CONFIRMAR</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor={THEME.textSecondary}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>TELÉFONO</Text>
            <TextInput
              style={styles.input}
              value={telefono}
              onChangeText={setTelefono}
              placeholder="+57 312 000 0000"
              placeholderTextColor={THEME.textSecondary}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Términos */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            Al registrarte aceptas nuestros{' '}
            <Text style={styles.termsLink}>Términos de servicio</Text> y{' '}
            <Text style={styles.termsLink}>Política de privacidad</Text>
          </Text>
        </View>

        {/* Botón de registro */}
        <TouchableOpacity
          style={[styles.registerButton, loading && styles.registerButtonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.registerButtonText}>Registrarme</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.textSecondary,
    marginBottom: 30,
  },
  roleToggle: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.card,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleButtonActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  roleIcon: {
    fontSize: 20,
  },
  roleIconActive: {
    fontSize: 20,
  },
  roleText: {
    color: THEME.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  roleTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  form: {
    gap: 20,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.textSecondary,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: THEME.card,
    color: THEME.textPrimary,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  termsContainer: {
    marginBottom: 30,
  },
  termsText: {
    color: THEME.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: THEME.primary,
  },
  registerButton: {
    backgroundColor: THEME.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
