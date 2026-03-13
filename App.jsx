import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Provider as PaperProvider } from "react-native-paper";
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
const Drawer = createDrawerNavigator();

const paperTheme = {
  colors: {
    primary: CattleColors.primary,
    accent: CattleColors.accent,
    background: CattleColors.neutral,
    surface: CattleColors.white,
    text: CattleColors.black,
    onSurface: CattleColors.black,
    onBackground: CattleColors.black,
    placeholder: CattleColors.mediumGray,
    backdrop: CattleColors.overlay,
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

const ROLE_PRIORITY = { 1: 1, 3: 2, 2: 3, 4: 4 };

function CustomDrawerContent(props) {
  const [roleId, setRoleId] = useState(null);
  const roleName = useMemo(() => {
    if (roleId === 2) return "ADMIN";
    if (roleId === 3) return "COLABORADOR";
    if (roleId === 4) return "SUPER_USUARIO";
    return "CLIENTE";
  }, [roleId]);

  useEffect(() => {
    const loadRole = async () => {
      try {
        const stored = await AsyncStorage.getItem("rol");
        if (!stored) {
          setRoleId(null);
          return;
        }
        let parsed;
        try {
          parsed = JSON.parse(stored);
        } catch {
          parsed = stored;
        }
        if (typeof parsed === "number") setRoleId(parsed);
        else if (typeof parsed === "string") setRoleId(parseInt(parsed, 10));
        else setRoleId(null);
      } catch {
        setRoleId(null);
      }
    };
    loadRole();
  }, []);

  const onLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["usuario", "isLoggedIn", "rol", "authToken"]);
    } finally {
      props.navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, paddingTop: 12 }}>
      <DrawerItemList {...props} />
      <DrawerItem label={`Rol: ${roleName}`} onPress={() => {}} inactiveTintColor={CattleColors.mediumGray} />
      <DrawerItem label="Cerrar sesión" onPress={onLogout} inactiveTintColor={CattleColors.error} />
    </DrawerContentScrollView>
  );
}

function MainDrawer() {
  const [roleId, setRoleId] = useState(null);
  const isAdmin = roleId === 2 || roleId === 4;

  useEffect(() => {
    const loadRole = async () => {
      try {
        const stored = await AsyncStorage.getItem("rol");
        if (!stored) {
          setRoleId(null);
          return;
        }
        let parsed;
        try {
          parsed = JSON.parse(stored);
        } catch {
          parsed = stored;
        }
        if (typeof parsed === "number") setRoleId(parsed);
        else if (typeof parsed === "string") setRoleId(parseInt(parsed, 10));
        else setRoleId(null);
      } catch {
        setRoleId(null);
      }
    };
    loadRole();
  }, []);

  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: CattleColors.primary },
        headerTintColor: CattleColors.white,
        headerTitleStyle: { fontWeight: "600" },
        drawerActiveTintColor: CattleColors.primary,
        drawerInactiveTintColor: CattleColors.darkGray,
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      initialRouteName="Remates"
    >
      <Drawer.Screen name="Remates" component={RematesListScreen} options={{ title: "Remates" }} />
      <Drawer.Screen name="Lotes" component={LoteListScreen} options={{ title: "Lotes" }} />
      <Drawer.Screen
        name="AdminPanel"
        component={AdminPanelScreen}
        options={{
          title: "Panel Admin",
          drawerItemStyle: isAdmin ? undefined : { display: "none" },
        }}
      />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="VerifyUser" component={VerifyUserScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="RematesList" component={MainDrawer} />
          <Stack.Screen name="RemateDetail" component={RemateDetailScreen} />
          <Stack.Screen name="LotesList" component={LoteListScreen} />
          <Stack.Screen name="LoteDetail" component={LoteDetailScreenWrapper} />
          <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

function LoteDetailScreenWrapper(props) {
  return <HomeScreen {...props} />;
}