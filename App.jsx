import * as React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider as PaperProvider, MD3LightTheme } from "react-native-paper";
import { CattleColors } from "./styles/colors";
import LoginScreen from "./screens/LoginScreen";
import VerifyUserScreen from "./screens/VerifyUserScreen";
import RematesListScreen from "./screens/RematesListScreen";
import RemateDetailScreen from "./screens/RemateDetailScreen";
import LoteDetailScreen from "./screens/LoteDetailScreen";
import LoteListScreen from "./screens/LoteListScreen";
import HomeScreen from "./screens/HomeScreen";
import PendingApprovalScreen from "./screens/PendingApprovalScreen";
import AdminPanelScreen from "./screens/AdminPanelScreen";

const Stack = createNativeStackNavigator();

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: CattleColors.primary,
    secondary: CattleColors.accent,
    tertiary: CattleColors.black,
    background: CattleColors.neutral,
    surface: CattleColors.white,
    surfaceVariant: CattleColors.lightGray,
    onSurface: CattleColors.black,
    onBackground: CattleColors.black,
    outline: CattleColors.mediumLightGray,
    outlineVariant: CattleColors.mediumLightGray,
    error: CattleColors.error,
  },
};

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: CattleColors.primary,
    background: CattleColors.neutral,
    card: CattleColors.white,
    text: CattleColors.black,
    border: CattleColors.mediumLightGray,
    notification: CattleColors.accent,
  },
};

export default function App() {
  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="VerifyUser" component={VerifyUserScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="RematesList" component={RematesListScreen} />
          <Stack.Screen name="RemateDetail" component={RemateDetailScreen} />
          <Stack.Screen name="LotesList" component={LoteListScreen} />
          <Stack.Screen name="LoteDetail" component={LoteDetailScreenWrapper} />
          <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
          <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

function LoteDetailScreenWrapper(props) {
  return <HomeScreen {...props} />;
}