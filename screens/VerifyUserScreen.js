// screens/VerifyUserScreen.js
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function VerifyUserScreen({ navigation }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const usuario = await AsyncStorage.getItem("usuario"); // username guardado en login
        if (!usuario) {
          navigation.replace("Login");
          return;
        }

        const response = await fetch(`http:192.168.0.119:8080/auth/verificar/${usuario}`);
        if (!response.ok) {
          navigation.replace("Login");
          return;
        }

        const data = await response.json();
        console.log("Respuesta de /auth/verificar:", data);

        // ⚠️ Ajusta estos nombres a lo que devuelva tu ConfirmadoTF
        if (!data.authenticated) {
          navigation.replace("Login");
        } else if (data.confirmed) {
          navigation.replace("Home");
        } else {
          navigation.replace("PendingApproval");
        }
      } catch (error) {
        console.error("Error verificando usuario:", error);
        Alert.alert("Error", "No se pudo verificar al usuario");
        navigation.replace("Login");
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
}
