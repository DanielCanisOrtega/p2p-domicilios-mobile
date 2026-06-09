import { Redirect, Tabs } from 'expo-router';
import { useContext } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../src/context/AuthContext';

export default function AdminLayout() {
  const { user, isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopColor: '#333333',
          height: 65,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#00D69A',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="usuarios"
        options={{
          title: 'USUARIOS',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="verificacion"
        options={{
          title: 'VERIFICACION',
          tabBarIcon: ({ color, size }) => <Ionicons name="shield-checkmark" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'PERFIL',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
