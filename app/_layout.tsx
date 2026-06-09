import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(cliente)" />
        <Stack.Screen name="(domiciliario)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="reportar-incidencia" />
      </Stack>
    </AuthProvider>
  );
}
