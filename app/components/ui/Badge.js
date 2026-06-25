// app/components/ui/Badge.js
// Small status pill. Use the ORDER_STATUS map for order states so colors stay
// consistent across My Orders / Track Order.
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius, spacing, sizes, weights } from "../../theme";

// Maps backend order status → label + colors.
export const ORDER_STATUS = {
  pending: { label: "Pending", fg: colors.warning, bg: colors.warningSoft },
  accepted: { label: "Confirmed", fg: colors.info, bg: colors.infoSoft },
  out_for_delivery: { label: "Out for delivery", fg: colors.warning, bg: colors.warningSoft },
  delivered: { label: "Delivered", fg: colors.success, bg: colors.successSoft },
  cancelled: { label: "Cancelled", fg: colors.danger, bg: colors.dangerSoft },
};

export function statusFor(status) {
  return ORDER_STATUS[status] || ORDER_STATUS.pending;
}

export default function Badge({ label, fg = colors.success, bg = colors.successSoft, style }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: fg }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: radius.pill, paddingHorizontal: spacing.md - 1, paddingVertical: 6, alignSelf: "flex-start" },
  text: { fontSize: sizes.xs, fontWeight: weights.heavy },
});
