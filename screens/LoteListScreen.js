import React, { useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { Card, Text, Title, Searchbar } from "react-native-paper";
import { getLots } from "../services/lotService";
import { CattleColors, CattleShadows } from "../styles/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppHeader from "../components/AppHeader";
import SideMenu from "../components/SideMenu";


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
  const [menuVisible, setMenuVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!remate?.id) {
      Alert.alert("Error", "Remate no especificado");
      navigation.goBack();
      return;
    }
    loadLotes();
  }, [remate]);

  useEffect(() => {
    const loadRole = async () => {
      try {
        const stored = await AsyncStorage.getItem("rol");
        if (!stored) return setIsAdmin(false);
        const parsed = (() => {
          try {
            return JSON.parse(stored);
          } catch {
            return stored;
          }
        })();
        const rolId = typeof parsed === "number" ? parsed : parseInt(parsed, 10);
        setIsAdmin(rolId === 2 || rolId === 4);
      } catch {
        setIsAdmin(false);
      }
    };
    loadRole();
  }, []);


const loadLotes = async () => {
  setLoading(true);
  try {
    const remateId = await AsyncStorage.getItem("remate"); // recupera el ID del remate
    const res = await getLots();
    const data = res.data ?? res;
    // Filtra solo los lotes del remate actual
    const filtered = Array.isArray(data)
      ? data.filter(lote => `${lote.remate.id}` === remateId)
      : [];

    setLotes(filtered);
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color={CattleColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Lotes"
        onMenu={() => setMenuVisible(true)}
        onLogout={async () => {
          try {
            await AsyncStorage.multiRemove(["usuario", "isLoggedIn", "rol", "authToken"]);
          } finally {
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          }
        }}
      />
      <View style={styles.content}>
        <Title style={styles.sectionTitle}>Remate: {remate?.nombre || remate?.name}</Title>

        <Searchbar
          placeholder="Buscar lote..."
          value={query}
          onChangeText={setQuery}
          style={styles.searchbar}
        />

        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text>No hay lotes para este remate.</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={ async () => {
                await AsyncStorage.setItem("Lote",`${item.id}`)
                navigation.navigate("LoteDetail", { lote: item, remate })}}
            >
              <Card style={styles.card}>
                <Card.Content>
                  <Text style={styles.cardTitle}>
                    {item.nombre || item.name}
                  </Text>
                  <Text style={styles.cardSubtitle}>
                    Lote #{item.numLote || "-"} · Cabaña: {item.cabana?.nombre ?? "-"}
                  </Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          )}
        />
      </View>
      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
        isAdmin={isAdmin}
        remate={remate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CattleColors.neutral,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    marginBottom: 8,
    color: CattleColors.primary,
  },
  searchbar: {
    marginBottom: 12,
    backgroundColor: CattleColors.white,
  },
  card: {
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: CattleColors.white,
    borderWidth: 1,
    borderColor: CattleColors.mediumLightGray,
    ...CattleShadows.card,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: CattleColors.primary,
  },
  cardSubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: CattleColors.mediumGray,
  },
  empty: {
    padding: 20,
  },
});
