import * as React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider as PaperProvider, MD3LightTheme } from "react-native-paper";
import { ActivityIndicator, View } from "react-native";
import { useFonts, Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from "@expo-google-fonts/montserrat";
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
  fonts: {
    ...MD3LightTheme.fonts,
    displayLarge: { ...MD3LightTheme.fonts.displayLarge, fontFamily: "Montserrat_700Bold" },
    displayMedium: { ...MD3LightTheme.fonts.displayMedium, fontFamily: "Montserrat_700Bold" },
    displaySmall: { ...MD3LightTheme.fonts.displaySmall, fontFamily: "Montserrat_700Bold" },
    headlineLarge: { ...MD3LightTheme.fonts.headlineLarge, fontFamily: "Montserrat_700Bold" },
    headlineMedium: { ...MD3LightTheme.fonts.headlineMedium, fontFamily: "Montserrat_700Bold" },
    headlineSmall: { ...MD3LightTheme.fonts.headlineSmall, fontFamily: "Montserrat_700Bold" },
    titleLarge: { ...MD3LightTheme.fonts.titleLarge, fontFamily: "Montserrat_600SemiBold" },
    titleMedium: { ...MD3LightTheme.fonts.titleMedium, fontFamily: "Montserrat_600SemiBold" },
    titleSmall: { ...MD3LightTheme.fonts.titleSmall, fontFamily: "Montserrat_600SemiBold" },
    labelLarge: { ...MD3LightTheme.fonts.labelLarge, fontFamily: "Montserrat_600SemiBold" },
    labelMedium: { ...MD3LightTheme.fonts.labelMedium, fontFamily: "Montserrat_600SemiBold" },
    labelSmall: { ...MD3LightTheme.fonts.labelSmall, fontFamily: "Montserrat_600SemiBold" },
    bodyLarge: { ...MD3LightTheme.fonts.bodyLarge, fontFamily: "Montserrat_400Regular" },
    bodyMedium: { ...MD3LightTheme.fonts.bodyMedium, fontFamily: "Montserrat_400Regular" },
    bodySmall: { ...MD3LightTheme.fonts.bodySmall, fontFamily: "Montserrat_400Regular" },
  },
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
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={CattleColors.primary} />
      </View>
    );
  }

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