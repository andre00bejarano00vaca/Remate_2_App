import React, { useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Card, Text, Title, Searchbar } from "react-native-paper";
import { getLots } from "../services/lotService";
import { CattleColors } from "../styles/colors";

export default function LotesListScreen({ route, navigation }) {
const remate = route.params?.remate; 

if (!remate) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>No se recibieron datos del remate.</Text>
    </View>
  );
}
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!remate?.id) {
      Alert.alert("Error", "Remate no especificado");
      navigation.goBack();
      return;
    }
    loadLotes();
  }, [remate]);

  const loadLotes = async () => {
    setLoading(true);
    try {
      const res = await getLots();
      // axios devuelve response; los datos reales están en res.data
      const data = res.data ?? res; 
      setLotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando lotes:", err);
      Alert.alert("Error", "No se pudieron cargar los lotes");
    } finally {
      setLoading(false);
    }
  };

  const filtered = lotes.filter(l =>
    (l.nombre || l.name || "").toString().toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={CattleColors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Title style={{ marginBottom: 8 }}>Remate: {remate?.nombre || remate?.name}</Title>

      <Searchbar
        placeholder="Buscar lote..."
        value={query}
        onChangeText={setQuery}
        style={{ marginBottom: 12 }}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={() => (
          <View style={{ padding: 20 }}>
            <Text>No hay lotes para este remate.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("LoteDetail", { lote: item, remate })}
          >
            <Card style={{ marginBottom: 10 }}>
              <Card.Content>
                <Text style={{ fontSize: 16, fontWeight: "700" }}>
                  {item.nombre || item.name}
                </Text>
                <Text style={{ color: CattleColors.mediumGray }}>
                  Raza: {item.raza || item.breed || "-"}  •  Precio: {item.precio ?? item.price ?? "-"}
                </Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
