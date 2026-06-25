// app/components/ui/Card.js
// Rounded white surface used for list rows, panels and summaries.
import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { colors, radius, spacing, shadow } from "../../theme";

export default function Card({ children, onPress, padded = true, style, elevated = false }) {
  const content = [
    styles.card,
    padded && styles.padded,
    elevated && shadow.card,
    style,
  ];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [...content, pressed && styles.pressed]}>
        {children}
      </Pressable>
    );
  }
  return <View style={content}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padded: { padding: spacing.md },
  pressed: { opacity: 0.96, transform: [{ scale: 0.995 }] },
});
