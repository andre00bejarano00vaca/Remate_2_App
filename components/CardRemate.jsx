import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ReporteScreen from "./Reporte";

export default function CardRemate({ remate }) {
  const seleccionarRemate = async () => {
    await AsyncStorage.setItem("remate", remate.id.toString());
    console.log("Remate seleccionado:", remate.id);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={seleccionarRemate}>
      <Text style={styles.titulo}>{remate.nombre}</Text>

      {/* Componente obligatorio */}
      <ReporteScreen remateId={remate.id}  remateName={remate.nombre}/>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 12,
    elevation: 3,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
});
