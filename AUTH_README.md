# Módulo de Autenticación - P2P Domicilios Mobile

## Implementación Completada ✅

### Características

- ✅ Pantalla de Login con validación
- ✅ Pantalla de Registro con selección de rol (Cliente/Domiciliario)
- ✅ Manejo de tokens JWT con AsyncStorage
- ✅ Persistencia de sesión (mantiene login al reiniciar app)
- ✅ Redirección automática según rol:
  - **CLIENT** → ClientHomeScreen
  - **DOMICILIARIO** → DomiciliarioHomeScreen
- ✅ Interceptor Axios que agrega token automáticamente
- ✅ Manejo de errores 401 (logout automático si token expira)
- ✅ Navegación condicional (AuthStack vs ClientStack vs DomiciliarioStack)

## Estructura de Archivos

```
src/
├── context/
│   └── AuthContext.js          # Contexto global de autenticación
├── services/
│   ├── api.js                  # Axios config + interceptores JWT
│   └── authService.js          # Login, register, logout, token storage
├── screens/
│   ├── LoginScreen.js          # Pantalla de login
│   ├── RegisterScreen.js       # Pantalla de registro
│   ├── ClientHomeScreen.js     # Home para clientes
│   └── DomiciliarioHomeScreen.js # Home para domiciliarios
└── navigation/
    └── AppNavigator.js         # Navegación con redirección por rol
```

## Configuración del Backend

### API Base URL

Edita `src/services/api.js` según tu entorno:

```javascript
// Android Emulator
baseURL: "http://10.0.2.2:8080"

// iOS Simulator
baseURL: "http://localhost:8080"

// Dispositivo físico (reemplaza con tu IP local)
baseURL: "http://192.168.1.100:8080"
```

## Flujo de Autenticación

### 1. Registro
```
RegisterScreen → authService.register() → Backend /auth/register
  → AsyncStorage guarda token + user → AuthContext actualiza estado
  → AppNavigator redirige según role
```

### 2. Login
```
LoginScreen → authService.login() → Backend /auth/login
  → AsyncStorage guarda token + user → AuthContext actualiza estado
  → AppNavigator redirige según role
```

### 3. Auto-Login
```
App inicia → AuthContext.checkAuthStatus()
  → Lee AsyncStorage → Si hay token válido → Redirige a Home según role
```

### 4. Logout
```
User click logout → authService.logout()
  → Borra AsyncStorage → AuthContext limpia estado
  → AppNavigator redirige a AuthStack (Login/Register)
```

## Uso del AuthContext

```javascript
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useContext(AuthContext);

  // user contiene: { username, email, role, userId, token }
  // isAuthenticated: boolean
  // login(username, password): Promise
  // logout(): Promise
}
```

## Requests Autenticados

Todos los requests HTTP incluyen automáticamente el token JWT:

```javascript
import { api } from "../services/api";

// El token se agrega automáticamente en el header
const response = await api.post("/api/orders/create", orderData);
```

## Testing

### Registro de Usuario Cliente
1. Abre la app
2. Click en "Regístrate"
3. Completa el formulario
4. Selecciona "Cliente"
5. Click "Registrarse"
6. Deberías ser redirigido a ClientHomeScreen

### Registro de Domiciliario
1. Repite pasos anteriores
2. Selecciona "Domiciliario" en lugar de Cliente
3. Deberías ser redirigido a DomiciliarioHomeScreen

### Persistencia de Sesión
1. Haz login
2. Cierra completamente la app
3. Vuelve a abrir la app
4. Deberías seguir logueado

## Datos de Prueba

Puedes usar estos datos para testing (después de registrarte):

```
Usuario: testclient
Password: password123
Role: CLIENT

Usuario: testdriver
Password: password123
Role: DOMICILIARIO
```

## Componentes Creados

### AuthContext
- Maneja estado global de autenticación
- Provee funciones: `login`, `register`, `logout`
- Verifica sesión guardada al inicio

### authService
- `register(userData)`: Registra usuario
- `login(username, password)`: Inicia sesión
- `logout()`: Cierra sesión y limpia storage
- `getToken()`: Obtiene token guardado
- `getUser()`: Obtiene usuario guardado
- `isAuthenticated()`: Verifica si hay sesión activa

### Screens
- **LoginScreen**: Login con validación
- **RegisterScreen**: Registro con selección de rol
- **ClientHomeScreen**: Dashboard para clientes
- **DomiciliarioHomeScreen**: Dashboard para domiciliarios

## Próximos Pasos

- [ ] Implementar refresh token
- [ ] Agregar biometría (Face ID / Touch ID)
- [ ] Recuperación de contraseña
- [ ] Edición de perfil
- [ ] Validación de email
