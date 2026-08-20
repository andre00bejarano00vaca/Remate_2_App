import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { apiBaseUrl } from "../config/env";

const TOKEN_KEY = "expoPushToken";

export function isExpoGo() {
  return (
    Constants.appOwnership === "expo" ||
    Constants.executionEnvironment === "storeClient"
  );
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("outbid", {
    name: "Pujas superadas",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    sound: "default",
  });
}

export async function ensureNotificationPermission() {
  if (!Device.isDevice) return false;

  await ensureAndroidChannel();

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  return status === "granted";
}

export async function registerExpoPushToken(userId, authHeader = {}) {
  if (isExpoGo()) {
    console.log("[PUJA PUSH] Expo Go: sin push remoto, solo avisos locales");
    await ensureNotificationPermission();
    return null;
  }

  const granted = await ensureNotificationPermission();
  if (!granted || !Device.isDevice) return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId;

  if (!projectId) {
    console.log("[PUJA PUSH] sin projectId, solo notificaciones locales");
    return null;
  }

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenResponse?.data;
    if (!token) return null;

    await AsyncStorage.setItem(TOKEN_KEY, token);
    console.log("[PUJA PUSH] token registrado", token);

    if (userId) {
      fetch(`${apiBaseUrl}/api/usuarios/push-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({
          userId: Number(userId),
          token,
          platform: Platform.OS,
        }),
      }).catch(() => {
        console.log("[PUJA PUSH] backend aún no recibe el token (se usan locales)");
      });
    }

    return token;
  } catch (error) {
    console.log("[PUJA PUSH] no se pudo obtener token:", error?.message || error);
    return null;
  }
}

export async function notifyOutbid({
  numeroLote,
  montoActual,
  loteId,
  remateId,
}) {
  const granted = await ensureNotificationPermission();
  if (!granted) return;

  const loteLabel = numeroLote ? `lote ${numeroLote}` : "un lote";
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Te superaron en el remate",
      body: `Alguien pujó sobre tu oferta en el ${loteLabel}. Monto actual: $${Number(
        montoActual || 0
      ).toLocaleString()}`,
      sound: "default",
      ...(Platform.OS === "android" ? { channelId: "outbid" } : {}),
      data: {
        type: "outbid",
        loteId,
        remateId,
        numeroLote,
      },
    },
    trigger: null,
  });

  console.log("[PUJA PUSH] notificación enviada", { loteId, montoActual });
}
