// app/components/ui/Avatar.js
// Initials avatar in a rounded-square (brand) or circle.
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius, sizes, weights } from "../../theme";

export default function Avatar({ name = "", size = 46, rounded = radius.md, onSurface = false, style }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "V";
  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: rounded, backgroundColor: onSurface ? colors.primarySoft : colors.primary },
        style,
      ]}
    >
      <Text style={[styles.text, { color: onSurface ? colors.primaryDark : colors.inkInverse, fontSize: size * 0.38 }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  text: { fontWeight: weights.heavy },
});
