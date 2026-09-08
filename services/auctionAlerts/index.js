import { Alert } from "react-native";

/**
 * Avisos de puja en pantalla (Alert nativo).
 * Fase 1: sin push / FCM / expo-notifications.
 */

export async function notifyOutbid({ numeroLote, montoActual }) {
  const loteLabel = numeroLote != null ? `lote ${numeroLote}` : "un lote";
  Alert.alert(
    "Te superaron en el prelance",
    `Alguien pujó sobre tu oferta en el ${loteLabel}. Monto actual: $${Number(
      montoActual || 0
    ).toLocaleString()}`
  );
}

export async function notifyWonLot({ numeroLote, monto }) {
  const loteLabel = numeroLote != null ? `lote ${numeroLote}` : "el lote";
  const montoTxt =
    monto != null && !Number.isNaN(Number(monto))
      ? ` Monto final: $${Number(monto).toLocaleString()}.`
      : "";
  Alert.alert(
    "¡Ganaste el lote!",
    `Quedaste como ganador del ${loteLabel} al finalizar el prelance.${montoTxt}`
  );
}
