import { MD3LightTheme } from "react-native-paper";
import { CattleColors } from "./colors";

/**
 * Tema MD3 alineado a CattleColors.
 * Sobrescribe TODOS los tokens que Material deja en lila/azul por defecto,
 * para que botones, chips, switches y radios se vean igual en cualquier dispositivo.
 */
export const cattlePaperColors = {
  ...MD3LightTheme.colors,

  primary: CattleColors.primary,
  onPrimary: CattleColors.white,
  primaryContainer: "#D5E6DE",
  onPrimaryContainer: CattleColors.primary,

  secondary: CattleColors.secondary,
  onSecondary: CattleColors.white,
  secondaryContainer: "#E2EFE8",
  onSecondaryContainer: CattleColors.secondary,

  // Antes era el “morado MD3”; lo pasamos a verde info
  tertiary: CattleColors.info,
  onTertiary: CattleColors.white,
  tertiaryContainer: "#DCEBE5",
  onTertiaryContainer: CattleColors.primary,

  error: CattleColors.error,
  onError: CattleColors.white,
  errorContainer: "#FADBD8",
  onErrorContainer: "#7A1C19",

  background: CattleColors.neutral,
  onBackground: CattleColors.black,
  surface: CattleColors.white,
  onSurface: CattleColors.black,
  surfaceVariant: CattleColors.lightGray,
  onSurfaceVariant: CattleColors.darkGray,

  outline: CattleColors.mediumGray,
  outlineVariant: CattleColors.mediumLightGray,

  inverseSurface: CattleColors.charcoal,
  inverseOnSurface: CattleColors.neutral,
  inversePrimary: "#A8CABB",

  elevation: {
    level0: "transparent",
    level1: CattleColors.white,
    level2: CattleColors.lightGray,
    level3: CattleColors.lightGray,
    level4: CattleColors.mediumLightGray,
    level5: CattleColors.mediumLightGray,
  },

  backdrop: CattleColors.overlay,
  shadow: CattleColors.black,
  scrim: "rgba(0,0,0,0.4)",

  surfaceDisabled: "rgba(17, 17, 17, 0.12)",
  onSurfaceDisabled: "rgba(17, 17, 17, 0.38)",
};

export const cattlePaperTheme = {
  ...MD3LightTheme,
  roundness: 10,
  colors: cattlePaperColors,
};
