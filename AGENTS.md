# AGENTS.md

## High-signal repo facts

- This is a single Expo app (`expo-router/entry`) with file-based routes in `app/`; there is no monorepo/workspace tooling.
- Source of truth is TypeScript files in `app/` and `src/` (`src/context/AuthContext.tsx`, `src/services/*.ts`). Some markdown docs still mention old `.js` paths.
- Auth routing is centralized in `app/index.tsx`: after login/register, screens do not navigate directly; they rely on index redirect by `user.role`.
- Role values must stay exact uppercase enums: `CLIENT` or `DOMICILIARIO`.

## Commands that actually work here

- Install deps: `npm install`
- Start dev server: `npm start`
- Platform launch: `npm run android`, `npm run ios`, `npm run web`
- Lint (only automated check configured): `npm run lint`
- Clear Expo cache when runtime/module state is weird: `npm start -- --clear`
- Do not use `npm run reset-project` unless you add `scripts/reset-project.js` first (script exists in `package.json`, file is missing in repo).

## Backend and env gotchas

- Backend clients (`src/services/api.ts` and `src/services/websocketService.ts`) resolve URL in this order:
  1) `EXPO_PUBLIC_API_URL`, 2) `expoConfig.extra.backendUrl`, 3) `http://localhost:8080`.
- `app.config.ts` currently hardcodes `extra.backendUrl` to localhost; for device or remote backend testing, set `EXPO_PUBLIC_API_URL` explicitly.
- Android Maps key is read from `GOOGLE_MAPS_API_KEY` in `app.config.ts`; `.env.example` documents required env vars.
- HTTP uses Axios + AsyncStorage token interceptor; WebSocket uses SockJS/STOMP at `"<baseUrl>/ws"` with bearer token from storage.

## Architecture map for edits

- Root provider stack: `app/_layout.tsx` wraps everything in `AuthProvider`.
- Role tab shells: `app/(cliente)/_layout.tsx` and `app/(domiciliario)/_layout.tsx`.
- Client hidden routes (not tab buttons) are declared with `href: null`: `confirmar-pedido`, `seguimiento`, `perfil-domiciliario`.
- API/service layer lives in `src/services/`:
  - `authService.ts` auth + persistence
  - `orderService.ts` order endpoints + payload normalization
  - `driverService.ts` nearby/active/tracking driver endpoints
  - `chatService.ts` REST chat bootstrap/history
  - `websocketService.ts` realtime chat/tracking subscriptions
- Cross-platform map wrapper is in `src/components/map/` with platform-specific `index.native.ts` and `index.web.ts`.

## Verification expectations

- There is no test script or CI workflow in this repo right now; minimum safe verification after code changes is `npm run lint` plus a focused manual flow in Expo.
- For auth/order changes, manually smoke-test: register/login -> role redirect -> create or view order in relevant role tab.
