export function procesarEvento(mensaje, navigation) {
  if (mensaje === "FIN_REMATE") {
    navigation.navigate("RematesList");
  }
}
