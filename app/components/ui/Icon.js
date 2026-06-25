// app/components/ui/Icon.js
// Thin wrapper around Feather (ships with @expo/vector-icons, already a dep).
// Centralising icons here means we can restyle / swap the icon set in one place.
import React from "react";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../theme";

// Semantic aliases → Feather glyph names. Use aliases in screens so intent is clear.
const ALIASES = {
  back: "chevron-left",
  forward: "chevron-right",
  next: "arrow-right",
  cart: "shopping-cart",
  orders: "shopping-bag",
  categories: "grid",
  profile: "user",
  location: "map-pin",
  add: "plus",
  remove: "minus",
  edit: "edit-2",
  logout: "log-out",
  help: "help-circle",
  close: "x",
  pay: "credit-card",
  delivery: "truck",
  verified: "check-circle",
  tick: "check",
};

export default function Icon({ name, size = 20, color = colors.ink, style }) {
  return <Feather name={ALIASES[name] || name} size={size} color={color} style={style} />;
}
