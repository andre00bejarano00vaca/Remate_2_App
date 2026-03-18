import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { getAuctions } from '../services/auctionService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CattleColors, CattleShadows } from "../styles/colors";
import AppHeader from "../components/AppHeader";
import SideMenu from "../components/SideMenu";

export default function RematesListScreen({ navigation }) {
  const [remates, setRemates] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadRemates();
  }, []);

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

  const loadRemates = async () => {
    const data = await getAuctions();
    setRemates(data);
  };

  const renderItem = ({ item }) => {
    const [fecha, hora] = item.fecha.split('T');

    return (
      <TouchableOpacity
        onPress={async () => {
          await AsyncStorage.setItem('remate', `${item.id}`);
          navigation.navigate('LotesList', { remate: item });
        }}
      >
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{item.nombre}</Text>
              <Text style={styles.badge}>ACTIVO</Text>
            </View>
            <Text style={styles.subtitle}>Inicio: {fecha} · {hora}</Text>
            <Text style={styles.meta}>Cabaña: {item?.cabana?.nombre || "—"}</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(["usuario", "isLoggedIn", "rol", "authToken"]);
    } finally {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Remates"
        onMenu={() => setMenuVisible(true)}
        onLogout={logout}
      />
      <FlatList
        data={remates}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Sin remates</Text>
            <Text style={styles.emptyText}>Aún no hay remates disponibles.</Text>
          </View>
        )}
      />
      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
        isAdmin={isAdmin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CattleColors.neutral,
  },
  list: {
    padding: 12,
    paddingBottom: 24,
  },
  card: {
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: CattleColors.white,
    borderWidth: 1,
    borderColor: CattleColors.mediumLightGray,
    ...CattleShadows.card,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: CattleColors.primary,
  },
  badge: {
    fontSize: 11,
    fontWeight: "700",
    color: CattleColors.accent,
    letterSpacing: 0.6,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 12,
    color: CattleColors.mediumGray,
  },
  meta: {
    marginTop: 4,
    fontSize: 12,
    color: CattleColors.darkGray,
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
