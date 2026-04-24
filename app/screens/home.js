import React, { useEffect, useState, useContext } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl, TextInput, ScrollView, Modal,
} from "react-native";
import { COLORS, FONTS, CONFIG } from "../constants";
import { AuthContext } from "../context/authContext";

export default function Home({ navigation }) {
  const { token, user } = useContext(AuthContext); // ✅ add user
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [ordering, setOrdering] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false); // ✅

  const categories = ["All", "Fruits", "Vegetables", "Grocery", "Dairy", "Snacks and Beverages", "Household Supplies"];

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${CONFIG.BASE_URL}/products`);
      const data = await res.json();
      if (res.ok) setProducts(data.products || []);
      else Alert.alert("Error", data.message || "Failed to load products");
    } catch (err) {
      Alert.alert("Error", "Could not load products");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleOrder = (product) => {
    setSelectedProduct(product);
    setQuantity("1");
    setOrderConfirmed(false); // ✅ reset on each new order
    setModalVisible(true);
  };

  const confirmOrder = async () => {
    if (!quantity || isNaN(quantity) || Number(quantity) < 1) {
      Alert.alert("Error", "Please enter a valid quantity");
      return;
    }
    setOrdering(true);
    try {
      const res = await fetch(`${CONFIG.BASE_URL}/vendor/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: selectedProduct._id,
          quantity: Number(quantity),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrderConfirmed(true); // ✅ show success view
      } else {
        Alert.alert("Error", data.message || "Order failed");
      }
    } catch {
      Alert.alert("Error", "Network error");
    } finally {
      setOrdering(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.wholesalerId?.businessName?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || p.categoryId?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
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
      <TouchableOpacity style={styles.orderBtn} onPress={() => handleOrder(item)}>
        <Text style={styles.orderBtnText}>Order Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vendornest</Text>
        // Home.js — update avatar press
        <TouchableOpacity onPress={() => navigation.navigate("profile")}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.businessName?.[0]?.toUpperCase() || "V"}
            </Text>
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
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
          ListEmptyComponent={<Text style={styles.empty}>No products found</Text>}
        />
      )}

      {/* ✅ Modal with success screen */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalVisible(false);
          setOrderConfirmed(false);
        }}
      >
        <View style={styles.modalOverlay}>
          {orderConfirmed ? (
            // ✅ SUCCESS SCREEN
            <View style={styles.modalBox}>
              <View style={styles.successCircle}>
                <Text style={styles.successTick}>✓</Text>
              </View>
              <Text style={styles.successTitle}>Order Placed!</Text>
              <Text style={styles.successSubtitle}>
                Your order for{" "}
                <Text style={{ fontWeight: "700", color: COLORS.textPrimary }}>
                  {selectedProduct?.name}
                </Text>{" "}
                has been placed successfully.{"\n"}
                The wholesaler will deliver to your address.
              </Text>
              <Text style={styles.successMeta}>
                {quantity} unit{Number(quantity) > 1 ? "s" : ""}{"  •  "}
                ₹{Number(quantity) * (selectedProduct?.price || 0)}
              </Text>
              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => {
                  setModalVisible(false);
                  setOrderConfirmed(false);
                }}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // ✅ QUANTITY INPUT SCREEN
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Enter Quantity</Text>
              <Text style={styles.modalSubtitle}>
                {selectedProduct?.name}  •  ₹{selectedProduct?.price} each
              </Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
                placeholder="Enter quantity"
                placeholderTextColor={COLORS.gray}
                autoFocus
              />
              <Text style={styles.modalTotal}>
                Total: ₹{(Number(quantity) || 0) * (selectedProduct?.price || 0)}
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={confirmOrder}
                  disabled={ordering}
                >
                  {ordering ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.confirmBtnText}>Confirm</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
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
    marginHorizontal: 16, marginTop: 16, marginBottom: 4,
    backgroundColor: COLORS.white, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: FONTS.sizes.md, color: COLORS.textPrimary,
    borderWidth: 1, borderColor: COLORS.border,
  },
  card: {
    backgroundColor: COLORS.cardBg, marginHorizontal: 16,
    marginBottom: 12, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: COLORS.lightGray,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 2, marginTop: 8,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  businessName: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: "600" },
  price: { fontSize: FONTS.sizes.lg, fontWeight: "700", color: COLORS.textPrimary },
  productName: { fontSize: FONTS.sizes.lg, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 2 },
  category: { fontSize: 11, fontWeight: "700", color: COLORS.primary, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
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
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.white, alignItems: "center", justifyContent: "center", height: 32,
  },
  categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryChipText: { fontSize: 12, color: COLORS.textPrimary, fontWeight: "600" },
  categoryChipTextActive: { color: COLORS.white },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center",
  },
  modalBox: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 24, width: "85%",
  },
  modalTitle: { fontSize: FONTS.sizes.xl, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 4 },
  modalSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: 16 },
  modalInput: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: FONTS.sizes.lg, color: COLORS.textPrimary, marginBottom: 8,
  },
  modalTotal: { fontSize: FONTS.sizes.md, fontWeight: "700", color: COLORS.primary, marginBottom: 20 },
  modalActions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, paddingVertical: 12, alignItems: "center",
  },
  cancelBtnText: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, fontWeight: "600" },
  confirmBtn: {
    flex: 1, backgroundColor: COLORS.primary,
    borderRadius: 10, paddingVertical: 12, alignItems: "center",
  },
  confirmBtnText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: "600" },

  // ✅ Success styles
  successCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#10B981",
    justifyContent: "center", alignItems: "center",
    alignSelf: "center", marginBottom: 20,
  },
  successTick: { color: "#fff", fontSize: 40, fontWeight: "700" },
  successTitle: {
    fontSize: FONTS.sizes.xxl, fontWeight: "700",
    color: COLORS.textPrimary, textAlign: "center", marginBottom: 10,
  },
  successSubtitle: {
    fontSize: FONTS.sizes.sm, color: COLORS.textSecondary,
    textAlign: "center", lineHeight: 22, marginBottom: 12,
  },
  successMeta: {
    fontSize: FONTS.sizes.md, fontWeight: "700",
    color: COLORS.primary, textAlign: "center", marginBottom: 24,
  },
  doneBtn: {
    backgroundColor: "#10B981", borderRadius: 10,
    paddingVertical: 14, alignItems: "center",
  },
  doneBtnText: { color: "#fff", fontSize: FONTS.sizes.md, fontWeight: "600" },
});