// app/components/ui/Button.js
// Primary action button with variants, loading state, and optional icons.
import React from "react";
import { Text, ActivityIndicator, StyleSheet, Pressable } from "react-native";
import Icon from "./Icon";
import { colors, spacing, radius, shadow, type } from "../../theme";

/**
 * @param {"primary"|"secondary"|"danger"|"ghost"} variant
 * @param {string}  title
 * @param {string}  iconLeft / iconRight  - Icon names
 * @param {boolean} loading / disabled
 * @param {boolean} block   - full width (default true)
 */
export default function Button({
  title,
  onPress,
  variant = "primary",
  iconLeft,
  iconRight,
  loading = false,
  disabled = false,
  block = true,
  size = "lg",
  style,
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const isDisabled = disabled || loading;
  const height = size === "sm" ? 46 : 54;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      android_ripple={{ color: "rgba(255,255,255,0.18)" }}
      style={({ pressed }) => [
        styles.base,
        { height, backgroundColor: v.bg, borderColor: v.border, borderWidth: v.border ? 1.5 : 0 },
        block && styles.block,
        variant === "primary" && shadow.primary,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {iconLeft ? <Icon name={iconLeft} size={19} color={v.fg} /> : null}
          <Text style={[type.button, { color: v.fg, fontSize: size === "sm" ? 15 : 16 }]}>{title}</Text>
          {iconRight ? <Icon name={iconRight} size={19} color={v.fg} /> : null}
        </>
      )}
    </Pressable>
  );
}

const VARIANTS = {
  primary: { bg: colors.primary, fg: colors.inkInverse, border: null },
  secondary: { bg: colors.primaryTint, fg: colors.primaryDark, border: "#CFE6D8" },
  danger: { bg: colors.dangerSoft, fg: colors.danger, border: colors.dangerBorder },
  ghost: { bg: colors.transparent, fg: colors.primary, border: null },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
  },
  block: { alignSelf: "stretch", width: "100%" },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.55 },
});
