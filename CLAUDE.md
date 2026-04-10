# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

P2P Domicilios is an Expo React Native mobile app for a peer-to-peer delivery service. The app serves two user types:
- **CLIENT**: Customers requesting delivery services
- **DOMICILIARIO**: Delivery drivers fulfilling orders

**Tech Stack**: Expo 54, React 19, React Native 0.81, Expo Router, Axios, AsyncStorage, react-native-maps

**Backend**: Spring Boot API running at `http://localhost:8080`

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Platform-specific launches
npm run android    # Android emulator or device
npm run ios        # iOS simulator (Mac only)
npm run web        # Web browser

# Linting
npm run lint

# Clear cache (if experiencing module issues)
npm start -- --clear
```

## Architecture

### Navigation System

The app uses **Expo Router** (file-based routing) located in the `app/` directory:

```
app/
├── index.tsx                    # Welcome screen with role-based redirect
├── _layout.tsx                  # Root layout with AuthProvider
├── (auth)/                      # Auth group (login/register)
├── (cliente)/                   # Client screens (mapa, pedidos, mensajes, perfil)
└── (domiciliario)/              # Driver screens (mapa, pedidos, mensajes, perfil)
```

**Routing logic**: 
- Unauthenticated users → `/(auth)/login` or `/(auth)/register`
- Authenticated CLIENT → `/(cliente)/mapa`
- Authenticated DOMICILIARIO → `/(domiciliario)/mapa`

### Authentication Flow

1. **Context**: `src/context/AuthContext.js` provides global auth state (`user`, `isAuthenticated`, `login`, `register`, `logout`)
2. **Service**: `src/services/authService.js` handles API calls and AsyncStorage persistence
3. **Token Management**: 
   - JWT tokens stored in AsyncStorage with key `@p2p_token`
   - User data stored with key `@p2p_user`
   - Auto-injected into all API requests via Axios interceptor
   - 401 responses trigger automatic logout and storage cleanup

**Session Persistence**: On app launch, `AuthContext` checks AsyncStorage for existing token/user and auto-authenticates if valid.

### API Configuration

**File**: `src/services/api.js`

The `baseURL` is auto-detected based on platform:
- **Web**: `http://localhost:8080`
- **Mobile**: Detects device IP from Expo's `hostUri` (e.g., `http://192.168.1.100:8080`)
- **Fallback**: `http://localhost:8080`

**Axios Interceptors**:
- **Request**: Automatically adds `Authorization: Bearer <token>` header
- **Response**: Clears storage on 401 errors

### Platform-Specific Implementations

The app uses conditional imports for platform differences:

```
src/components/
├── MapView.native.tsx    # Uses react-native-maps for iOS/Android
└── MapView.web.tsx       # Uses web-compatible map implementation
```

When adding new platform-specific features, follow this `.native.tsx` / `.web.tsx` naming convention.

### Key Services

- **authService** (`src/services/authService.js`): Register, login, logout, token/user retrieval
- **orderService** (`src/services/orderService.js`): Order management
- **userService** (`src/services/userService.js`): User data operations
- **api** (`src/services/api.js`): Configured Axios instance with interceptors

All service calls use the shared `api` instance, so JWT tokens are automatically included.

## Backend Connection

The backend must be running before starting the mobile app:

```bash
cd C:\Prueba\p2p-domicilios-backend
./mvnw spring-boot:run
```

**Key endpoints**:
- `POST /auth/register` - Register new user (returns JWT token + user)
- `POST /auth/login` - Login (returns JWT token + user)
- `GET /drivers/nearby?lat=X&lon=Y` - Find nearby drivers

## Common Development Patterns

### Accessing Auth Context

```javascript
import { useContext } from 'react';
import { AuthContext } from '../src/context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  // user: { username, email, role, userId, token }
}
```

### Making Authenticated API Calls

```javascript
import { api } from '../src/services/api';

// Token is automatically injected by interceptor
const response = await api.post('/orders/create', orderData);
```

### Role-Based Conditional Rendering

```javascript
const { user } = useContext(AuthContext);

if (user.role === 'CLIENT') {
  // Show client-specific UI
} else if (user.role === 'DOMICILIARIO') {
  // Show driver-specific UI
}
```

## Testing

### Manual Testing Flow

1. **Register**: Create account via `/(auth)/register` (select CLIENT or DOMICILIARIO role)
2. **Verify Redirect**: Should navigate to role-specific home screen
3. **Close/Reopen App**: Session should persist (auto-login)
4. **Logout**: Clears AsyncStorage and redirects to login

### Backend Testing

```bash
# Test backend connectivity
curl http://localhost:8080/drivers/nearby?lat=4.6097&lon=-74.0817

# Test registration
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testclient","password":"password123","email":"test@example.com","role":"CLIENT","nombre":"Test User"}'
```

## Troubleshooting

### "Network request failed"
- Verify backend is running on port 8080
- Check device and computer are on same WiFi network (for physical devices)
- For Android emulator, backend should be accessible at `10.0.2.2:8080` (auto-handled)

### Module Resolution Errors
Clear Expo cache: `npm start -- --clear`

### AsyncStorage Issues
Ensure `@react-native-async-storage/async-storage` version matches Expo SDK (currently 2.2.0 for Expo 54)

## File Structure Reference

```
p2p-domicilios-mobile/
├── app/                      # Expo Router screens (TypeScript)
├── src/
│   ├── components/          # Reusable UI components (platform-specific variants)
│   ├── context/             # React contexts (AuthContext)
│   ├── hooks/               # Custom hooks (useLocation)
│   ├── navigation/          # Legacy React Navigation setup (AppNavigator.js)
│   ├── screens/             # Legacy screens (being migrated to app/)
│   └── services/            # API clients and business logic
├── assets/                  # Images, fonts, icons
├── SETUP.md                 # Detailed setup instructions
└── AUTH_README.md           # Authentication implementation details
```

## Important Notes

- **Dual Navigation Systems**: The codebase contains both React Navigation (`src/navigation/`) and Expo Router (`app/`). Expo Router is the primary system; legacy files in `src/navigation/` and `src/screens/` are being phased out.
- **TypeScript Migration**: The `app/` directory uses TypeScript (`.tsx`), while `src/` is mostly JavaScript (`.js`). When creating new files in `app/`, use TypeScript.
- **Role Field**: The `role` field in user objects must be exactly `"CLIENT"` or `"DOMICILIARIO"` (uppercase) to match backend enums.
- **Token Expiration**: There is currently no refresh token mechanism. Users must re-login when JWT expires (handled automatically by 401 interceptor).
