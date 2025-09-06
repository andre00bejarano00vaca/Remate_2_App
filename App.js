import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import ListView from "./screens/ListView";
import LiveStreamScreen from "./screens/LiveStreamScreen";
import { CattleColors } from "./styles/colors";

const Stack = createStackNavigator();

// Tema profesional personalizado para React Native Paper
const cattleTheme = {
  colors: {
    primary: CattleColors.primary,
    accent: CattleColors.accent,
    background: CattleColors.lightGray,
    surface: CattleColors.white,
    text: CattleColors.black,
    onSurface: CattleColors.black,
    onBackground: CattleColors.black,
    placeholder: CattleColors.mediumGray,
    backdrop: CattleColors.overlay,
  },
};

export default function App() {
  return (
    <PaperProvider theme={cattleTheme}>
      <NavigationContainer
        theme={{
          colors: {
            primary: CattleColors.primary,
            background: CattleColors.lightGray,
            card: CattleColors.white,
            text: CattleColors.black,
            border: CattleColors.mediumLightGray,
            notification: CattleColors.accent,
          },
        }}
      >
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: CattleColors.lightGray },
            gestureEnabled: false,
            cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              };
            },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ListView" component={ListView} />
          <Stack.Screen name="LiveStream" component={LiveStreamScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

