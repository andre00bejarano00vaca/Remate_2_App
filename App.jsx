// import React from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
 import { Provider as PaperProvider } from "react-native-paper";
// import LoginScreen from "./screens/LoginScreen";
// import HomeScreen from "./screens/HomeScreen";
// import ListView from "./screens/ListView";
 import { CattleColors } from "./styles/colors";
// import VerifyUserScreen from "./screens/VerifyUserScreen";
// import PendingApprovalScreen from "./screens/PendingApprovalScreen";
 import AdminPanelScreen from "./screens/AdminPanelScreen";


// const Stack = createStackNavigator();

// // Tema profesional personalizado para React Native Paper
// const cattleTheme = {
//   colors: {
//     primary: CattleColors.primary,
//     accent: CattleColors.accent,
//     background: CattleColors.lightGray,
//     surface: CattleColors.white,
//     text: CattleColors.black,
//     onSurface: CattleColors.black,
//     onBackground: CattleColors.black,
//     placeholder: CattleColors.mediumGray,
//     backdrop: CattleColors.overlay,
//   },
// };

// export default function App() {
//   return (
//     <PaperProvider theme={cattleTheme}>
//       <NavigationContainer
//         theme={{
//           colors: {
//             primary: CattleColors.primary,
//             background: CattleColors.lightGray,
//             card: CattleColors.white,
//             text: CattleColors.black,
//             border: CattleColors.mediumLightGray,
//             notification: CattleColors.accent,
//           },
//         }}
//       >
        
//         <Stack.Navigator
//   initialRouteName="VerifyUser"
//   screenOptions={{ headerShown: false }}
// >
//   <Stack.Screen name="VerifyUser" component={VerifyUserScreen}/>
//   <Stack.Screen name="Login" component={LoginScreen}/>
//   <Stack.Screen name="Home" component={HomeScreen} />
//   <Stack.Screen name="ListView" component={ListView} />
//   <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
//   <Stack.Screen name="AdminPanel" component={AdminPanelScreen}/>
// </Stack.Navigator>
//       </NavigationContainer>
//     </PaperProvider>
//   );
// }

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from "./screens/LoginScreen";
import VerifyUserScreen from "./screens/VerifyUserScreen";
import RematesListScreen from './screens/RematesListScreen';
import RemateDetailScreen from './screens/RemateDetailScreen';
import LoteDetailScreen from './screens/LoteDetailScreen';
import LoteListScreen from './screens/LoteListScreen';
import HomeScreen from "./screens/HomeScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  
  return (
    
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="VerifyUser" component={VerifyUserScreen}/>
        <Stack.Screen name="Login" component={LoginScreen}/>
        <Stack.Screen name="RematesList" component={RematesListScreen} options={{ title: 'Remates' }} />
          <Stack.Screen name="LotesList" component={LoteListScreen} options={{ title: "Lotes" }} />
        <Stack.Screen name="LoteDetail" component={LoteDetailScreenWrapper} options={{ title: 'Detalle del Lote' }} />
        <Stack.Screen name="AdminPanel" component={AdminPanelScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
function LoteDetailScreenWrapper(props) {

  return (
    <PaperProvider theme={cattleTheme}>
      <HomeScreen {...props} />
    </PaperProvider>
  );
}
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