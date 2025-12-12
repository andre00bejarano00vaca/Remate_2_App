import React, { useState, useEffect } from "react";
import { View, Text, TextInput } from "react-native";
import { Modal, Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = `https://testapp.digitaltelecom.net`;

export default function BidCorrectionModal({ 
  visible, 
  onDismiss,  
  onCorrect 
}) {

  const [newValue, setNewValue] = useState("");
  
  const handleSubmit = async () => {
    try {
      const remateId = await AsyncStorage.getItem("remate");
      const loteId =  await AsyncStorage.getItem("Lote")
      await axios.post(
        `${BASE_URL}/contador/corregir/${remateId}/${loteId}`,
        { nuevoValor: Number(newValue) }
      );

      if (onCorrect) onCorrect();

      onDismiss();
    } catch (error) {
      console.error(error);
      alert("Error al corregir la puja");
    }
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={{
        backgroundColor: "white",
        padding: 20,
        margin: 20,
        borderRadius: 10,
      }}
    >
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Corregir puja del lote 
      </Text>

      <TextInput
        keyboardType="numeric"
        value={newValue}
        onChangeText={setNewValue}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 6,
          padding: 10,
          marginBottom: 15,
        }}
      />

      <Button mode="contained" onPress={handleSubmit}>
        Guardar corrección
      </Button>
    </Modal>
  );
}
