// app/theme/colors.js
// Central color palette for the VendorNest design system.
// Every screen + component reads from here — never hard-code hex values in screens.

const colors = {
  // Brand
  primary: "#14A05A", // VendorNest green
  primaryDark: "#0F7A40", // price / emphasis green
  primaryDeep: "#0F3D24", // darkest brand green (headings on tinted bg)
  primarySoft: "#E7F6EC", // light green hero / banner background
  primaryTint: "#F1FAF4", // subtle green icon-chip background

  // Ink (text)
  ink: "#16271E", // primary text
  inkMuted: "#5B6C62", // secondary / labels
  inkSubtle: "#8A988E", // captions / meta
  inkFaint: "#9AA89F", // placeholders / disabled text
  inkInverse: "#FFFFFF",

  // Surfaces
  screen: "#F6F8F5", // app background
  surface: "#FFFFFF", // cards / sheets
  surfaceAlt: "#F4F7F4", // inputs / muted fills

  // Lines
  border: "#ECF0EC", // card borders / dividers
  borderStrong: "#E8EEE8", // input borders
  divider: "#F1F4F1",

  // Feedback
  danger: "#D14343",
  dangerSoft: "#FDF3F3",
  dangerBorder: "#F2D4D4",
  warning: "#C77700",
  warningSoft: "#FFF4E0",
  info: "#1E6BD6",
  infoSoft: "#E6F1FF",
  success: "#0F7A40",
  successSoft: "#E8F6EC",

  // Accents (cart badge etc.)
  accentAmber: "#F59E0B",

  // Pastel tile backgrounds (category / product thumbnails without images)
  tile: {
    amber: "#FEF3E2",
    blue: "#E9F4FE",
    violet: "#F0ECFE",
    rose: "#FDEAEA",
    sand: "#FBF3E0",
    mint: "#E8F6EC",
  },

  // Misc
  overlay: "rgba(15,39,30,0.45)",
  shadowTint: "rgba(15,55,32,0.13)",
  white: "#FFFFFF",
  black: "#16271E",
  transparent: "transparent",
};

// Ordered list of pastel tiles for deterministic round-robin assignment.
export const TILE_PALETTE = [
  colors.tile.amber,
  colors.tile.blue,
  colors.tile.violet,
  colors.tile.rose,
  colors.tile.sand,
  colors.tile.mint,
];

// Pick a stable pastel background from any string key (category/product name).
export function tileColorFor(key = "") {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash + key.charCodeAt(i)) % TILE_PALETTE.length;
  return TILE_PALETTE[hash];
}

export default colors;
