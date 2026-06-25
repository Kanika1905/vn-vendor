// app/components/ui/QuantityStepper.js
// −  N  +  control used in the cart. Decrementing at 1 calls onDecrement (parent
// decides whether that removes the line item).
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Icon from "./Icon";
import { colors, radius, spacing, sizes, weights, shadow } from "../../theme";

export default function QuantityStepper({ value, onIncrement, onDecrement, min = 0 }) {
  return (
    <View style={styles.wrap}>
      <Pressable
        style={[styles.btn, styles.btnLight]}
        onPress={onDecrement}
        disabled={value <= min}
        hitSlop={6}
      >
        <Icon name="remove" size={14} color={value <= min ? colors.inkFaint : colors.primary} />
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable style={[styles.btn, styles.btnSolid]} onPress={onIncrement} hitSlop={6}>
        <Icon name="add" size={14} color={colors.inkInverse} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 1,
    backgroundColor: colors.primaryTint,
    borderRadius: radius.md - 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  btn: { width: 26, height: 26, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  btnLight: { backgroundColor: colors.surface, ...shadow.card },
  btnSolid: { backgroundColor: colors.primary },
  value: { fontSize: sizes.md, fontWeight: weights.heavy, color: colors.ink, minWidth: 18, textAlign: "center" },
});
