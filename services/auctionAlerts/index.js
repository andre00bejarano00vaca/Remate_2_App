import { notifyUser } from "../pushNotifications";

/**
 * Avisos de puja: Alert en foreground, notificación local en background.
 * Push remoto con app cerrada lo envía el backend (token Expo).
 */

export async function notifyOutbid({
  numeroLote,
  montoActual,
  loteId,
  remateId,
}) {
  const loteLabel = numeroLote != null ? `lote ${numeroLote}` : "un lote";
  await notifyUser({
    title: "Te superaron en el prelance",
    body: `Alguien pujó sobre tu oferta en el ${loteLabel}. Monto actual: $${Number(
      montoActual || 0
    ).toLocaleString()}`,
    data: {
      type: "outbid",
      loteId: loteId ?? null,
      remateId: remateId ?? null,
      numeroLote: numeroLote ?? null,
    },
  });
}

export async function notifyWonLot({ numeroLote, monto, loteId, remateId }) {
  const loteLabel = numeroLote != null ? `lote ${numeroLote}` : "el lote";
  const montoTxt =
    monto != null && !Number.isNaN(Number(monto))
      ? ` Monto final: $${Number(monto).toLocaleString()}.`
      : "";
  await notifyUser({
    title: "¡Ganaste el lote!",
    body: `Quedaste como ganador del ${loteLabel} al finalizar el prelance.${montoTxt}`,
    data: {
      type: "won",
      loteId: loteId ?? null,
      remateId: remateId ?? null,
      numeroLote: numeroLote ?? null,
    },
    forceAlert: true,
  });
}
