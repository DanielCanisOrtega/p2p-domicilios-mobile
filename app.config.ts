import type { ExpoConfig } from "expo/config";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_API_URL?.trim() ||
  "https://p2p-domicilios-backend-1.onrender.com";
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY?.trim();

const config: ExpoConfig = {
  name: "p2p-domicilios-mobile",
  slug: "p2p-domicilios-mobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "p2pdomiciliosmobile",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
  },
  android: {
    package: "com.p2pdomicilios.mobile",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: [
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_FINE_LOCATION",
    ],
    config: GOOGLE_MAPS_API_KEY
      ? {
          googleMaps: {
            apiKey: GOOGLE_MAPS_API_KEY,
          },
        }
      : undefined,
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "Permite acceder a tu ubicacion para mostrar domiciliarios cercanos en tiempo real.",
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {},
    backendUrl: BACKEND_URL,
    eas: {
      projectId: "909fdc8f-7982-4a90-b291-b5ee22e6a89f",
    },
  },
};

export default config;