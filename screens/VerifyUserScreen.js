// screens/VerifyUserScreen.js
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiBaseUrl } from "../config/env";

const SESSION_KEYS = ["authToken", "isLoggedIn", "usuario", "rol", "userId"];

/**
 * Solo restaura sesión si hay JWT válido.
 * Sin token → Login (evita entrar a Remates por el atajo /auth/verificar sin JWT).
 */
export default function VerifyUserScreen({ navigation }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");

        if (!token) {
          await AsyncStorage.multiRemove(SESSION_KEYS);
          navigation.replace("Login");
          return;
        }

        const response = await fetch(`${apiBaseUrl}/api/usuarios/me`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          await AsyncStorage.multiRemove(SESSION_KEYS);
          navigation.replace("Login");
          return;
        }

        if (!response.ok) {
          navigation.replace("Login");
          return;
        }

        const data = await response.json();
        if (data.confirmed) {
          navigation.replace("RematesList");
          return;
        }

        // Token sin aprobación: limpiar y pedir login cuando lo aprueben
        await AsyncStorage.multiRemove(SESSION_KEYS);
        Alert.alert(
          "Aprobación requerida",
          "Tu cuenta debe ser aprobada por un administrador antes de ingresar. Cuando te aprueben, inicia sesión con tus datos."
        );
        navigation.replace("Login");
      } catch (error) {
        console.error("Error verificando usuario:", error);
        Alert.alert("Error", "No se pudo verificar al usuario");
        navigation.replace("Login");
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
}
