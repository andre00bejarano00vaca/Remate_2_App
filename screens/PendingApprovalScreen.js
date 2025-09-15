// screens/PendingApprovalScreen.js
import React from "react";
import { View, Text } from "react-native";

export default function PendingApprovalScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Tu cuenta aún necesita ser aprobada por un administrador.</Text>
    </View>
  );
}
