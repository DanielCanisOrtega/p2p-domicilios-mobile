import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { adminService, type AccountAction, type AdminUser, type UserRole } from '../../src/services/adminService';

const ROLE_OPTIONS: (UserRole | 'ALL')[] = ['ALL', 'CLIENT', 'DOMICILIARIO', 'ADMIN'];
const ENABLED_OPTIONS: ('ALL' | 'true' | 'false')[] = ['ALL', 'true', 'false'];
const ACTIONS: AccountAction[] = ['ACTIVAR', 'DESACTIVAR', 'SUSPENDER'];

const formatDate = (value?: string) => {
  if (!value) return 'Sin fecha';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [enabledFilter, setEnabledFilter] = useState<'ALL' | 'true' | 'false'>('ALL');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [processingUserId, setProcessingUserId] = useState<number | null>(null);

  const loadUsers = useCallback(
    async (manual = false) => {
      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const data = await adminService.getUsers({
          q: search.trim() || undefined,
          role: roleFilter === 'ALL' ? undefined : roleFilter,
          estado: estadoFilter.trim() || undefined,
          enabled:
            enabledFilter === 'ALL'
              ? undefined
              : enabledFilter === 'true',
        });
        setUsers(data);
        setError(null);
      } catch (err: any) {
        setError(err?.message || 'No se pudo cargar usuarios');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [enabledFilter, estadoFilter, roleFilter, search]
  );

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const onAction = async (userId: number, action: AccountAction) => {
    setProcessingUserId(userId);
    try {
      const updated = await adminService.updateAccountStatus(userId, action);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      Alert.alert('Actualizado', `Cuenta actualizada con accion ${action}`);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo actualizar la cuenta');
    } finally {
      setProcessingUserId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadUsers(true)} />}
      >
        <Text style={styles.title}>Gestion de usuarios</Text>
        <Text style={styles.subtitle}>Listado, filtros y estado de cuenta</Text>

        <View style={styles.filterCard}>
          <TextInput
            style={styles.input}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por username, email o nombre"
            placeholderTextColor="#8d95a4"
          />
          <TextInput
            style={styles.input}
            value={estadoFilter}
            onChangeText={setEstadoFilter}
            placeholder="Estado (ej: ACTIVO, SUSPENDIDO)"
            placeholderTextColor="#8d95a4"
          />

          <Text style={styles.filterLabel}>Rol</Text>
          <View style={styles.pillRow}>
            {ROLE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.pill, roleFilter === option && styles.pillActive]}
                onPress={() => setRoleFilter(option)}
              >
                <Text style={[styles.pillText, roleFilter === option && styles.pillTextActive]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterLabel}>Enabled</Text>
          <View style={styles.pillRow}>
            {ENABLED_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.pill, enabledFilter === option && styles.pillActive]}
                onPress={() => setEnabledFilter(option)}
              >
                <Text style={[styles.pillText, enabledFilter === option && styles.pillTextActive]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.searchBtn} onPress={() => void loadUsers(true)}>
            <Text style={styles.searchBtnText}>Aplicar filtros</Text>
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#17d5aa" />
            <Text style={styles.loadingText}>Cargando usuarios...</Text>
          </View>
        ) : users.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No hay usuarios para los filtros aplicados.</Text>
          </View>
        ) : (
          users.map((user) => {
            const isBusy = processingUserId === user.id;
            return (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <Text style={styles.userName}>{user.nombre || user.username}</Text>
                  <Text style={styles.userRole}>{user.role}</Text>
                </View>
                <Text style={styles.userMeta}>@{user.username}</Text>
                <Text style={styles.userMeta}>{user.email}</Text>
                <Text style={styles.userMeta}>Estado: {user.estado || 'N/A'}</Text>
                <Text style={styles.userMeta}>Enabled: {user.enabled ? 'true' : 'false'}</Text>
                <Text style={styles.userMeta}>Registro: {formatDate(user.fechaRegistro)}</Text>

                <View style={styles.actionRow}>
                  {ACTIONS.map((action) => (
                    <TouchableOpacity
                      key={action}
                      style={[styles.actionBtn, action === 'SUSPENDER' && styles.actionWarn]}
                      onPress={() => void onAction(user.id, action)}
                      disabled={isBusy}
                    >
                      <Text style={styles.actionBtnText}>{action}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {isBusy && (
                  <View style={styles.processingRow}>
                    <ActivityIndicator size="small" color="#17d5aa" />
                    <Text style={styles.processingText}>Aplicando cambio...</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1c' },
  content: { padding: 18, paddingBottom: 28 },
  title: { color: '#fff', fontSize: 28, fontWeight: '700' },
  subtitle: { color: '#8d95a4', fontSize: 12, marginTop: 4, marginBottom: 14 },
  filterCard: {
    backgroundColor: '#111720',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3040',
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  input: {
    backgroundColor: '#0a0f1c',
    borderWidth: 1,
    borderColor: '#2a3040',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
  },
  filterLabel: { color: '#c6cedd', fontWeight: '600', fontSize: 12, marginTop: 4 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    borderWidth: 1,
    borderColor: '#2a3040',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillActive: { borderColor: '#17d5aa', backgroundColor: '#0f2a22' },
  pillText: { color: '#8d95a4', fontSize: 11, fontWeight: '600' },
  pillTextActive: { color: '#17d5aa' },
  searchBtn: {
    backgroundColor: '#17d5aa',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 11,
    marginTop: 6,
  },
  searchBtnText: { color: '#0a0f1c', fontWeight: '700' },
  errorText: {
    color: '#f0b4b4',
    backgroundColor: '#241113',
    borderWidth: 1,
    borderColor: '#5b262b',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  loadingBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 8 },
  loadingText: { color: '#8d95a4' },
  emptyBox: {
    backgroundColor: '#111720',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3040',
    padding: 16,
  },
  emptyText: { color: '#8d95a4' },
  userCard: {
    backgroundColor: '#111720',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3040',
    padding: 12,
    marginBottom: 10,
  },
  userHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  userName: { color: '#fff', fontSize: 16, fontWeight: '700', flexShrink: 1, paddingRight: 8 },
  userRole: { color: '#17d5aa', fontSize: 11, fontWeight: '700' },
  userMeta: { color: '#8d95a4', fontSize: 12, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#17d5aa',
    backgroundColor: '#0f2a22',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionWarn: { borderColor: '#f4b400', backgroundColor: '#2d240f' },
  actionBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  processingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  processingText: { color: '#8d95a4', fontSize: 12 },
});
