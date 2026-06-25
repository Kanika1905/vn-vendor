// app/components/ui/SearchBar.js
// Pill search input matching the mockup (icon + muted field on surfaceAlt).
import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import Icon from "./Icon";
import { colors, spacing, radius, sizes } from "../../theme";

export default function SearchBar({ value, onChangeText, placeholder = "Search…", style }) {
  return (
    <View style={[styles.wrap, style]}>
      <Icon name="search" size={18} color={colors.inkFaint} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: sizes.md + 0.5,
    color: colors.ink,
    padding: 0,
  },
});
