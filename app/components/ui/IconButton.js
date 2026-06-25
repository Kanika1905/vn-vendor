// app/components/ui/IconButton.js
// Rounded icon button with an optional count badge (used for the cart icon).
import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import Icon from "./Icon";
import { colors, radius, sizes, weights } from "../../theme";

export default function IconButton({ name, onPress, color = colors.primary, badge, size = 46, style }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.btn, { width: size, height: size }, pressed && styles.pressed, style]}
    >
      <Icon name={name} size={size * 0.47} color={color} />
      {badge > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.md,
    backgroundColor: colors.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.85 },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: colors.accentAmber,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  badgeText: { color: colors.inkInverse, fontSize: sizes.xs - 1, fontWeight: weights.heavy },
});
