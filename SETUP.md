# Setup - P2P Domicilios Mobile

## Requisitos Previos

- Node.js 16 o superior
- npm o yarn
- Expo CLI
- Android Studio (para emulador Android) o Xcode (para iOS)

## Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Este proyecto toma la URL del backend y la API key de Google Maps desde variables de entorno.

**Variables requeridas para APK Android release:**

```bash
EXPO_PUBLIC_API_URL=https://TU_BACKEND_PUBLICO
GOOGLE_MAPS_API_KEY=TU_API_KEY_ANDROID
```

**Para desarrollo local puedes usar:**

```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
```

> Nota: `GOOGLE_MAPS_API_KEY` es clave sensible. Para builds en EAS no la pongas en archivos versionados; usa `eas secret`.

### 3. Asegurarse que el backend esté corriendo

```bash
# En el directorio del backend
cd C:\Prueba\p2p-domicilios-backend
./mvnw spring-boot:run
```

El backend debe estar corriendo en `http://localhost:8080`

## Ejecutar la App

### Iniciar Expo

```bash
npm start
```

### Opciones de Ejecución

#### Android
```bash
npm run android
```

#### iOS (solo Mac)
```bash
npm run ios
```

#### Web
```bash
npm run web
```

### Usar Expo Go en Dispositivo Físico

1. Instala "Expo Go" desde Play Store (Android) o App Store (iOS)
2. Ejecuta `npm start`
3. Escanea el QR code con:
   - Android: Expo Go app
   - iOS: Cámara nativa

**Importante**: Tu dispositivo y computadora deben estar en la misma red WiFi.

## Verificar Conexión con Backend

### Test 1: Verificar que el backend responde

```bash
curl http://localhost:8080/drivers/nearby?lat=4.6097&lon=-74.0817
```

Deberías recibir una respuesta JSON (puede estar vacía `[]` si no hay drivers).

### Test 2: Registrar un usuario de prueba

```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testclient",
    "password": "password123",
    "email": "test@example.com",
    "role": "CLIENT",
    "nombre": "Test User"
  }'
```

Deberías recibir un token JWT en la respuesta.

## Troubleshooting

### Error: "Network request failed"

**Causa**: La app no puede conectarse al backend.

**Soluciones**:
1. Verifica que el backend esté corriendo
2. Verifica la `baseURL` en `src/services/api.js`
3. Si usas dispositivo físico, verifica que estén en la misma red WiFi
4. Desactiva firewall o agrega excepción para puerto 8080

### Error: "Unable to resolve module @react-native-async-storage/async-storage"

**Solución**:
```bash
npm install @react-native-async-storage/async-storage
```

### Error en Android Emulator: "Connection refused"

**Causa**: `localhost` no funciona en Android emulator.

**Solución**: Usa `10.0.2.2` en lugar de `localhost`:
```javascript
baseURL: "http://10.0.2.2:8080"
```

### Error: "Invariant Violation: TurboModuleRegistry.getEnforcing(...)"

**Solución**: Limpia cache y reinstala:
```bash
npm start -- --clear
# o
expo start -c
```

## Estructura del Proyecto

```
p2p-domicilios-mobile/
├── src/
│   ├── context/          # Contextos de React (Auth)
│   ├── navigation/       # Navegación y rutas
│   ├── screens/          # Pantallas de la app
│   ├── services/         # API calls y lógica de negocio
│   └── components/       # Componentes reutilizables
├── assets/               # Imágenes, fuentes, etc.
├── app/                  # Expo Router (alternativo)
├── package.json
└── app.json              # Configuración de Expo
```

## Scripts Disponibles

```bash
npm start          # Inicia Expo Dev Server
npm run android    # Ejecuta en Android
npm run ios        # Ejecuta en iOS
npm run web        # Ejecuta en navegador
npm run lint       # Ejecuta ESLint
```

## Build APK con EAS

1. Iniciar sesión:

```bash
eas login
```

2. Cargar secretos para build remoto:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "https://TU_BACKEND_PUBLICO"
eas secret:create --scope project --name GOOGLE_MAPS_API_KEY --value "TU_API_KEY_ANDROID"
```

3. Generar APK:

```bash
eas build -p android --profile preview
```

4. Descargar e instalar la APK desde el enlace que entrega EAS.

## Próximos Pasos

Una vez que la app esté corriendo:

1. Registra un usuario desde la app
2. Inicia sesión
3. Verifica que seas redirigido según tu rol (CLIENT o DOMICILIARIO)
4. Cierra y vuelve a abrir la app para verificar persistencia de sesión

## Recursos

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
