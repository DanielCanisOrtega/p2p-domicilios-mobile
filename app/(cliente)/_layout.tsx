import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { THEME } from '../../src/constants/theme';

export default function ClienteLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: THEME.tabBar,
          borderTopColor: '#333',
          height: 65,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: THEME.primary,
        tabBarInactiveTintColor: THEME.inactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'MAPA',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pedidos"
        options={{
          title: 'PEDIDOS',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mensajes"
        options={{
          title: 'MENSAJES',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'PERFIL',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="confirmar-pedido"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="seguimiento"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
