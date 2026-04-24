import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "../constants";
import { useCart } from "../context/cartContext";

export default function ProductCard({ item, onBuyNow }) {
  const { addToCart } = useCart();
  const hasImage = item.images && item.images.length > 0;
  const isOutOfStock = item.quantity === 0;

  return (
    <View style={styles.card}>
      {/* Image */}
      <View style={styles.imgWrap}>
        {hasImage ? (
          <Image source={{ uri: item.images[0] }} style={styles.productImg} resizeMode="cover" />
        ) : (
          <View style={styles.imgPlaceholder}>
            <Text style={styles.imgPlaceholderText}>📦</Text>
          </View>
        )}
        {isOutOfStock && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockBadgeText}>Out of stock</Text>
          </View>
        )}
        {/* Wishlist heart */}
        <TouchableOpacity style={styles.heartBtn}>
          <Text style={styles.heartIcon}>♡</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        {item.wholesalerId?.businessName ? (
          <Text style={styles.sellerName}>by {item.wholesalerId.businessName}</Text>
        ) : null}

        {/* Price row */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{item.price}</Text>
          {item.mrp && item.mrp > item.price ? (
            <Text style={styles.mrp}>₹{item.mrp}</Text>
          ) : null}
        </View>

        {/* Buttons */}
        {isOutOfStock ? (
          <>
            <View style={[styles.btn, styles.btnDisabled]}>
              <Text style={styles.btnDisabledText}>Out of stock</Text>
            </View>
            <View style={[styles.btn, styles.btnDisabled, { marginTop: 6 }]}>
              <Text style={styles.btnDisabledText}>Out of stock</Text>
            </View>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.btn, styles.btnAdd]}
              onPress={() => addToCart(item)}
              activeOpacity={0.85}
            >
              <Text style={styles.btnAddText}>🛒  Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnBuy]}
              onPress={() => onBuyNow && onBuyNow(item)}
              activeOpacity={0.85}
            >
              <Text style={styles.btnBuyText}>Buy Now</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "#e8e8e8",
    marginBottom: 12,
  },

  // image
  imgWrap: {
    width: "100%", aspectRatio: 1,
    backgroundColor: "#f5f5f5", position: "relative",
  },
  productImg:     { width: "100%", height: "100%" },
  imgPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  imgPlaceholderText: { fontSize: 40 },

  outOfStockBadge: {
    position: "absolute", top: 8, left: 8,
    backgroundColor: "#E53935", borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  outOfStockBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },

  heartBtn: {
    position: "absolute", top: 8, right: 8,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center", justifyContent: "center",
  },
  heartIcon: { fontSize: 16, color: "#888" },

  // info
  cardInfo:   { padding: 10 },
  productName:{ fontSize: 13, fontWeight: "700", color: "#111", marginBottom: 2, lineHeight: 18 },
  sellerName: { fontSize: 11, color: COLORS.primary, fontWeight: "600", marginBottom: 6 },

  priceRow:   { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  price:      { fontSize: 16, fontWeight: "800", color: COLORS.primary },
  mrp:        { fontSize: 12, color: "#aaa", textDecorationLine: "line-through" },

  // buttons
  btn: {
    borderRadius: 8, paddingVertical: 9,
    alignItems: "center", justifyContent: "center",
  },
  btnAdd:         { backgroundColor: "#F97316", marginBottom: 6 },
  btnAddText:     { color: "#fff", fontWeight: "700", fontSize: 13 },
  btnBuy:         { backgroundColor: "#2E7D32" },
  btnBuyText:     { color: "#fff", fontWeight: "700", fontSize: 13 },
  btnDisabled:    { backgroundColor: "#f0f0f0" },
  btnDisabledText:{ color: "#E53935", fontWeight: "600", fontSize: 12 },
});