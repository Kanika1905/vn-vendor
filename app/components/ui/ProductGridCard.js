// app/components/ui/ProductGridCard.js
// Vertical product card for 2-up grids (Category Products). Designed to be used
// inside a FlatList numColumns=2 with columnWrapperStyle gap.
import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import CartControl from "./CartControl";
import { colors, radius, spacing, sizes, weights, tileColorFor, type } from "../../theme";

export default function ProductGridCard({ product, onPress }) {
  const hasImage = !!product.images?.[0];
  const sub = `${product.quantity != null ? `${product.quantity} ${product.unit || ""}`.trim() : ""}`;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed]}>
      <View style={[styles.imgWrap, { backgroundColor: tileColorFor(product.name) }]}>
        {hasImage ? (
          <Image source={{ uri: product.images[0] }} style={styles.img} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: 40 }}>📦</Text>
        )}
      </View>
      <Text style={[type.title, styles.name]} numberOfLines={2}>{product.name}</Text>
      {sub ? <Text style={[type.caption, styles.sub]} numberOfLines={1}>{sub}</Text> : null}
      <View style={styles.footer}>
        <Text style={styles.price}>₹{product.price}</Text>
        <CartControl product={product} size={34} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xxl,
    padding: spacing.md - 1,
  },
  pressed: { opacity: 0.95 },
  imgWrap: { width: "100%", height: 90, borderRadius: radius.lg, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm + 2, overflow: "hidden" },
  img: { width: "100%", height: "100%" },
  name: { fontSize: sizes.md - 0.5, lineHeight: 18 },
  sub: { marginTop: 2, marginBottom: spacing.sm + 1 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: "auto" },
  price: { fontSize: sizes.lg, fontWeight: weights.heavy, color: colors.primaryDark },
});
