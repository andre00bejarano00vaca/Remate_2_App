import { Alert } from "react-native";

let finRemateEnCurso = false;

/**
 * Reacciona a eventos del remate vía /ws/eventos/{remateId}.
 * FIN_REMATE: aviso y vuelta a la lista de remates (HomeScreen, LoteListScreen, etc.).
 */
export function procesarEvento(mensaje, navigation) {
  if (mensaje !== "FIN_REMATE") return;
  if (finRemateEnCurso) return;

  finRemateEnCurso = true;

  Alert.alert(
    "Remate finalizado",
    "Este remate ha finalizado. Ya no podés participar en sus lotes.",
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
