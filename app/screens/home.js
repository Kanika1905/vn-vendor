import React, { useEffect, useState, useContext } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl, TextInput,
  ScrollView, Modal, Image, SectionList,
} from "react-native";
import { COLORS, CONFIG } from "../constants";
import { AuthContext } from "../context/authContext";
import { useCart } from "../context/cartContext";

// ─── Product Card ─────────────────────────────────────────────────────
function ProductCard({ item, onAddToCart }) {
  const hasImage = item.images && item.images.length > 0;
  return (
    <View style={styles.card}>
      <View style={styles.imgWrap}>
        {hasImage ? (
          <Image source={{ uri: item.images[0] }} style={styles.productImg} resizeMode="cover" />
        ) : (
          <View style={styles.imgPlaceholder}>
            <Text style={styles.imgPlaceholderText}>📦</Text>
          </View>
        )}
        <TouchableOpacity style={styles.plusBtn} onPress={() => onAddToCart(item)}>
          <Text style={styles.plusIcon}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cardInfo}>
        <View style={styles.priceRow}>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>₹{item.price}</Text>
          </View>
        </View>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.qtyText} numberOfLines={1}>{item.quantity} {item.unit}</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────
export default function Home({ navigation, route }) {
  const { token, user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [categorySections, setCategorySections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [ordering, setOrdering] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const { addToCart, totalItems } = useCart();

  // ── Fetch products ──
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${CONFIG.BASE_URL}/products`);
      const data = await res.json();
      if (res.ok) setProducts(data.products || []);
      else Alert.alert("Error", data.message || "Failed to load products");
    } catch {
      Alert.alert("Error", "Could not load products");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ── Fetch categories ──
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${CONFIG.BASE_URL}/categories`);
      const data = await res.json();
      const cats = data.categories || [];

      const groupMap = {};
      cats.forEach((cat) => {
        const group = cat.group || "Other";
        if (!groupMap[group]) groupMap[group] = [];
        groupMap[group].push(cat);
      });

      const built = Object.entries(groupMap).map(([group, items]) => ({
        title: group,
        data: [items],
      }));
      setCategorySections(built);
    } catch { }
    finally { setCatLoading(false); }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ── Handle filterCategory param from Categories tab ──
  useEffect(() => {
    const filterCategory = route?.params?.filterCategory;
    if (filterCategory) setSelectedCategory(filterCategory);
  }, [route?.params?.filterCategory]);

  const confirmOrder = async () => {
    if (!quantity || isNaN(quantity) || Number(quantity) < 1) {
      Alert.alert("Error", "Please enter a valid quantity");
      return;
    }
    setOrdering(true);
    try {
      const res = await fetch(`${CONFIG.BASE_URL}/vendor/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: selectedProduct._id, quantity: Number(quantity) }),
      });
      const data = await res.json();
      if (res.ok) setOrderConfirmed(true);
      else Alert.alert("Error", data.message || "Order failed");
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

  // ── Category grid renderer ──
  const renderCatGrid = ({ item: cats }) => (
    <View style={styles.catGrid}>
      {cats.map((cat) => (
        <TouchableOpacity
          key={cat._id}
          style={styles.catCard}
          onPress={() => navigation.navigate("categoryProducts", { categoryName: cat.name })}
        >
          <View style={[
            styles.emojiWrap,
            selectedCategory === cat.name && styles.emojiWrapActive,
          ]}>
            <Text style={styles.catEmoji}>{cat.emoji || "📦"}</Text>
          </View>
          <Text
            style={[styles.catName, selectedCategory === cat.name && styles.catNameActive]}
            numberOfLines={2}
          >
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // ── Header component for FlatList (categories + search) ──
  const ListHeader = () => (
    <>
      {/* Search */}
      <TextInput
        style={styles.search}
        placeholder="Search products or wholesaler..."
        placeholderTextColor={COLORS.gray}
        value={search}
        onChangeText={setSearch}
      />

      {/* All chip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipScroll}
        style={{ flexGrow: 0 }}
      >
        <TouchableOpacity
          style={[styles.chip, selectedCategory === "All" && styles.chipActive]}
          onPress={() => setSelectedCategory("All")}
        >
          <Text style={[styles.chipText, selectedCategory === "All" && styles.chipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Category sections */}
      {catLoading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 16 }} />
      ) : (
        <SectionList
          sections={categorySections}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderCatGrid}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          )}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 8 }}
        />
      )}

      {/* Products heading */}
      <View style={styles.productsHeader}>
        <Text style={styles.productsTitle}>
          {selectedCategory === "All" ? "All Products" : selectedCategory}
        </Text>
        {selectedCategory !== "All" && (
          <TouchableOpacity onPress={() => setSelectedCategory("All")}>
            <Text style={styles.clearFilter}>Clear ✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vendornest</Text>
        <TouchableOpacity onPress={() => navigation.navigate("profile")}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.businessName?.[0]?.toUpperCase() || "V"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Product grid with header */}
      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ProductCard item={item} onAddToCart={addToCart} />}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={<ListHeader />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchProducts(); fetchCategories(); }}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyTitle}>No products yet</Text>
              <Text style={styles.emptySub}>
                {selectedCategory !== "All"
                  ? `No products in "${selectedCategory}" yet.\nWholesaler will add them soon.`
                  : "No products available right now."}
              </Text>
            </View>
          }
        />
      )}

      {/* Order Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => { setModalVisible(false); setOrderConfirmed(false); }}
      >
        <View style={styles.modalOverlay}>
          {orderConfirmed ? (
            <View style={styles.modalBox}>
              <View style={styles.successCircle}>
                <Text style={styles.successTick}>✓</Text>
              </View>
              <Text style={styles.successTitle}>Order Placed!</Text>
              <Text style={styles.successSubtitle}>
                Your order for <Text style={{ fontWeight: "700" }}>{selectedProduct?.name}</Text> has been placed.{"\n"}
                Wholesaler will deliver to your address.
              </Text>
              <Text style={styles.successMeta}>
                {quantity} unit{Number(quantity) > 1 ? "s" : ""}{"  •  "}
                ₹{Number(quantity) * (selectedProduct?.price || 0)}
              </Text>
              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => { setModalVisible(false); setOrderConfirmed(false); }}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
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
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={confirmOrder} disabled={ordering}>
                  {ordering
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.confirmBtnText}>Confirm</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

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

// ─── Styles ───────────────────────────────────────────────────────────
const CARD_SIZE = "31%";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F0" },

  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14,
    backgroundColor: "#fff", borderBottomWidth: 0.5, borderBottomColor: "#e0e0e0",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111" },
  avatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  search: {
    marginHorizontal: 12, marginTop: 12, marginBottom: 4,
    backgroundColor: "#fff", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 9,
    fontSize: 13, color: "#111",
    borderWidth: 0.5, borderColor: "#ddd",
  },

  // ── All chip ──
  chipScroll: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 20, borderWidth: 0.5, borderColor: "#ddd",
    backgroundColor: "#fff", height: 30, justifyContent: "center",
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, color: "#555", fontWeight: "600" },
  chipTextActive: { color: "#fff" },

  // ── Category sections ──
  sectionHeader: {
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
    backgroundColor: "#F5F5F0",
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111" },

  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 10,
  },
  catCard: {
    width: "30%",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#e8e8e8",
    marginBottom: 6,
    gap: 8,
  },
  emojiWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  emojiWrapActive: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: "#edf7ed",
  },
  catEmoji: { fontSize: 30 },
  catName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#111",
    textAlign: "center",
    lineHeight: 15,
  },
  catNameActive: { color: COLORS.primary },

  // ── Products heading ──
  productsHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  productsTitle: { fontSize: 15, fontWeight: "700", color: "#111" },
  clearFilter: { fontSize: 12, color: "#E0115F", fontWeight: "600" },

  // ── Product grid ──
  listContent: { paddingHorizontal: 10, paddingBottom: 100, paddingTop: 4 },
  row: { justifyContent: "space-between", marginBottom: 10 },

  card: {
    width: CARD_SIZE,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "#e8e8e8",
  },
  imgWrap: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#f0f0f0",
    position: "relative",
  },
  productImg: { width: "100%", height: "100%" },
  imgPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#edf7ed" },
  imgPlaceholderText: { fontSize: 30 },
  plusBtn: {
    position: "absolute", bottom: 6, right: 6,
    width: 28, height: 28, borderRadius: 7,
    backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#E0115F",
    alignItems: "center", justifyContent: "center",
  },
  plusIcon: { color: "#E0115F", fontSize: 18, fontWeight: "700", lineHeight: 20 },
  cardInfo: { padding: 7 },
  priceRow: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
  priceBadge: { backgroundColor: "#2E7D32", borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  priceText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  productName: { fontSize: 12, fontWeight: "600", color: "#111", marginBottom: 2, lineHeight: 16 },
  qtyText: { fontSize: 11, color: "#888" },

  // ── Empty ──
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingTop: 40, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  emptySub: { fontSize: 13, color: "#888", textAlign: "center", lineHeight: 20 },

  // ── Modal ──
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: "#fff", borderRadius: 18, padding: 24, width: "85%" },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#111", marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: "#666", marginBottom: 16 },
  modalInput: {
    borderWidth: 0.5, borderColor: "#ddd", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 16, color: "#111", marginBottom: 8,
  },
  modalTotal: { fontSize: 15, fontWeight: "700", color: COLORS.primary, marginBottom: 20 },
  modalActions: { flexDirection: "row", gap: 10 },
  cancelBtn: { flex: 1, borderWidth: 0.5, borderColor: "#ddd", borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  cancelBtnText: { fontSize: 14, color: "#666", fontWeight: "600" },
  confirmBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  confirmBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  successCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#10B981", justifyContent: "center", alignItems: "center", alignSelf: "center", marginBottom: 16 },
  successTick: { color: "#fff", fontSize: 36, fontWeight: "700" },
  successTitle: { fontSize: 20, fontWeight: "700", color: "#111", textAlign: "center", marginBottom: 8 },
  successSubtitle: { fontSize: 13, color: "#666", textAlign: "center", lineHeight: 20, marginBottom: 10 },
  successMeta: { fontSize: 14, fontWeight: "700", color: COLORS.primary, textAlign: "center", marginBottom: 20 },
  doneBtn: { backgroundColor: "#10B981", borderRadius: 10, paddingVertical: 13, alignItems: "center" },
  doneBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  // ── Cart FAB ──
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
  cartFabSub: { color: "#fff", fontSize: 11, fontWeight: "500", lineHeight: 14 },
});