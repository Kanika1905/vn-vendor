// app/components/ui/Header.js
// White screen header with optional back button, title + subtitle, and a right slot.
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "./Icon";
import { colors, spacing, radius, type } from "../../theme";

export default function Header({ title, subtitle, onBack, right, large = false }) {
  return (
    <View style={styles.wrap}>
      {onBack ? (
        <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={10} accessibilityLabel="Go back">
          <Icon name="back" size={22} color={colors.ink} />
        </TouchableOpacity>
      ) : null}

      <View style={styles.titles}>
        <Text style={large ? type.h1 : type.h2} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={[type.caption, styles.subtitle]} numberOfLines={1}>{subtitle}</Text> : null}
      </View>

      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  titles: { flex: 1 },
  subtitle: { marginTop: 2 },
  right: { marginLeft: "auto" },
});
