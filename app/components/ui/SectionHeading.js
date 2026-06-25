// app/components/ui/SectionHeading.js
// "Section title" + optional right-aligned action ("See all", "Clear ✕").
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing, sizes, weights, type } from "../../theme";

export default function SectionHeading({ title, actionLabel, onAction, style }) {
  return (
    <View style={[styles.row, style]}>
      <Text style={type.section}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: spacing.md + 2 },
  action: { fontSize: sizes.sm + 0.5, fontWeight: weights.bold, color: colors.primary },
});
