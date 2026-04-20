import React, { useEffect, useState } from "react";
import { apiBaseUrl } from "../config/env";
import { View, FlatList, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CardRemate from "./CardRemate";

export default function RematesScreen() {
  const [remates, setRemates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRemates = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");

        const res = await fetch(
          `${apiBaseUrl}/api/remates`,
          {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
        );
        const data = await res.json();
        console.log("REMATES INFORME:", data);
        setRemates(data);
      } catch (error) {
        console.log("Error cargando remates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRemates();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  }

  return (
    <View>
      <FlatList
        data={remates}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CardRemate remate={item} />}
      />
    </View>
  );
}
