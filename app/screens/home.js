import React, { useEffect, useState, useContext, useMemo } from "react";
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, Alert,
  RefreshControl, Modal, TextInput, TouchableOpacity, ScrollView,
} from "react-native";
import { CONFIG } from "../constants";
import { AuthContext } from "../context/authContext";
import { useCart } from "../context/cartContext";
import RazorpayCheckout from "react-native-razorpay";
import { colors, spacing, radius, sizes, weights, type, shadow } from "../theme";
import {
  Screen, SearchBar, Chips, CategoryTile, ProductRow, SectionHeading,
  EmptyState, IconButton, Icon, Button,
} from "../components/ui";

export default function Home({ navigation, route }) {
  const { token, user } = useContext(AuthContext);
  const { totalItems } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Buy-now modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [ordering, setOrdering] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // ── Data ──
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

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${CONFIG.BASE_URL}/categories`);
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {}
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    const filterCategory = route?.params?.filterCategory;
    if (filterCategory) setSelectedCategory(filterCategory);
  }, [route?.params?.filterCategory]);

  // ── Buy-now flow (create order → Razorpay → verify). Backend contract unchanged. ──
  const openBuy = (product) => {
    setSelectedProduct(product);
    setQuantity("1");
    setOrderConfirmed(false);
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: selectedProduct._id, quantity: Number(quantity) }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Error", data.message || "Order failed");
        return;
      }

      const order = data.order;
      const payRes = await fetch(`${CONFIG.BASE_URL}/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: order.totalPrice }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) {
        Alert.alert("Error", "Could not start payment");
        return;
      }

      const options = {
        key: "rzp_test_xxxxxxxxxxxxx",
        amount: payData.razorpayOrder.amount,
        currency: "INR",
        name: "VendorNest",
        description: selectedProduct?.name,
        order_id: payData.razorpayOrder.id,
      };

      RazorpayCheckout.open(options)
        .then(async (paymentData) => {
          const verifyRes = await fetch(`${CONFIG.BASE_URL}/payment/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              razorpay_order_id: paymentData.razorpay_order_id,
              razorpay_payment_id: paymentData.razorpay_payment_id,
              razorpay_signature: paymentData.razorpay_signature,
              orderId: order._id,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) setOrderConfirmed(true);
          else Alert.alert("Payment Error", "Payment could not be verified");
        })
        .catch(() => Alert.alert("Payment Cancelled", "You cancelled the payment"));
    } catch {
      Alert.alert("Error", "Network error");
    } finally {
      setOrdering(false);
    }
  };

  // ── Derived ──
  const chipItems = useMemo(
    () => ["All", ...categories.map((c) => c.name)],
    [categories]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      const matchesSearch =
        p.name?.toLowerCase().includes(q) ||
        p.wholesalerId?.businessName?.toLowerCase().includes(q);
      const matchesCategory =
        selectedCategory === "All" || p.categoryId?.name === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  const businessName = user?.businessName || "Vendor";

  const ListHeader = (
    <View>
      {/* Quick category filter */}
      <Chips items={chipItems} value={selectedCategory} onChange={setSelectedCategory} style={styles.chips} />

      {/* Shop by category */}
      {categories.length > 0 && (
        <View style={styles.block}>
          <SectionHeading
            title="Shop by category"
            actionLabel="See all"
            onAction={() => navigation.navigate("categories")}
          />
          <View style={styles.catGrid}>
            {categories.slice(0, 4).map((cat) => (
              <View key={cat._id} style={styles.catCell}>
                <CategoryTile
                  variant="compact"
                  name={cat.name}
                  emoji={cat.emoji}
                  image={cat.image}
                  active={selectedCategory === cat.name}
                  onPress={() => navigation.navigate("categoryProducts", { categoryName: cat.name })}
                />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Products heading */}
      <SectionHeading
        title={selectedCategory === "All" ? "Popular near you" : selectedCategory}
        actionLabel={selectedCategory === "All" ? undefined : "Clear ✕"}
        onAction={() => setSelectedCategory("All")}
        style={styles.productsHeading}
      />
    </View>
  );

  return (
    <Screen>
      {/* Top bar: greeting + cart */}
      <View style={styles.topBar}>
        <View style={styles.greetWrap}>
          <Text style={styles.greetHi}>Welcome back 👋</Text>
          <Text style={styles.greetName} numberOfLines={1}>{businessName}</Text>
          {!!user?.address && (
            <View style={styles.locRow}>
              <Icon name="location" size={13} color={colors.primary} />
              <Text style={styles.locText} numberOfLines={1}>{user.address}</Text>
            </View>
          )}
        </View>
        <IconButton name="cart" badge={totalItems} onPress={() => navigation.navigate("Cart")} />
      </View>
      <View style={styles.searchWrap}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search products or wholesalers…" />
      </View>

      {/* Products */}
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 48 }} size="large" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ProductRow product={item} onPress={() => navigation.navigate("productDetails", { product: item })} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchProducts(); fetchCategories(); }}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No products yet"
              subtitle={
                selectedCategory !== "All"
                  ? `No products in "${selectedCategory}" yet.`
                  : "No products available right now."
              }
            />
          }
        />
      )}

      {/* Buy-now modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            {orderConfirmed ? (
              <>
                <View style={styles.successCircle}>
                  <Icon name="tick" size={34} color={colors.inkInverse} />
                </View>
                <Text style={styles.modalTitle}>Order placed!</Text>
                <Text style={styles.modalSub}>
                  Your order for {selectedProduct?.name} is confirmed.
                </Text>
                <Text style={styles.modalMeta}>
                  {quantity} unit{Number(quantity) > 1 ? "s" : ""} · ₹{Number(quantity) * (selectedProduct?.price || 0)}
                </Text>
                <Button title="Done" onPress={() => setModalVisible(false)} />
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Buy now</Text>
                <Text style={styles.modalSub}>
                  {selectedProduct?.name} · ₹{selectedProduct?.price} each
                </Text>
                <Text style={[type.label, { marginBottom: 8 }]}>Quantity</Text>
                <TextInput
                  style={styles.qtyInput}
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="1"
                  placeholderTextColor={colors.inkFaint}
                />
                <Text style={styles.modalTotal}>
                  Total: ₹{(Number(quantity) || 0) * (selectedProduct?.price || 0)}
                </Text>
                <View style={styles.modalActions}>
                  <Button title="Cancel" variant="secondary" onPress={() => setModalVisible(false)} style={styles.modalBtn} />
                  <Button title="Confirm" onPress={confirmOrder} loading={ordering} style={styles.modalBtn} />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: colors.surface, paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.md,
  },
  greetWrap: { flex: 1, marginRight: spacing.md },
  greetHi: { fontSize: sizes.sm + 0.5, fontWeight: weights.medium, color: colors.inkSubtle },
  greetName: { fontSize: sizes.xxl, fontWeight: weights.heavy, color: colors.ink },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  locText: { fontSize: sizes.sm, fontWeight: weights.semibold, color: colors.inkMuted, flexShrink: 1 },

  searchWrap: { backgroundColor: colors.surface, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },

  listContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxxl },
  chips: { marginBottom: spacing.xxl },
  block: { marginBottom: spacing.xxl },
  catGrid: { flexDirection: "row", justifyContent: "space-between" },
  catCell: { width: "23%" },
  productsHeading: { marginBottom: spacing.md },

  // Modal
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "center", paddingHorizontal: spacing.xxl },
  modalCard: { backgroundColor: colors.surface, borderRadius: radius.xxl, padding: spacing.xxl, ...shadow.raised },
  modalTitle: { ...type.h2, textAlign: "center", marginBottom: 4 },
  modalSub: { ...type.caption, textAlign: "center", marginBottom: spacing.lg },
  qtyInput: {
    borderWidth: 1.5, borderColor: colors.borderStrong, borderRadius: radius.md,
    paddingHorizontal: spacing.lg, paddingVertical: 12, fontSize: sizes.lg, color: colors.ink, marginBottom: spacing.sm,
  },
  modalTotal: { fontSize: sizes.lg, fontWeight: weights.heavy, color: colors.primaryDark, marginBottom: spacing.lg },
  modalActions: { flexDirection: "row", gap: spacing.md },
  modalBtn: { flex: 1 },
  successCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: spacing.lg, ...shadow.primary },
  modalMeta: { fontSize: sizes.md, fontWeight: weights.heavy, color: colors.primaryDark, textAlign: "center", marginBottom: spacing.lg },
});
