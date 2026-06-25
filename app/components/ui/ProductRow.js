// app/components/ui/ProductRow.js
// Horizontal product list item: thumb + name/sub/price + add button.
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Thumb from "./Thumb";
import CartControl from "./CartControl";
import { colors, radius, spacing, sizes, weights, type } from "../../theme";

export default function ProductRow({ product, onPress }) {
  const sub = [
    product.quantity != null ? `${product.quantity} ${product.unit || ""}`.trim() : null,
    product.wholesalerId?.businessName,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && onPress && styles.pressed]}>
      <Thumb uri={product.images?.[0]} emoji="📦" colorKey={product.name} size={62} rounded={radius.lg} />
      <View style={styles.info}>
        <Text style={type.title} numberOfLines={1}>{product.name}</Text>
        {sub ? <Text style={[type.caption, styles.sub]} numberOfLines={1}>{sub}</Text> : null}
        <Text style={styles.price}>
          ₹{product.price}
          <Text style={styles.priceUnit}> /unit</Text>
        </Text>
      </View>
      <CartControl product={product} size={40} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md + 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xxl,
    padding: spacing.md - 1,
  },
  pressed: { opacity: 0.95 },
  info: { flex: 1, minWidth: 0 },
  sub: { marginVertical: 2 },
  price: { fontSize: sizes.lg + 1, fontWeight: weights.heavy, color: colors.primaryDark },
  priceUnit: { fontSize: sizes.xs, fontWeight: weights.semibold, color: colors.inkFaint },
});
