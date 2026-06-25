// app/components/ui/EmptyState.js
// Centered empty / zero-data placeholder.
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, sizes, weights } from "../../theme";

export default function EmptyState({ emoji = "📦", title, subtitle, action, style }) {
  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.emoji}>{emoji}</Text>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xxl, paddingTop: 64, gap: spacing.sm },
  emoji: { fontSize: 52, marginBottom: spacing.xs },
  title: { fontSize: sizes.xl, fontWeight: weights.heavy, color: colors.ink },
  subtitle: { fontSize: sizes.md, fontWeight: weights.medium, color: colors.inkSubtle, textAlign: "center", lineHeight: 20 },
  action: { marginTop: spacing.md },
});
