import React, { useState, useEffect } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import { Modal, Button, TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "https://testapp.digitaltelecom.net";

export default function BidCorrectionModal({
  visible,
  onDismiss,
  onCorrect,
  id,
}) {
  const [newValue, setNewValue] = useState("");

  // Limpia el estado cada vez que el modal se cierra
  useEffect(() => {
    if (!visible) {
      setNewValue("");
    }
  }, [visible]);

  const handleSubmit = async () => {
    try {
      const remateId = await AsyncStorage.getItem("remate");
      const loteId = await AsyncStorage.getItem("Lote");

      if (!remateId || !loteId) {
        Alert.alert(
          "Error",
          "No se pudo obtener el remate o el lote"
        );
        return;
      }

      const numericValue = Number(newValue);

      if (!newValue || isNaN(numericValue) || numericValue <= 0) {
        Alert.alert(
          "Error",
          "Ingrese un valor numérico válido"
        );
        return;
      }

      await axios.put(
        `${BASE_URL}/contador/corregir/pujaid/${id}/remateid/${remateId}/loteid/${loteId}`,
        { nuevoValor: numericValue }
      );

      onCorrect?.();
      onDismiss();

    } catch (error) {
      console.error("Error al corregir la puja:", error);
      Alert.alert(
        "Error",
        "Ocurrió un error al corregir la puja"
      );
    }
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={styles.container}
      dismissable={true}
    >
      <Text style={styles.title}>
        Corregir puja del lote
      </Text>

      <TextInput
        mode="outlined"
        label="Nuevo valor de la puja"
        keyboardType="numeric"
        value={newValue}
        onChangeText={setNewValue}
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
      >
        Guardar corrección
      </Button>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: "bold",
  },
  input: {
    marginBottom: 16,
  },
});
