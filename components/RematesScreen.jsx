import React, { useEffect, useState } from "react";
import { apiBaseUrl } from "../config/env";
import { View, FlatList, ActivityIndicator } from "react-native";
import CardRemate from "./CardRemate";

export default function RematesScreen() {
  const [remates, setRemates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRemates = async () => {
      try {
        const res = await fetch(
          `${apiBaseUrl}/api/remates`
        );
        const data = await res.json();
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
