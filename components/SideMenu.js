import React from "react";
import { Modal, View, StyleSheet, TouchableOpacity, Image, Alert, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconButton, Text, Divider } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CattleColors, CattleShadows } from "../styles/colors";
import {
  getStoredPushToken,
  setupPushForUser,
} from "../services/pushNotifications";

export default function SideMenu({
  visible,
  onClose,
  navigation,
  isAdmin,
  remate,
}) {
  const navigateTo = (name, params) => {
    onClose?.();
    navigation.navigate(name, params);
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(["usuario", "isLoggedIn", "rol", "authToken"]);
    } finally {
      onClose?.();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  };

  const showPushToken = async () => {
    try {
      let token = await getStoredPushToken();
      if (!token) {
        const userId = await AsyncStorage.getItem("userId");
        token = await setupPushForUser(userId);
      }

      if (!token) {
        Alert.alert(
          "Token push",
          "No hay token todavía. Usá el APK de EAS (no Expo Go), aceptá el permiso de notificaciones e intentá de nuevo."
        );
        return;
      }

      Alert.alert("Expo Push Token", token, [
        { text: "Cerrar", style: "cancel" },
        {
          text: "Compartir / copiar",
          onPress: () => {
            Share.share({ message: token }).catch(() => {});
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Token push", error?.message || "No se pudo obtener el token");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.menuSafe}>
          <View style={styles.menu}>
            <View style={styles.header}>
              <View style={styles.brandRow}>
                <Image
                  source={require("../assets/header.png")}
                  style={styles.brandLogo}
                  accessibilityLabel="FERCOGAN Eventos Élite Prelance"
                />
                <IconButton icon="close" size={20} onPress={onClose} iconColor={CattleColors.white} />
              </View>
            </View>
            <Divider style={styles.divider} />

            <TouchableOpacity style={styles.item} onPress={() => navigateTo("RematesList")}>
              <IconButton icon="home" size={20} iconColor={CattleColors.primary} />
              <Text style={styles.itemText}>Prelances</Text>
            </TouchableOpacity>

            {remate && (
              <TouchableOpacity
                style={styles.item}
                onPress={() => navigateTo("LotesList", { remate })}
              >
                <IconButton icon="format-list-bulleted" size={20} iconColor={CattleColors.primary} />
                <Text style={styles.itemText}>Lotes</Text>
              </TouchableOpacity>
            )}

            {isAdmin && (
              <TouchableOpacity style={styles.item} onPress={() => navigateTo("AdminPanel")}>
                <IconButton icon="shield-account" size={20} iconColor={CattleColors.primary} />
                <Text style={styles.itemText}>Panel Admin</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.item} onPress={showPushToken}>
              <IconButton icon="bell-badge" size={20} iconColor={CattleColors.primary} />
              <Text style={styles.itemText}>Ver token push</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.item} onPress={logout}>
                <IconButton icon="logout" size={20} iconColor={CattleColors.error} />
                <Text style={[styles.itemText, { color: CattleColors.error }]}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-start",
  },
  menuSafe: {
    width: "78%",
    maxWidth: 320,
  },
  menu: {
    backgroundColor: CattleColors.white,
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 16,
    minHeight: "100%",
    ...CattleShadows.card,
  },
  header: {
    backgroundColor: CattleColors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandLogo: {
    flex: 1,
    height: 56,
    resizeMode: "contain",
  },
  divider: {
    marginVertical: 12,
    backgroundColor: CattleColors.mediumLightGray,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  itemText: {
    fontSize: 15,
    color: CattleColors.black,
    fontWeight: "500",
  },
  footer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: CattleColors.mediumLightGray,
    paddingTop: 6,
  },
});
