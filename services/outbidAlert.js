import { Alert } from "react-native";

/** Aviso en pantalla cuando te superan una puja. */
export async function notifyOutbid({ numeroLote, montoActual }) {
  const loteLabel = numeroLote ? `lote ${numeroLote}` : "un lote";
  Alert.alert(
    "Te superaron en el prelance",
    `Alguien pujó sobre tu oferta en el ${loteLabel}. Monto actual: $${Number(
      montoActual || 0
    ).toLocaleString()}`
  );
}
