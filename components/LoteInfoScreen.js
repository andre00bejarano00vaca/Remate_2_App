import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";

export default function LoteInfoScreen() {
  const route = useRoute();
  const lote = route?.params?.lote;

  if (!lote) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No se encontró información del lote.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Título principal */}
      <Text style={styles.title}>{lote.nombre}</Text>

      {/* Información general */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información del lote</Text>
        <Text style={styles.info}><Text style={styles.label}>ID:</Text> {lote.id}</Text>
        <Text style={styles.info}><Text style={styles.label}>Raza:</Text> {lote.raza}</Text>
        <Text style={styles.info}><Text style={styles.label}>Precio:</Text> {lote.precio}</Text>
        <Text style={styles.info}><Text style={styles.label}>Prelance:</Text> {lote.prelance}</Text>
        <Text style={styles.info}><Text style={styles.label}>Puja:</Text> {lote.puja}</Text>
        <Text style={styles.info}><Text style={styles.label}>Estado:</Text> {lote.estado || "Sin estado"}</Text>
        <Text style={styles.info}><Text style={styles.label}>Visible:</Text> {lote.visible ? "Sí" : "No"}</Text>
      </View>

      {/* Cabana */}
      {lote.cabana && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cabaña</Text>
          <Text style={styles.info}><Text style={styles.label}>Nombre:</Text> {lote.cabana.nombre}</Text>
          <Text style={styles.info}><Text style={styles.label}>Teléfono:</Text> {lote.cabana.telefono}</Text>
          <Text style={styles.info}><Text style={styles.label}>Visible:</Text> {lote.cabana.visible ? "Sí" : "No"}</Text>
        </View>
      )}

      {/* Remate */}
      {lote.remate && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Remate</Text>
          <Text style={styles.info}><Text style={styles.label}>Nombre:</Text> {lote.remate.nombre}</Text>
          <Text style={styles.info}><Text style={styles.label}>Fecha:</Text> {lote.remate.fecha}</Text>
          <Text style={styles.info}><Text style={styles.label}>URL Lista Lotes:</Text> {lote.remate.urlListaLotes}</Text>
          <Text style={styles.info}><Text style={styles.label}>Visible:</Text> {lote.remate.visible ? "Sí" : "No"}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
    color: "#0B3D2E", // verde oscuro
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  section: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#0B3D2E", // verde oscuro
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#D4AF37", // dorado
    borderBottomWidth: 1,
    borderBottomColor: "#D4AF37",
    paddingBottom: 4,
  },
  info: {
    fontSize: 16,
    marginVertical: 4,
    color: "#FFFFFF", // blanco
  },
  label: {
    fontWeight: "bold",
    color: "#D4AF37", // dorado
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B3D2E",
  },
  errorText: {
    fontSize: 18,
    color: "#FF4C4C", // rojo suave para error
    fontWeight: "bold",
  },
});
