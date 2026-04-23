import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl, TextInput, ScrollView,
} from "react-native";
import { COLORS, FONTS, CONFIG } from "../constants";

export default function Home({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Fruits", "Vegetables", "Grocery", "Dairy", "Snacks and Beverages", "Household Supplies"];

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${CONFIG.BASE_URL}/products`);
      const data = await res.json();
      console.log("Products response:", data); // 👈 add this to debug
      if (res.ok) setProducts(data.products || []);
      else Alert.alert("Error", data.message || "Failed to load products");
    } catch (err) {
      console.log("Fetch error:", err);
      Alert.alert("Error", "Could not load products");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleOrder = (product) => {
    Alert.alert(
      "Place Order",
      `Order 1 unit of ${product.name} for ₹${product.price}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => confirmOrder(product._id) },
      ]
    );
  };

  const confirmOrder = async (productId) => {
    try {
      const res = await fetch(`${CONFIG.BASE_URL}/vendor/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const data = await res.json();
      if (res.ok) Alert.alert("Success", "Order placed!");
      else Alert.alert("Error", data.message || "Order failed");
    } catch {
      Alert.alert("Error", "Network error");
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.wholesalerId?.businessName?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.categoryId?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {/* wholesalerId is populated so access .businessName */}
        <Text style={styles.businessName}>
          {item.wholesalerId?.businessName || "Wholesaler"}
        </Text>
        <Text style={styles.price}>₹{item.price}</Text>
      </View>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.category}>{item.categoryId?.name || "Category"}</Text>
      <Text style={styles.unit}>{item.quantity} {item.unit}</Text>
      {item.description ? (
        <Text style={styles.description}>{item.description}</Text>
      ) : null}
      <TouchableOpacity
        style={styles.orderBtn}
        onPress={() => handleOrder(item)}
      >
        <Text style={styles.orderBtnText}>Order Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vendornest</Text>
        <TouchableOpacity onPress={() => navigation.navigate("profile")}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>P</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search products or wholesaler..."
        placeholderTextColor={COLORS.gray}
        value={search}
        onChangeText={setSearch}
      />

      {/* ── CATEGORIES SCROLL ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              selectedCategory === cat && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === cat && styles.categoryChipTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchProducts(); }}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No products found</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 20,
    paddingTop: 56, paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.lightGray,
  },
  headerTitle: { fontSize: FONTS.sizes.xxl, fontWeight: "700", color: COLORS.textPrimary },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center",
  },
  avatarText: { color: COLORS.white, fontWeight: "700" },
  search: {
    marginHorizontal: 16, marginVertical: 8, backgroundColor: COLORS.white, marginTop: 16,
    marginBottom: 4,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: FONTS.sizes.md, color: COLORS.textPrimary,
    borderWidth: 1, borderColor: COLORS.border,
  },
  card: {
    backgroundColor: COLORS.cardBg, marginHorizontal: 16,
    marginBottom: 12, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: COLORS.lightGray,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
    marginTop:8,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  businessName: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: "600" },
  price: { fontSize: FONTS.sizes.lg, fontWeight: "700", color: COLORS.textPrimary },
  productName: { fontSize: FONTS.sizes.lg, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 2 },
  category: { fontSize: FONTS.sizes.xs || 11, fontWeight: "700", color: COLORS.primary, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  unit: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: 4 },
  description: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: 10 },
  orderBtn: {
    backgroundColor: COLORS.primary, borderRadius: 8,
    paddingVertical: 10, alignItems: "center", marginTop: 8,
  },
  orderBtnText: { color: COLORS.white, fontWeight: "600", fontSize: FONTS.sizes.md },
  empty: { textAlign: "center", marginTop: 60, color: COLORS.gray, fontSize: FONTS.sizes.md },
  categoriesScroll: { paddingHorizontal: 16, paddingTop: 4 },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,   // 👈 KEY: reduce height
    borderRadius: 20,     // pill shape
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    height: 32,           // 👈 FIX HEIGHT (important)
  },
  categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryChipText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: "600",
  }, categoryChipTextActive: { color: COLORS.white },
});