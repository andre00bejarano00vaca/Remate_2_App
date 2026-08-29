import React, { useEffect, useState, useCallback } from "react";

import {

  View,

  FlatList,

  TouchableOpacity,

  ActivityIndicator,

  Alert,

  StyleSheet,

} from "react-native";

import { Card, Text, Searchbar } from "react-native-paper";

import { getLots } from "../services/lotService";

import { CattleColors, CattleShadows } from "../styles/colors";

import AsyncStorage from "@react-native-async-storage/async-storage";

import AppHeader from "../components/AppHeader";

import SideMenu from "../components/SideMenu";

import useEventosWS from "../services/useEventosWS";

import { procesarEvento } from "../services/procesarEvento";



export default function LotesListScreen({ route, navigation }) {

  const remate = route?.params?.remate;

  const remateId = remate?.id != null ? String(remate.id) : null;



  const [lotes, setLotes] = useState([]);

  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");

  const [menuVisible, setMenuVisible] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);



  const loadLotes = useCallback(async (targetRemateId, isActive) => {

    if (!targetRemateId) return;



    setLoading(true);



    try {

      const res = await getLots();

      const data = res?.data ?? res;



      const filtered = Array.isArray(data)

        ? data.filter((lote) => String(lote?.remate?.id) === targetRemateId)

        : [];



      if (isActive()) {

        setLotes(filtered);

      }

    } catch (err) {

      console.error("Error cargando lotes:", err);

      if (isActive()) {

        Alert.alert("Error", "No se pudieron cargar los lotes");

      }

    } finally {

      if (isActive()) {

        setLoading(false);

      }

    }

  }, []);



  useEffect(() => {

    if (!remateId) {

      Alert.alert("Error", "Remate no especificado");

      navigation.goBack();

      return;

    }



    setQuery("");

    setLotes([]);



    let active = true;

    const isActive = () => active;

    loadLotes(remateId, isActive);



    return () => {

      active = false;

    };

  }, [remateId, loadLotes, navigation]);



  useEffect(() => {

    const loadRole = async () => {

      try {

        const stored = await AsyncStorage.getItem("rol");

        if (!stored) return setIsAdmin(false);

        const rolId = parseInt(stored, 10);

        if (Number.isNaN(rolId)) return setIsAdmin(false);

        setIsAdmin(rolId === 2 || rolId === 4);

      } catch {

        setIsAdmin(false);

      }

    };

    loadRole();

  }, []);



  useEventosWS(remateId, (mensaje) => {

    procesarEvento(mensaje, navigation);

  });



  if (!remate) {

    return (

      <View style={styles.center}>

        <Text>No se recibieron datos del remate.</Text>

      </View>

    );

  }



  const filtered = lotes.filter((l) =>

    (l.nombre || l.name || "")

      .toString()

      .toLowerCase()

      .includes(query.toLowerCase())

  );



  return (

    <View key={remateId} style={styles.container}>

      <AppHeader

        title="Lotes"

        onMenu={() => setMenuVisible(true)}

        onLogout={async () => {

          try {

            await AsyncStorage.multiRemove([

              "usuario",

              "isLoggedIn",

              "rol",

              "authToken",

            ]);

          } finally {

            navigation.reset({

              index: 0,

              routes: [{ name: "Login" }],

            });

          }

        }}

      />

      <View style={styles.content}>

        <View style={styles.sectionHeader}>

          <Text style={styles.sectionLabel}>Remate</Text>

          <Text style={styles.sectionTitle}>{remate?.nombre || remate?.name}</Text>

        </View>



        <Searchbar

          placeholder="Buscar lote..."

          value={query}

          onChangeText={setQuery}

          style={styles.searchbar}

          iconColor={CattleColors.primary}

          inputStyle={styles.searchInput}

        />



        <FlatList

          data={filtered}

          keyExtractor={(item) => String(item.id)}

          ListEmptyComponent={() =>

            loading ? null : (

              <View style={styles.empty}>

                <Text style={styles.emptyTitle}>Sin lotes</Text>

                <Text style={styles.emptyText}>No hay lotes para este remate.</Text>

              </View>

            )

          }

          renderItem={({ item }) => (

            <TouchableOpacity

              onPress={async () => {

                const remateForLote = item.remate ?? remate;

                await AsyncStorage.setItem("Lote", `${item.id}`);

                if (remateForLote?.id != null) {

                  await AsyncStorage.setItem("remate", String(remateForLote.id));

                }

                navigation.navigate("LoteDetail", {

                  lote: { ...item, remate: remateForLote },

                  remate: remateForLote,

                });

              }}

            >

              <Card style={styles.card}>

                <Card.Content style={styles.cardContent}>

                  <View style={styles.lotBadge}>

                    <Text style={styles.lotBadgeLabel}>Lote</Text>

                    <Text style={styles.lotBadgeNumber}>{item.numLote || "-"}</Text>

                  </View>

                  <View style={styles.cardBody}>

                    <Text style={styles.cardTitle} numberOfLines={2}>

                      {item.nombre || item.name}

                    </Text>

                    <Text style={styles.cardSubtitle} numberOfLines={1}>

                      Cabaña: {item.cabana?.nombre ?? "-"} ·{" "}

                      {item.raza || "Raza no indicada"}

                    </Text>

                    <Text style={styles.cardMeta}>

                      Peso: {item.pesoPromedio || item.peso || "-"} kg · Prelance: $

                      {item.prelance || 0}

                    </Text>

                  </View>

                  <Text style={styles.cardChip}>{item.estado || "Disponible"}</Text>

                </Card.Content>

              </Card>

            </TouchableOpacity>

          )}

        />

      </View>



      {loading && (

        <View style={styles.loadingOverlay} pointerEvents="auto">

          <ActivityIndicator size="large" color={CattleColors.primary} />

        </View>

      )}



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

  loadingOverlay: {

    ...StyleSheet.absoluteFillObject,

    backgroundColor: "rgba(255,255,255,0.75)",

    justifyContent: "center",

    alignItems: "center",

    zIndex: 10,

  },

  sectionHeader: {

    marginBottom: 10,

  },

  sectionLabel: {

    fontSize: 12,

    color: CattleColors.mediumGray,

    letterSpacing: 0.6,

  },

  sectionTitle: {

    fontSize: 18,

    fontWeight: "700",

    color: CattleColors.primary,

  },

  searchbar: {

    marginBottom: 12,

    backgroundColor: CattleColors.white,

    borderWidth: 1,

    borderColor: CattleColors.mediumLightGray,

  },

  searchInput: {

    fontSize: 14,

    color: CattleColors.black,

  },

  card: {

    marginBottom: 12,

    borderRadius: 16,

    backgroundColor: CattleColors.white,

    borderWidth: 1,

    borderColor: CattleColors.mediumLightGray,

    ...CattleShadows.card,

  },

  cardContent: {

    flexDirection: "row",

    alignItems: "center",

    gap: 10,

  },

  lotBadge: {

    width: 64,

    height: 72,

    borderRadius: 12,

    backgroundColor: CattleColors.accent,

    alignItems: "center",

    justifyContent: "center",

  },

  lotBadgeLabel: {

    fontSize: 12,

    fontWeight: "700",

    color: CattleColors.white,

  },

  lotBadgeNumber: {

    fontSize: 22,

    fontWeight: "800",

    color: CattleColors.white,

  },

  cardBody: {

    flex: 1,

    paddingRight: 6,

  },

  cardTitle: {

    fontSize: 16,

    fontWeight: "700",

    color: CattleColors.primary,

  },

  cardSubtitle: {

    marginTop: 6,

    fontSize: 13,

    color: CattleColors.darkGray,

  },

  cardMeta: {

    marginTop: 6,

    fontSize: 12,

    color: CattleColors.mediumGray,

  },

  cardChip: {

    fontSize: 11,

    color: CattleColors.accent,

    fontWeight: "700",

    letterSpacing: 0.6,

  },

  empty: {

    paddingTop: 40,

    alignItems: "center",

  },

  emptyTitle: {

    fontSize: 16,

    fontWeight: "700",

    color: CattleColors.primary,

  },

  emptyText: {

    marginTop: 6,

    fontSize: 12,

    color: CattleColors.mediumGray,

  },

});


