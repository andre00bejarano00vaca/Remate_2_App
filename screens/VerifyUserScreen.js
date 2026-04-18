// screens/VerifyUserScreen.js
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiBaseUrl } from "../config/env";

export default function VerifyUserScreen({ navigation }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const usuario = await AsyncStorage.getItem("usuario");

        if (token) {
          const response = await fetch(`${apiBaseUrl}/api/usuarios/me`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.status === 401) {
            await AsyncStorage.multiRemove(["authToken", "isLoggedIn", "usuario", "rol"]);
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
          } else {
            navigation.replace("PendingApproval");
          }
          return;
        }

        if (!usuario) {
          navigation.replace("Login");
          return;
        }

        const response = await fetch(`${apiBaseUrl}/auth/verificar/${usuario}`);
        if (!response.ok) {
          navigation.replace("Login");
          return;
        }

        const data = await response.json();
        if (!data.authenticated) {
          navigation.replace("Login");
        } else if (data.confirmed) {
          navigation.replace("RematesList");
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
