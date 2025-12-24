import HomeScreen from "./HomeScreen";
import { Provider as PaperProvider } from 'react-native-paper';
import { CattleColors } from "../styles/colors";
export default function LoteDetailScreenWrapper(props) {


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