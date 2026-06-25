// app/components/ui/Chips.js
// Horizontal selectable filter chips (e.g. category quick-filter on Home / Orders).
import React from "react";
import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { colors, spacing, radius, sizes, weights } from "../../theme";

/**
 * @param {Array<{label:string, value:string}>|string[]} items
 * @param {string}   value     - currently selected value
 * @param {Function} onChange  - (value) => void
 */
export default function Chips({ items = [], value, onChange, style }) {
  const normalized = items.map((it) => (typeof it === "string" ? { label: it, value: it } : it));
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, style]}
      keyboardShouldPersistTaps="handled"
    >
      {normalized.map((it) => {
        const active = it.value === value;
        return (
          <Pressable
            key={it.value}
            onPress={() => onChange?.(it.value)}
            style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
          >
            <Text style={[styles.label, active ? styles.labelActive : styles.labelIdle]}>{it.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm + 1, paddingRight: spacing.lg },
  chip: { paddingHorizontal: spacing.lg, paddingVertical: 9, borderRadius: radius.pill, justifyContent: "center" },
  chipActive: { backgroundColor: colors.primary },
  chipIdle: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.borderStrong },
  label: { fontSize: sizes.md - 1, fontWeight: weights.bold },
  labelActive: { color: colors.inkInverse },
  labelIdle: { color: colors.inkMuted },
});
