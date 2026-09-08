import { Alert } from "react-native";
import { checkWonLotsForRemate } from "./auctionAlerts/checkWonLots";

let finRemateEnCurso = false;

function formatWinnersBody(winners) {
  if (!winners?.length) {
    return "Este prelance ha finalizado. Ya no podés participar en sus lotes.";
  }

  if (winners.length === 1) {
    const w = winners[0];
    const lote =
      w.numeroLote != null ? `lote ${w.numeroLote}` : `lote #${w.loteId}`;
    const monto =
      w.montoFinal != null
        ? ` Monto final: $${Number(w.montoFinal).toLocaleString()}.`
        : "";
    return `Quedaste como ganador del ${lote}.${monto} Ya no podés seguir pujando en este prelance.`;
  }

  const list = winners
    .map((w) =>
      w.numeroLote != null ? `lote ${w.numeroLote}` : `lote #${w.loteId}`
    )
    .join(", ");
  return `Quedaste como ganador de: ${list}. Ya no podés seguir pujando en este prelance.`;
}

/**
 * Reacciona a eventos del remate vía /ws/eventos/{remateId}.
 * FIN_REMATE: chequea si ganaste lotes, avisa y vuelve a la lista.
 */
export async function procesarEvento(mensaje, navigation, remateId) {
  if (mensaje !== "FIN_REMATE") return;
  if (finRemateEnCurso) return;

  finRemateEnCurso = true;

  let winners = [];
  try {
    const result = await checkWonLotsForRemate(remateId);
    winners = result?.winners ?? [];
  } catch (error) {
    console.log("[EVENTO] checkWonLots error:", error?.message || error);
  }

  const won = winners.length > 0;

  Alert.alert(
    won ? "¡Ganaste!" : "Prelance finalizado",
    formatWinnersBody(winners),
    [
      {
        text: "Entendido",
        onPress: () => {
          finRemateEnCurso = false;
          if (navigation?.replace) {
            navigation.replace("RematesList");
          } else {
            navigation?.navigate?.("RematesList");
          }
        },
      },
    ],
    {
      cancelable: false,
      onDismiss: () => {
        finRemateEnCurso = false;
      },
    }
  );
}
