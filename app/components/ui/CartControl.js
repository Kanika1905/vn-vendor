// app/components/ui/CartControl.js
// Add-to-cart control for product cards. Shows a "+" button when the product
// isn't in the cart, and a "−  qty  +" stepper once it is (decrementing past 1
// removes it, via cartContext.updateQuantity).
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useCart } from "../../context/cartContext";
import Icon from "./Icon";
import { colors, radius, weights, shadow } from "../../theme";

export default function CartControl({ product, size = 40 }) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const item = cartItems.find((i) => i.product._id === product._id);
  const qty = item?.quantity || 0;
  const r = size >= 40 ? radius.md : radius.sm + 2;

  if (qty === 0) {
    return (
      <Pressable
        style={({ pressed }) => [styles.add, { width: size, height: size, borderRadius: r }, pressed && styles.pressed]}
        onPress={() => addToCart(product)}
        hitSlop={6}
        accessibilityLabel={`Add ${product.name} to cart`}
      >
        <Icon name="add" size={size * 0.45} color={colors.inkInverse} />
      </Pressable>
    );
  }

  const btn = Math.round(size * 0.66);
  return (
    <View style={[styles.stepper, { height: size, borderRadius: r }]}>
      <Pressable
        style={({ pressed }) => [styles.sBtn, { width: btn, height: btn }, pressed && styles.pressed]}
        onPress={() => updateQuantity(product._id, qty - 1)}
        hitSlop={6}
        accessibilityLabel="Decrease quantity"
      >
        <Icon name="remove" size={size * 0.4} color={colors.inkInverse} />
      </Pressable>
      <Text style={[styles.qty, { fontSize: size * 0.36 }]}>{qty}</Text>
      <Pressable
        style={({ pressed }) => [styles.sBtn, { width: btn, height: btn }, pressed && styles.pressed]}
        onPress={() => updateQuantity(product._id, qty + 1)}
        hitSlop={6}
        accessibilityLabel="Increase quantity"
      >
        <Icon name="add" size={size * 0.4} color={colors.inkInverse} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  add: { backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", ...shadow.primary },
  stepper: { flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: 3, ...shadow.primary },
  sBtn: { alignItems: "center", justifyContent: "center" },
  qty: { color: colors.inkInverse, fontWeight: weights.heavy, minWidth: 18, textAlign: "center" },
  pressed: { opacity: 0.85 },
});
