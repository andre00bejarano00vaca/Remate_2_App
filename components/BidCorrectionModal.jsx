import React, { useState, useEffect } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import { Modal, Button, TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { apiBaseUrl } from "../config/env";

export default function BidCorrectionModal({
  visible,
  onDismiss,
  onCorrect,
  id,
  remateId: remateIdProp,
  loteId: loteIdProp,
  initialValue,
}) {
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    if (!visible) {
      setNewValue("");
      return;
    }
    if (initialValue != null && initialValue !== "") {
      setNewValue(String(initialValue));
    }
  }, [visible, initialValue]);

  const handleSubmit = async () => {
    try {
      const remateFromStorage = await AsyncStorage.getItem("remate");
      const loteFromStorage = await AsyncStorage.getItem("Lote");

      const remateId = remateIdProp != null ? String(remateIdProp) : remateFromStorage;
      const loteId = loteIdProp != null ? String(loteIdProp) : loteFromStorage;

      if (!id) {
        Alert.alert("Error", "No se pudo identificar la puja");
        return;
      }

      if (!remateId || !loteId) {
        Alert.alert(
          "Error",
          "No se pudo obtener el remate o el lote de esta puja. Abrí un remate/lote o elegí otra puja."
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
        `${apiBaseUrl}/contador/corregir/pujaid/${id}/remateid/${remateId}/loteid/${loteId}`,
        { nuevoValor: Math.round(numericValue) }
      );

      onCorrect?.();
      onDismiss();

    } catch (error) {
      console.error("Error al corregir la puja:", error);
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Ocurrió un error al corregir la puja";
      Alert.alert("Error", typeof msg === "string" ? msg : "Ocurrió un error al corregir la puja");
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
