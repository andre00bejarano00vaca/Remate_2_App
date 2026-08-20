import { useEffect } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiBaseUrl } from "../config/env";
import {
  getCurrentViewedLote,
  getWatchedPujas,
  markNotifiedOutbid,
  markPujaOutbid,
} from "../services/pujaPersistence";
import { ensureNotificationPermission, notifyOutbid } from "../services/outbidNotifications";

const POLL_MS = 6000;

export default function useOutbidWatcher() {
  useEffect(() => {
    let stopped = false;
    let timer = null;

    const tick = async () => {
      if (stopped) return;

      try {
        const loggedIn = await AsyncStorage.getItem("isLoggedIn");
        if (loggedIn !== "true") return;

        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return;

        const watched = await getWatchedPujas(userId);
        const pending = watched.filter(
          (item) => item.status !== "outbid" || !item.notifiedOutbid
        );
        if (!pending.length) return;

        const appActive = AppState.currentState === "active";
        const currentLote = getCurrentViewedLote();

        await Promise.all(
          pending.map(async (item) => {
            if (!item.remateId || !item.loteId) return;

            const response = await fetch(
              `${apiBaseUrl}/contador/${item.remateId}/${item.loteId}`
            );
            if (!response.ok) return;

            const valor = Number(await response.json());
            if (Number.isNaN(valor) || valor <= Number(item.monto)) return;

            await markPujaOutbid({
              userId,
              loteId: item.loteId,
              currentMonto: valor,
            });

            const watchingThisLote =
              appActive && String(currentLote) === String(item.loteId);
            if (watchingThisLote || item.notifiedOutbid) return;

            await notifyOutbid({
              numeroLote: item.numeroLote,
              montoActual: valor,
              loteId: item.loteId,
              remateId: item.remateId,
            });
            await markNotifiedOutbid(userId, item.loteId);
          })
        );
      } catch (error) {
        console.log("[PUJA PUSH] watcher error:", error?.message || error);
      }
    };

    const start = () => {
      ensureNotificationPermission();
      tick();
      clearInterval(timer);
      timer = setInterval(tick, POLL_MS);
    };

    start();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") tick();
    });

    return () => {
      stopped = true;
      clearInterval(timer);
      subscription.remove();
    };
  }, []);
}
