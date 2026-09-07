import React from "react";
import { View, StyleSheet, Image } from "react-native";
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
        <View style={styles.center}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.logo}
            accessibilityLabel="FERCOGAN Eventos Élite Prelance"
          />
          {title ? (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          ) : null}
        </View>
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
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: CattleColors.primary,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: "100%",
    maxWidth: 220,
    height: 44,
    resizeMode: "contain",
  },
  title: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "600",
    color: CattleColors.accent,
    textAlign: "center",
  },
  iconButton: {
    margin: 0,
  },
});
