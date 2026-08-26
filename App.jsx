import * as React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider as PaperProvider, MD3LightTheme } from "react-native-paper";
import { ActivityIndicator, View } from "react-native";
import * as Notifications from "expo-notifications";
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins";
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
import useOutbidWatcher from "./hook/useOutbidWatcher";
import { navigationRef, navigate } from "./services/navigationRef";
import { getLots } from "./services/lotService";

const Stack = createNativeStackNavigator();

const paperTheme = {
  ...MD3LightTheme,
  fonts: {
    ...MD3LightTheme.fonts,
    displayLarge: { ...MD3LightTheme.fonts.displayLarge, fontFamily: "Poppins_700Bold" },
    displayMedium: { ...MD3LightTheme.fonts.displayMedium, fontFamily: "Poppins_700Bold" },
    displaySmall: { ...MD3LightTheme.fonts.displaySmall, fontFamily: "Poppins_700Bold" },
    headlineLarge: { ...MD3LightTheme.fonts.headlineLarge, fontFamily: "Poppins_700Bold" },
    headlineMedium: { ...MD3LightTheme.fonts.headlineMedium, fontFamily: "Poppins_700Bold" },
    headlineSmall: { ...MD3LightTheme.fonts.headlineSmall, fontFamily: "Poppins_700Bold" },
    titleLarge: { ...MD3LightTheme.fonts.titleLarge, fontFamily: "Poppins_600SemiBold" },
    titleMedium: { ...MD3LightTheme.fonts.titleMedium, fontFamily: "Poppins_600SemiBold" },
    titleSmall: { ...MD3LightTheme.fonts.titleSmall, fontFamily: "Poppins_600SemiBold" },
    labelLarge: { ...MD3LightTheme.fonts.labelLarge, fontFamily: "Poppins_600SemiBold" },
    labelMedium: { ...MD3LightTheme.fonts.labelMedium, fontFamily: "Poppins_600SemiBold" },
    labelSmall: { ...MD3LightTheme.fonts.labelSmall, fontFamily: "Poppins_600SemiBold" },
    bodyLarge: { ...MD3LightTheme.fonts.bodyLarge, fontFamily: "Poppins_400Regular" },
    bodyMedium: { ...MD3LightTheme.fonts.bodyMedium, fontFamily: "Poppins_400Regular" },
    bodySmall: { ...MD3LightTheme.fonts.bodySmall, fontFamily: "Poppins_400Regular" },
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

function AppNotifications() {
  useOutbidWatcher();

  React.useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        const data = response.notification.request.content.data || {};
        if (data.type !== "outbid" || !data.loteId) return;

        try {
          const lots = await getLots();
          const list = Array.isArray(lots) ? lots : lots?.data ?? [];
          const lote = list.find((item) => Number(item.id) === Number(data.loteId));
          if (lote) {
            const remate =
              lote.remate ??
              (data.remateId != null ? { id: data.remateId } : undefined);
            navigate("LoteDetail", {
              lote: { ...lote, remate },
              remate,
              remateId: remate?.id ?? data.remateId,
            });
          }
        } catch (error) {
          console.log("[PUJA PUSH] no se pudo abrir el lote:", error?.message || error);
        }
      }
    );

    return () => subscription.remove();
  }, []);

  return null;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
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
      <NavigationContainer ref={navigationRef} theme={navTheme}>
        <AppNotifications />
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