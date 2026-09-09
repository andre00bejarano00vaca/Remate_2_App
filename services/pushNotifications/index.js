import { AppState, Platform, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import apiClient from "../../api/apiClient";

const TOKEN_KEY = "expoPushToken";
const ANDROID_CHANNEL_ID = "pujas";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function getExpoProjectId() {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    null
  );
}

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: "Pujas del prelance",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#C9A227",
  });
}

/**
 * Pide permisos y obtiene el Expo Push Token (Android con FCM/EAS).
 * iOS queda pendiente (APNs).
 */
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "ios") {
    console.log("[PUSH] iOS pendiente (APNs no configurado)");
    return null;
  }

  if (!Device.isDevice) {
    console.log("[PUSH] Se necesita un dispositivo físico");
    return null;
  }

  await ensureAndroidChannel();

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    console.log("[PUSH] Permiso denegado");
    return null;
  }

  const projectId = getExpoProjectId();
  if (!projectId) {
    console.log("[PUSH] Falta extra.eas.projectId en app.json");
    return null;
  }

  const push = await Notifications.getExpoPushTokenAsync({ projectId });
  const token = push?.data ?? null;
  if (!token) return null;

  await AsyncStorage.setItem(TOKEN_KEY, token);
  console.log("[PUSH] Expo token:", token);
  return token;
}

export async function getStoredPushToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

/**
 * Intenta registrar el token en el backend.
 * Si el endpoint aún no existe, solo queda guardado en el dispositivo.
 */
export async function syncPushTokenWithBackend(userId) {
  const token = (await getStoredPushToken()) || (await registerForPushNotificationsAsync());
  if (!token || userId == null) return null;

  const payload = {
    pushToken: token,
    expoPushToken: token,
    plataforma: Platform.OS,
    deviceType: Platform.OS,
  };

  const attempts = [
    () => apiClient.post(`/usuarios/${userId}/push-token`, payload),
    () => apiClient.put(`/usuarios/${userId}/push-token`, payload),
    () => apiClient.post(`/usuarios/push-token`, { ...payload, userId: Number(userId) }),
  ];

  for (const attempt of attempts) {
    try {
      await attempt();
      console.log("[PUSH] Token sincronizado con backend");
      return token;
    } catch (error) {
      const status = error?.response?.status;
      if (status && status !== 404 && status !== 405) {
        console.log("[PUSH] sync backend:", status, error?.message);
      }
    }
  }

  console.log(
    "[PUSH] Backend sin endpoint de token (ok). Token local listo para prueba en expo.dev/notifications"
  );
  return token;
}

/** Login / sesión restaurada: permiso + token + intento de sync. */
export async function setupPushForUser(userId) {
  try {
    const token = await registerForPushNotificationsAsync();
    if (!token) return null;
    if (userId != null) {
      await syncPushTokenWithBackend(userId);
    }
    return token;
  } catch (error) {
    console.log("[PUSH] setup error:", error?.message || error);
    return null;
  }
}

export async function presentLocalNotification({ title, body, data }) {
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data ?? {},
      sound: true,
    },
    trigger: null,
  });
}

/** Alert si la app está activa; notificación del sistema si está en background. */
export async function notifyUser({ title, body, data, forceAlert }) {
  const active = AppState.currentState === "active";

  if (forceAlert || active) {
    Alert.alert(title, body);
    return;
  }

  try {
    await presentLocalNotification({ title, body, data });
  } catch (error) {
    console.log("[PUSH] local notify fallback alert:", error?.message || error);
    Alert.alert(title, body);
  }
}

export function addNotificationListeners({ onReceive, onResponse } = {}) {
  const received = Notifications.addNotificationReceivedListener((notification) => {
    onReceive?.(notification);
  });

  const response = Notifications.addNotificationResponseReceivedListener((res) => {
    onResponse?.(res);
  });

  return () => {
    received.remove();
    response.remove();
  };
}
