import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconButton, Text } from "react-native-paper";
import { CattleColors } from "../styles/colors";

export default function AppHeader({ title, onMenu, onLogout }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <IconButton
          icon="menu"
          size={22}
          iconColor={CattleColors.white}
          onPress={onMenu}
          style={styles.iconButton}
        />
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <IconButton
          icon="logout"
          size={20}
          iconColor={CattleColors.white}
          onPress={onLogout}
          style={styles.iconButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: CattleColors.primary,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: CattleColors.white,
    textAlign: "center",
  },
  iconButton: {
    margin: 0,
  },
});
