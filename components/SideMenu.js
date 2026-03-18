import React from "react";
import { Modal, View, StyleSheet, TouchableOpacity } from "react-native";
import { IconButton, Text, Divider } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CattleColors, CattleShadows } from "../styles/colors";

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

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.menu}>
          <View style={styles.header}>
            <Text style={styles.title}>Menú</Text>
            <IconButton icon="close" size={20} onPress={onClose} />
          </View>
          <Divider style={styles.divider} />

          <TouchableOpacity style={styles.item} onPress={() => navigateTo("RematesList")}>
            <IconButton icon="home" size={20} iconColor={CattleColors.primary} />
            <Text style={styles.itemText}>Remates</Text>
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
              <IconButton icon="cog" size={20} iconColor={CattleColors.primary} />
              <Text style={styles.itemText}>Panel Admin</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.item} onPress={logout}>
            <IconButton icon="logout" size={20} iconColor={CattleColors.error} />
            <Text style={[styles.itemText, { color: CattleColors.error }]}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
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
  menu: {
    width: "78%",
    backgroundColor: CattleColors.white,
    paddingTop: 16,
    paddingHorizontal: 12,
    paddingBottom: 24,
    ...CattleShadows.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: CattleColors.primary,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: CattleColors.mediumLightGray,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  itemText: {
    fontSize: 15,
    color: CattleColors.black,
    fontWeight: "500",
  },
});
