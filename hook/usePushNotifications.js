import { useEffect } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addNotificationListeners,
  setupPushForUser,
} from "../services/pushNotifications";
import { navigate } from "../services/navigationRef";
import { getAuctionById } from "../services/auctionService";

const isRemateFinalizado = (estado) =>
  String(estado ?? "")
    .trim()
    .toLowerCase() === "finalizado";

async function handleNotificationOpen(data = {}) {
  const remateId = data.remateId;
  const loteId = data.loteId;
  const nombreRemate = data.nombreRemate;

  if (!remateId) return;

  try {
    const remate = await getAuctionById(remateId);
    if (isRemateFinalizado(remate?.estado)) {
      const label = String(nombreRemate || remate?.nombre || remate?.name || "")
        .trim();
      Alert.alert(
        "Prelance finalizado",
        label
          ? `El prelance "${label}" ya terminó. No podés entrar a ese lote.`
          : "Este prelance ya terminó. No podés entrar a ese lote.",
        [
          {
            text: "Entendido",
            onPress: () => navigate("RematesList"),
          },
        ]
      );
      return;
    }

    const remateForNav = {
      id: remate?.id ?? remateId,
      nombre: remate?.nombre || remate?.name || nombreRemate,
      name: remate?.name || remate?.nombre || nombreRemate,
      fechaFin: remate?.fechaFin,
      urlListaLotes: remate?.urlListaLotes,
      estado: remate?.estado,
    };

    if (loteId) {
      navigate("LoteDetail", {
        lote: {
          id: loteId,
          remateId,
          numLote: data.numeroLote,
          remate: remateForNav,
        },
        remate: remateForNav,
        remateId,
      });
    } else {
      navigate("LotesList", { remate: remateForNav });
    }
  } catch (error) {
    console.log("[PUSH] open notification:", error?.message || error);
    // Si falla la consulta, no abrimos el lote a ciegas si era outbid/won de un remate
    Alert.alert(
      "No se pudo abrir",
      "No se pudo verificar el estado del prelance. Volvé a la lista de prelances.",
      [{ text: "OK", onPress: () => navigate("RematesList") }]
    );
  }
}

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
        handleNotificationOpen(data);
      },
    });

    return () => {
      cancelled = true;
      remove();
    };
  }, []);
}
