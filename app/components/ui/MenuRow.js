// app/components/ui/MenuRow.js
// Settings/profile list row: icon chip + label + chevron. Group several inside a Card.
import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import Icon from "./Icon";
import { colors, spacing, radius, sizes, weights } from "../../theme";

export default function MenuRow({ icon, label, onPress, last = false }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, !last && styles.divider, pressed && styles.pressed]}
    >
      <View style={styles.iconChip}>
        <Icon name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Icon name="forward" size={18} color="#C7D1C9" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md + 1, paddingHorizontal: spacing.lg, paddingVertical: 15 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  pressed: { opacity: 0.7 },
  iconChip: { width: 38, height: 38, borderRadius: radius.sm + 2, backgroundColor: colors.primaryTint, alignItems: "center", justifyContent: "center" },
  label: { flex: 1, fontSize: sizes.md + 0.5, fontWeight: weights.bold, color: colors.ink },
});
