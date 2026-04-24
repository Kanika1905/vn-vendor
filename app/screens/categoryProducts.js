import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity,
} from "react-native";
import { COLORS } from "../constants";
import { useCart } from "../context/cartContext";

export default function CategoryProducts({ navigation, route }) {
  const { categoryName } = route.params || {};
  const [search, setSearch] = useState("");
  const { totalItems } = useCart();

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.search}
          placeholder={`Search in ${categoryName || "category"}...`}
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category name pill */}
      <View style={styles.catPill}>
        <Text style={styles.catPillText}>{categoryName}</Text>
      </View>

      {/* Empty state */}
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📦</Text>
        <Text style={styles.emptyTitle}>No products yet</Text>
        <Text style={styles.emptySub}>
          Wholesaler hasn't added products{"\n"}in "{categoryName}" yet.
        </Text>
      </View>

      {/* Cart FAB */}
      {totalItems > 0 && (
        <TouchableOpacity
          style={styles.cartFab}
          onPress={() => navigation.navigate("Cart")}
        >
          <Text style={styles.cartFabIcon}>🛒</Text>
          <View style={styles.cartFabTextBlock}>
            <Text style={styles.cartFabTitle}>Cart</Text>
            <Text style={styles.cartFabSub}>{totalItems} item{totalItems > 1 ? "s" : ""}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F0" },

  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 12, paddingTop: 52, paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5, borderBottomColor: "#e0e0e0",
  },
  back: { fontSize: 22, color: COLORS.primary, fontWeight: "700", paddingHorizontal: 4 },
  search: {
    flex: 1, backgroundColor: "#f5f5f5", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 9,
    fontSize: 13, color: "#111",
    borderWidth: 0.5, borderColor: "#ddd",
  },

  catPill: {
    alignSelf: "flex-start",
    marginHorizontal: 16, marginTop: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  catPillText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  emptyContainer: {
    flex: 1, alignItems: "center", justifyContent: "center", gap: 10,
  },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#111" },
  emptySub: { fontSize: 13, color: "#888", textAlign: "center", lineHeight: 20 },

  cartFab: {
    position: "absolute", bottom: 16, right: 16,
    backgroundColor: COLORS.primary, borderRadius: 30,
    paddingHorizontal: 16, paddingVertical: 10,
    flexDirection: "row", alignItems: "center", gap: 10,
    elevation: 6, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8,
  },
  cartFabIcon: { fontSize: 26 },
  cartFabTextBlock: { flexDirection: "column" },
  cartFabTitle: { color: "#fff", fontWeight: "700", fontSize: 14, lineHeight: 17 },
  cartFabSub: { color: "#fff", fontSize: 11, lineHeight: 14 },
});