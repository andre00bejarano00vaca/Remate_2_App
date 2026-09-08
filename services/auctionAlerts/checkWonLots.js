import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiBaseUrl } from "../../config/env";
import { parseContadorResponse } from "../../hook/usePujaWebSocket";
import {
  getWatchedPujas,
  markNotifiedWon,
  markPujaWon,
} from "../pujaPersistence";
import { notifyWonLot } from "./index";

/**
 * Al cerrar el prelance: si seguís liderando un lote watched, marca victoria.
 * Por defecto no muestra Alert (procesarEvento lo resume en un solo diálogo).
 * @returns {Promise<{ won: number, winners: object[] }>}
 */
export async function checkWonLotsForRemate(remateId, { notify = false } = {}) {
  if (remateId == null) return { won: 0, winners: [] };

  const userId = await AsyncStorage.getItem("userId");
  if (!userId) return { won: 0, winners: [] };

  const watched = await getWatchedPujas(userId);
  const candidates = watched.filter(
    (item) =>
      Number(item.remateId) === Number(remateId) &&
      item.status === "winning" &&
      !item.notifiedWon
  );

  if (!candidates.length) return { won: 0, winners: [] };

  const winners = [];

  await Promise.all(
    candidates.map(async (item) => {
      if (!item.loteId) return;

      try {
        const response = await fetch(
          `${apiBaseUrl}/contador/${item.remateId}/${item.loteId}`
        );
        if (!response.ok) return;

        const estado = parseContadorResponse(await response.json());
        if (!estado) return;

        const { valor, usuarioIdLider, hasLiderField } = estado;
        let soyGanador = false;

        if (hasLiderField && usuarioIdLider != null) {
          soyGanador = Number(usuarioIdLider) === Number(userId);
        } else {
          soyGanador =
            !Number.isNaN(valor) && Number(valor) <= Number(item.monto);
        }

        if (!soyGanador) return;

        await markPujaWon({
          userId,
          loteId: item.loteId,
          montoFinal: valor ?? item.monto,
        });
        winners.push({
          ...item,
          montoFinal: valor ?? item.monto,
        });
      } catch (error) {
        console.log("[WON] check error:", error?.message || error);
      }
    })
  );

  if (!winners.length) return { won: 0, winners: [] };

  await Promise.all(winners.map((w) => markNotifiedWon(userId, w.loteId)));

  if (notify) {
    if (winners.length === 1) {
      const w = winners[0];
      await notifyWonLot({
        numeroLote: w.numeroLote,
        monto: w.montoFinal,
      });
    } else {
      const list = winners
        .map((w) =>
          w.numeroLote != null ? `lote ${w.numeroLote}` : `lote #${w.loteId}`
        )
        .join(", ");
      Alert.alert("¡Ganaste lotes!", `Quedaste como ganador de: ${list}.`);
    }
  }

  return { won: winners.length, winners };
}

/**
 * Victoria de un lote concreto (WS `estado: finalizado` en la pantalla del lote).
 */
export async function checkWonSingleLote({
  userId,
  remateId,
  loteId,
  numeroLote,
  isWinningHint,
}) {
  if (!userId || !remateId || !loteId) return false;

  const watched = await getWatchedPujas(userId);
  const item = watched.find((w) => Number(w.loteId) === Number(loteId));
  if (item?.notifiedWon) return false;
  if (item && item.status === "outbid") return false;

  try {
    const response = await fetch(
      `${apiBaseUrl}/contador/${remateId}/${loteId}`
    );
    if (!response.ok) {
      if (!isWinningHint) return false;
      await markPujaWon({ userId, loteId, montoFinal: item?.monto });
      await notifyWonLot({
        numeroLote: numeroLote ?? item?.numeroLote,
        monto: item?.monto,
      });
      await markNotifiedWon(userId, loteId);
      return true;
    }

    const estado = parseContadorResponse(await response.json());
    if (!estado) return false;

    const { valor, usuarioIdLider, hasLiderField } = estado;
    let soyGanador = false;

    if (hasLiderField && usuarioIdLider != null) {
      soyGanador = Number(usuarioIdLider) === Number(userId);
    } else if (isWinningHint) {
      soyGanador = true;
    } else if (item) {
      soyGanador =
        !Number.isNaN(valor) && Number(valor) <= Number(item.monto);
    }

    if (!soyGanador) return false;

    await markPujaWon({
      userId,
      loteId,
      montoFinal: valor ?? item?.monto,
    });
    await notifyWonLot({
      numeroLote: numeroLote ?? item?.numeroLote,
      monto: valor ?? item?.monto,
    });
    await markNotifiedWon(userId, loteId);
    return true;
  } catch (error) {
    console.log("[WON] single lote error:", error?.message || error);
    return false;
  }
}
