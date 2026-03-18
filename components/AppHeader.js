import React from "react";
import { View, StyleSheet } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { CattleColors } from "../styles/colors";

export default function AppHeader({ title, onMenu, onLogout }) {
  return (
    <View style={styles.container}>
      <IconButton
        icon="menu"
        size={24}
        iconColor={CattleColors.white}
        onPress={onMenu}
        style={styles.iconButton}
      />
      <Text style={styles.title}>{title}</Text>
      <IconButton
        icon="logout"
        size={22}
        iconColor={CattleColors.white}
        onPress={onLogout}
        style={styles.iconButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: CattleColors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: CattleColors.white,
    textAlign: "center",
  },
  iconButton: {
    margin: 0,
  },
});
