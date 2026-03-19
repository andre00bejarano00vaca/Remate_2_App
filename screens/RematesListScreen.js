import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
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

  const formatDate = (isoDate) => {
    if (!isoDate) return { day: "--", month: "--", time: "--:--" };
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("es-ES", { month: "short" }).replace(".", "");
    const time = date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    return { day, month, time };
  };

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
    const { day, month, time } = formatDate(item.fecha);

    return (
      <TouchableOpacity
        onPress={async () => {
          await AsyncStorage.setItem('remate', `${item.id}`);
          navigation.navigate('LotesList', { remate: item });
        }}
      >
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.dateBadge}>
              <Text style={styles.dateDay}>{day}</Text>
              <Text style={styles.dateMonth}>{month}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.title} numberOfLines={2}>{item.nombre}</Text>
              <Text style={styles.subtitle} numberOfLines={1}>{item?.descripcion || "Oferta especial de remate"}</Text>
              <View style={styles.timeRow}>
                <Text style={styles.timeIcon}>⏰</Text>
                <Text style={styles.timeText}>{time}</Text>
              </View>
            </View>
            <Image
              source={{ uri: item?.imagen || item?.banner || item?.imagenUrl || item?.flyerUrl || "https://via.placeholder.com/140x100.png?text=Remate" }}
              style={styles.thumbnail}
            />
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
  dateBadge: {
    width: 64,
    height: 72,
    borderRadius: 12,
    backgroundColor: CattleColors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  dateDay: {
    fontSize: 24,
    fontWeight: "800",
    color: CattleColors.white,
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: "700",
    color: CattleColors.white,
    textTransform: "capitalize",
  },
  cardBody: {
    flex: 1,
    paddingRight: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: CattleColors.primary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: CattleColors.darkGray,
  },
  timeRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    marginRight: 6,
    fontSize: 12,
  },
  timeText: {
    fontSize: 12,
    color: CattleColors.mediumGray,
    fontWeight: "600",
  },
  thumbnail: {
    width: 88,
    height: 72,
    borderRadius: 10,
    backgroundColor: CattleColors.lightGray,
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
