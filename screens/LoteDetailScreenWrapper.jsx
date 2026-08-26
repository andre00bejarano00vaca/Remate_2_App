import HomeScreen from "./HomeScreen";
import { Provider as PaperProvider } from "react-native-paper";
import { cattlePaperTheme } from "../styles/paperTheme";

/**
 * Envuelve HomeScreen con el mismo tema Cattle (por si se usa fuera del App root).
 * Preferí reutilizar cattlePaperTheme completo para no perder tokens MD3.
 */
export default function LoteDetailScreenWrapper(props) {
  return (
    <PaperProvider theme={cattlePaperTheme}>
      <HomeScreen {...props} />
    </PaperProvider>
  );
}
