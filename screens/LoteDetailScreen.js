import React, { useEffect } from "react";
import { View, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Card, Text, Button } from "react-native-paper";
import { Video } from "expo-av";

const { width } = Dimensions.get("window");

export default function LoteDetailScreen({ route, navigation }) {
  const { lote, remate } = route.params || {};

  useEffect(() => {
    if (!lote) {
      navigation.goBack();
    }
  }, [lote]);

  return (
    <ScrollView style={styles.container}>
      {/* 🎥 Video del Lote */}
      <View style={styles.videoContainer}>
        <Video
          source={{
            uri:
              lote?.videoUrl ||
              "https://www.w3schools.com/html/mov_bbb.mp4", // Fallback
          }}
          rate={1.0}
          volume={1.0}
          resizeMode="cover"
          shouldPlay
          isLooping
          useNativeControls
          style={styles.video}
        />
      </View>

      {/* 🐄 Detalles del Lote */}
      <Card style={styles.detailCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🐄 Detalles del Lote</Text>
          <Text style={styles.detailText}>
            <Text style={styles.label}>Nombre: </Text>
            {lote?.nombre || "Sin nombre"}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.label}>Raza: </Text>
            {lote?.raza || "-"}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.label}>Peso: </Text>
            {lote?.peso ? `${lote.peso} kg` : "-"}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.label}>Precio Base: </Text>
            {lote?.precio ? `$${lote.precio}` : "No disponible"}
          </Text>
        </Card.Content>
      </Card>

      {/* 📍 Información del Remate */}
      <Card style={styles.detailCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📍 Información del Remate</Text>
          <Text style={styles.detailText}>
            <Text style={styles.label}>Remate: </Text>
            {remate?.nombre || "Desconocido"}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.label}>Fecha Inicio: </Text>
            {remate?.fecha || "-"}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.label}>Ubicación: </Text>
            {remate?.ubicacion || "No especificada"}
          </Text>
        </Card.Content>
      </Card>

      {/* 🛒 Botones de acción */}
      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => console.log("Ofertar")}
          style={styles.button}
          labelStyle={styles.buttonText}
        >
          Realizar oferta
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          textColor="#1565C0"
          style={{ borderColor: "#1565C0", borderRadius: 12 }}
        >
          Volver
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4", // gris claro de fondo
    padding: 16,
  },
  videoContainer: {
    width: "100%",
    height: width * 0.6,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#000", // fondo negro por si el video no carga
  },
  video: {
    width: "100%",
    height: "100%",
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1565C0",
    marginBottom: 8,
  },
  label: {
    fontWeight: "600",
    color: "#555555",
  },
  detailText: {
    fontSize: 15,
    marginVertical: 3,
    color: "#222222",
  },
  actions: {
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#1565C0",
    marginBottom: 10,
    width: "90%",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
