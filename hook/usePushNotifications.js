import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addNotificationListeners,
  setupPushForUser,
} from "../services/pushNotifications";
import { navigate } from "../services/navigationRef";

/**
 * Registra push al montar (si hay sesión) y escucha taps en notificaciones.
 */
export default function usePushNotifications() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const loggedIn = await AsyncStorage.getItem("isLoggedIn");
        if (loggedIn !== "true" || cancelled) return;
        const userId = await AsyncStorage.getItem("userId");
        await setupPushForUser(userId);
      } catch (error) {
        console.log("[PUSH] init:", error?.message || error);
      }
    })();

    const remove = addNotificationListeners({
      onResponse: (response) => {
        const data = response?.notification?.request?.content?.data ?? {};
        const remateId = data.remateId;
        const loteId = data.loteId;
        if (remateId && loteId) {
          navigate("LoteDetail", {
            lote: { id: loteId, remateId, remate: { id: remateId } },
            remateId,
          });
        } else if (remateId) {
          navigate("LotesList", { remate: { id: remateId } });
        }
      },
    });

    return () => {
      cancelled = true;
      remove();
    };
  }, []);
}
