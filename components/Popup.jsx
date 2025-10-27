import React, { useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";

export default function Popup() {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Botón para abrir el popup */}
      <TouchableOpacity style={styles.button} onPress={() => setVisible(true)}>
        <Text style={styles.buttonText}>Mostrar popup</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={visible}
        transparent={true}       // hace el fondo difuminado
        animationType="fade"    // animación de entrada
        onRequestClose={() => setVisible(false)} // Android back button
      >
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text style={styles.title}>¡Hola!</Text>
            <Text>Este es un popup sin librerías externas ✨</Text>

            <TouchableOpacity
              style={[styles.button, { marginTop: 15 }]}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 10,
    width: 300,
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  button: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: { color: "white", fontWeight: "bold" },
});
