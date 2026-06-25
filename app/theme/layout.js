// app/theme/layout.js
// Spacing scale, corner radii, and elevation/shadow presets.
import colors from "./colors";

// 4-pt spacing scale.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Corner radii.
export const radius = {
  sm: 10,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  pill: 30,
  round: 999,
};

// Cross-platform shadow presets (iOS shadow* + Android elevation).
export const shadow = {
  none: {},
  card: {
    shadowColor: colors.primaryDeep,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  raised: {
    shadowColor: colors.primaryDeep,
    shadowOpacity: 0.1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  // Green glow under primary buttons / FABs.
  primary: {
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
};

export default { spacing, radius, shadow };
