import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconButton, Text } from "react-native-paper";
import { CattleColors } from "../styles/colors";

export default function AppHeader({ title, onMenu, onLogout }) {
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
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
            source={require("../assets/header.png")}
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
    paddingTop: 4,
    paddingBottom: 6,
    backgroundColor: CattleColors.primary,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: "100%",
    maxWidth: 340,
    height: 52,
    resizeMode: "contain",
  },
  title: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: "700",
    color: CattleColors.accent,
    textAlign: "center",
  },
  iconButton: {
    margin: 0,
  },
});
