import { Alert } from "react-native";
import { checkWonLotsForRemate } from "./auctionAlerts/checkWonLots";
import { getAuctionById } from "./auctionService";

let finRemateEnCurso = false;

function remateLabel(nombreRemate) {
  const name = String(nombreRemate ?? "").trim();
  return name ? `"${name}"` : "este prelance";
}

function formatWinnersBody(winners, nombreRemate) {
  const prelance = remateLabel(nombreRemate);

  if (!winners?.length) {
    return `El prelance ${prelance} ha finalizado. Ya no podés participar en sus lotes.`;
  }

  if (winners.length === 1) {
    const w = winners[0];
    const lote =
      w.numeroLote != null ? `lote ${w.numeroLote}` : `lote #${w.loteId}`;
    const monto =
      w.montoFinal != null
        ? ` Monto final: $${Number(w.montoFinal).toLocaleString()}.`
        : "";
    return `Quedaste como ganador del ${lote} en el prelance ${prelance}.${monto} Ya no podés seguir pujando.`;
  }

  const list = winners
    .map((w) =>
      w.numeroLote != null ? `lote ${w.numeroLote}` : `lote #${w.loteId}`
    )
    .join(", ");
  return `En el prelance ${prelance} quedaste como ganador de: ${list}. Ya no podés seguir pujando.`;
}

async function resolveRemateNombre(remateId, nombreRemate) {
  const fromArg = String(nombreRemate ?? "").trim();
  if (fromArg) return fromArg;
  if (remateId == null) return "";

  try {
    const data = await getAuctionById(remateId);
    return String(data?.nombre || data?.name || "").trim();
  } catch (error) {
    console.log("[EVENTO] no se pudo cargar nombre remate:", error?.message || error);
    return "";
  }
}

/**
 * Reacciona a eventos del remate vía /ws/eventos/{remateId}.
 * FIN_REMATE: chequea si ganaste lotes, avisa (con nombre del prelance) y vuelve a la lista.
 */
export async function procesarEvento(
  mensaje,
  navigation,
  remateId,
  nombreRemate
) {
  if (mensaje !== "FIN_REMATE") return;
  if (finRemateEnCurso) return;

  finRemateEnCurso = true;

  const nombre = await resolveRemateNombre(remateId, nombreRemate);

  let winners = [];
  try {
    const result = await checkWonLotsForRemate(remateId);
    winners = result?.winners ?? [];
  } catch (error) {
    console.log("[EVENTO] checkWonLots error:", error?.message || error);
  }

  const won = winners.length > 0;
  const prelance = remateLabel(nombre);

  Alert.alert(
    won ? "¡Ganaste!" : "Prelance finalizado",
    won
      ? formatWinnersBody(winners, nombre)
      : `El prelance ${prelance} ha finalizado. Ya no podés participar en sus lotes.`,
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
