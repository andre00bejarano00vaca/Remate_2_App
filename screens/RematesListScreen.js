import React, { useState, useCallback, useRef } from "react";
import DefaultRemate from "../assets/images/modelo-vacuno.webp";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { Card, Text } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getAuctions } from "../services/auctionService";
import { apiBaseUrl } from "../config/env";
import { CattleColors, CattleShadows } from "../styles/colors";

import AppHeader from "../components/AppHeader";
import SideMenu from "../components/SideMenu";

export default function RematesListScreen({ navigation }) {
  const [remates, setRemates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const hasLoadedRef = useRef(false);

  const loadRole = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem("rol");

      if (!stored) {
        setIsAdmin(false);
        return;
      }

      const rolId = parseInt(stored, 10);

      setIsAdmin(rolId === 2 || rolId === 4);
    } catch {
      setIsAdmin(false);
    }
  }, []);

  const loadRemates = useCallback(async ({showLoader = false}={}) => {
    try {
      // solo mostrar loader en la primera carga para no desmontar el FlatList
      // (y re/decodificar banners) al volver desde lotes
      if(showLoader){
        setLoading(true);
      }

      const data = await getAuctions();

      setRemates(Array.isArray(data) ? data : []);
      hasLoadedRef.current = true;
    } catch (error) {
      console.log("Error cargando remates:", error);
      setRemates([]);
    } finally {
      if(showLoader){  
      setLoading(false);
       }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRole();
      loadRemates({showLoader: !hasLoadedRef.current});
    }, [loadRole, loadRemates])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    await loadRemates({showLoader: false});

    setRefreshing(false);
  }, [loadRemates]);

  const logout = async () => {
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
  };

  const renderItem = useCallback(
    ({ item }) => {
      const rawImageUrl = [
        item?.bannerUrl,
        item?.banner,
        item?.imagenUrl,
        item?.flyerUrl,
      ].find((value) => typeof value === "string" && value.trim() !== "");

      const imageUrl = rawImageUrl
        ? rawImageUrl.startsWith("http://") || rawImageUrl.startsWith("https://") || rawImageUrl.startsWith("data:")
          ? rawImageUrl
          : `${apiBaseUrl}${rawImageUrl.startsWith("/") ? "" : "/"}${rawImageUrl}`
        : "";

      return (
        <TouchableOpacity
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel={item?.nombre || "Remate"}
          onPress={async () => {
           await AsyncStorage.setItem('remate', `${item.id}`);
           navigation.navigate('LotesList', { remate: item });
         }}
        >
          <Card style={styles.card}>
            <Image
              source={imageUrl ? { uri: imageUrl } : DefaultRemate}
              resizeMode="cover"
              style={styles.banner}
            />
          </Card>
        </TouchableOpacity>
      );
    },
    [navigation]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader
          title="Remates"
          onMenu={() => setMenuVisible(true)}
          onLogout={logout}
        />

        <View style={styles.loader}>
          <ActivityIndicator
            size="large"
            color={CattleColors.primary}
          />
        </View>

        <SideMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          navigation={navigation}
          isAdmin={isAdmin}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="Remates"
        onMenu={() => setMenuVisible(true)}
        onLogout={logout}
      />

      <FlatList
        data={remates.filter((remate) => remate?.visible === true)}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={4}
        windowSize={8}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              Sin remates
            </Text>

            <Text style={styles.emptyText}>
              Aún no hay remates disponibles.
            </Text>
          </View>
        )}
      />

      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
        isAdmin={isAdmin}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CattleColors.neutral,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  list: {
    padding: 14,
    paddingBottom: 30,
  },

  card: {
    marginBottom: 18,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: CattleColors.white,
    ...CattleShadows.card,
  },

  banner: {
    width: "100%",
    height: 250,
    backgroundColor: CattleColors.lightGray,
  },

  empty: {
    marginTop: 60,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: CattleColors.primary,
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: CattleColors.mediumGray,
    textAlign: "center",
  },
});


// import React, { useEffect, useState } from 'react';
// import { View, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
// import { Card, Text } from 'react-native-paper';
// import { getAuctions } from '../services/auctionService';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { CattleColors, CattleShadows } from "../styles/colors";
// import AppHeader from "../components/AppHeader";
// import SideMenu from "../components/SideMenu";

// export default function RematesListScreen({ navigation }) {
//   const [remates, setRemates] = useState([]);
//   const [menuVisible, setMenuVisible] = useState(false);
//   const [isAdmin, setIsAdmin] = useState(false);

//   const formatDate = (isoDate) => {
//     if (!isoDate) return { day: "--", month: "--", time: "--:--" };
//     const date = new Date(isoDate);
//     const day = String(date.getDate()).padStart(2, "0");
//     const month = date.toLocaleString("es-ES", { month: "short" }).replace(".", "");
//     const time = date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
//     return { day, month, time };
//   };

//   useEffect(() => {
//     loadRemates();
//   }, []);

//   useEffect(() => {
//     const loadRole = async () => {
//       try {
//         const stored = await AsyncStorage.getItem("rol");
//         if (!stored) return setIsAdmin(false);
//         const rolId = parseInt(stored, 10);
//         if (Number.isNaN(rolId)) return setIsAdmin(false);
//         setIsAdmin(rolId === 2 || rolId === 4);
//       } catch {
//         setIsAdmin(false);
//       }
//     };
//     loadRole();
//   }, []);

//   const loadRemates = async () => {
//     const data = await getAuctions();
//     setRemates(data);
//   };

//   const renderItem = ({ item }) => {
//     const { day, month, time } = formatDate(item.fecha);

//     return (
//       <TouchableOpacity
//         onPress={async () => {
//           await AsyncStorage.setItem('remate', `${item.id}`);
//           navigation.navigate('LotesList', { remate: item });
//         }}
//       >
//         <Card style={styles.card}>
//           <Card.Content style={styles.cardContent}>
//             <View style={styles.dateBadge}>
//               <Text style={styles.dateDay}>{day}</Text>
//               <Text style={styles.dateMonth}>{month}</Text>
//             </View>
//             <View style={styles.cardBody}>
//               <Text style={styles.title} numberOfLines={2}>{item.nombre}</Text>
//               <Text style={styles.subtitle} numberOfLines={1}>{item?.descripcion || "Oferta especial de remate"}</Text>
//               <View style={styles.timeRow}>
//                 <Text style={styles.timeIcon}>⏰</Text>
//                 <Text style={styles.timeText}>{time}</Text>
//               </View>
//             </View>
//             <Image
//               source={{ uri: item?.imagen || item?.banner || item?.imagenUrl || item?.flyerUrl || "https://via.placeholder.com/140x100.png?text=Remate" }}
//               style={styles.thumbnail}
//             />
//           </Card.Content>
//         </Card>
//       </TouchableOpacity>
//     );
//   };

//   const logout = async () => {
//     try {
//       await AsyncStorage.multiRemove(["usuario", "isLoggedIn", "rol", "authToken"]);
//     } finally {
//       navigation.reset({
//         index: 0,
//         routes: [{ name: "Login" }],
//       });
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <AppHeader
//         title="Remates"
//         onMenu={() => setMenuVisible(true)}
//         onLogout={logout}
//       />
//       <FlatList
//         data={remates}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={renderItem}
//         contentContainerStyle={styles.list}
//         ListEmptyComponent={() => (
//           <View style={styles.empty}>
//             <Text style={styles.emptyTitle}>Sin remates</Text>
//             <Text style={styles.emptyText}>Aún no hay remates disponibles.</Text>
//           </View>
//         )}
//       />
//       <SideMenu
//         visible={menuVisible}
//         onClose={() => setMenuVisible(false)}
//         navigation={navigation}
//         isAdmin={isAdmin}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: CattleColors.neutral,
//   },
//   list: {
//     padding: 12,
//     paddingBottom: 24,
//   },
//   card: {
//     marginBottom: 12,
//     borderRadius: 16,
//     backgroundColor: CattleColors.white,
//     borderWidth: 1,
//     borderColor: CattleColors.mediumLightGray,
//     ...CattleShadows.card,
//   },
//   cardContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//   },
//   dateBadge: {
//     width: 64,
//     height: 72,
//     borderRadius: 12,
//     backgroundColor: CattleColors.accent,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   dateDay: {
//     fontSize: 24,
//     fontWeight: "800",
//     color: CattleColors.white,
//   },
//   dateMonth: {
//     fontSize: 12,
//     fontWeight: "700",
//     color: CattleColors.white,
//     textTransform: "capitalize",
//   },
//   cardBody: {
//     flex: 1,
//     paddingRight: 6,
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: CattleColors.primary,
//   },
//   subtitle: {
//     marginTop: 6,
//     fontSize: 13,
//     color: CattleColors.darkGray,
//   },
//   timeRow: {
//     marginTop: 8,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   timeIcon: {
//     marginRight: 6,
//     fontSize: 12,
//   },
//   timeText: {
//     fontSize: 12,
//     color: CattleColors.mediumGray,
//     fontWeight: "600",
//   },
//   thumbnail: {
//     width: 88,
//     height: 72,
//     borderRadius: 10,
//     backgroundColor: CattleColors.lightGray,
//   },
//   empty: {
//     paddingTop: 40,
//     alignItems: "center",
//   },
//   emptyTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: CattleColors.primary,
//   },
//   emptyText: {
//     marginTop: 6,
//     fontSize: 12,
//     color: CattleColors.mediumGray,
//   },
// });
