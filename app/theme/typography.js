// app/theme/typography.js
// Type scale + reusable text presets.
//
// The mockup uses Nunito (UI) and Quicksand (numerals/brand). To keep the app
// dependency-light and guaranteed to boot, we default to the platform system
// font with matching weights. To switch to the real brand fonts later:
//   1. npx expo install expo-font @expo-google-fonts/nunito @expo-google-fonts/quicksand
//   2. load them in App.js with useFonts(...)
//   3. set `body`/`display` below to "Nunito_700Bold" / "Quicksand_700Bold" etc.
import { Platform } from "react-native";
import colors from "./colors";

// Font families — single place to swap in Google fonts.
export const fonts = {
  body: Platform.select({ ios: "System", android: "sans-serif", default: "System" }),
  display: Platform.select({ ios: "System", android: "sans-serif", default: "System" }),
};

export const sizes = {
  xs: 11,
  sm: 12.5,
  md: 14,
  lg: 15,
  xl: 17,
  xxl: 19,
  h2: 22,
  h1: 26,
};

export const weights = {
  medium: "500",
  semibold: "600",
  bold: "700",
  heavy: "800",
};

// Ready-to-spread text style presets.
export const type = {
  // Big marketing headline (login)
  display: { fontFamily: fonts.display, fontSize: sizes.h1, fontWeight: weights.heavy, color: colors.ink, letterSpacing: -0.4, lineHeight: sizes.h1 * 1.2 },
  // Page title ("My Orders", "Categories")
  h1: { fontFamily: fonts.body, fontSize: sizes.h2, fontWeight: weights.heavy, color: colors.ink },
  // Section / screen sub-title
  h2: { fontFamily: fonts.body, fontSize: sizes.xxl, fontWeight: weights.heavy, color: colors.ink },
  // Section header inside a list
  section: { fontFamily: fonts.body, fontSize: sizes.xl, fontWeight: weights.heavy, color: colors.ink },
  // Card titles / item names
  title: { fontFamily: fonts.body, fontSize: sizes.md, fontWeight: weights.bold, color: colors.ink },
  // Body copy
  body: { fontFamily: fonts.body, fontSize: sizes.lg, fontWeight: weights.medium, color: colors.inkMuted, lineHeight: sizes.lg * 1.5 },
  // Field labels (UPPER short labels)
  label: { fontFamily: fonts.body, fontSize: sizes.sm, fontWeight: weights.bold, color: colors.inkMuted },
  // Captions / meta
  caption: { fontFamily: fonts.body, fontSize: sizes.sm, fontWeight: weights.semibold, color: colors.inkSubtle },
  // Prices / numerals
  price: { fontFamily: fonts.display, fontSize: sizes.xl, fontWeight: weights.heavy, color: colors.primaryDark },
  // Button text
  button: { fontFamily: fonts.body, fontSize: sizes.xl, fontWeight: weights.heavy, color: colors.inkInverse },
};

export default { fonts, sizes, weights, type };
