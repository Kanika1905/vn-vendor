// app/screens/myOrders.js
import React, { useState, useContext, useCallback, useMemo } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, RefreshControl, Pressable } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { CONFIG } from "../constants";
import { AuthContext } from "../context/authContext";
import { useCart } from "../context/cartContext";
import { colors, spacing, radius, sizes, weights } from "../theme";
import { Screen, Header, Card, Thumb, Badge, statusFor, Chips, EmptyState, Icon } from "../components/ui";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Delivered", value: "delivered" },
];
const ACTIVE_STATES = ["pending", "accepted", "out_for_delivery"];

export default function MyOrders() {
  const { token } = useContext(AuthContext);
  const { addToCart } = useCart();
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${CONFIG.BASE_URL}/vendor/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setOrders(data.orders || []);
      else Alert.alert("Error", data.message || "Failed to fetch orders");
    } catch {
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchOrders();
    }, [])
  );

  const visible = useMemo(() => {
    if (filter === "active") return orders.filter((o) => ACTIVE_STATES.includes(o.status));
    if (filter === "delivered") return orders.filter((o) => o.status === "delivered");
    return orders;
  }, [orders, filter]);

  const reorder = (product) => {
    if (!product) return;
    addToCart(product);
    Alert.alert("Added to cart", `${product.name} added to your cart.`);
  };

  const renderOrder = ({ item }) => {
    const st = statusFor(item.status);
    const isCancelled = item.status === "cancelled";
    const isDelivered = item.status === "delivered";
    const date = new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

    return (
      <Card padded={false} style={styles.card}>
        <View style={styles.top}>
          <Thumb uri={item.product?.images?.[0]} emoji="📦" colorKey={item.product?.name} size={50} rounded={radius.md} />
          <View style={styles.info}>
            <Text style={type_title} numberOfLines={1}>
              {item.product?.name} × {item.quantity}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {item.wholesaler?.businessName || "Wholesaler"} · {date}
            </Text>
          </View>
          <Badge label={st.label} fg={st.fg} bg={st.bg} />
        </View>

        {!isCancelled && (
          <>
            <View style={styles.divider} />
            <View style={styles.footer}>
              <Text style={styles.price}>₹{item.totalPrice}</Text>
              {isDelivered ? (
                <Pressable style={styles.actionGhost} onPress={() => reorder(item.product)}>
                  <Text style={styles.actionGhostText}>Reorder</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={styles.action}
                  onPress={() => navigation.getParent()?.navigate("trackOrder", { order: item })}
                >
                  <Text style={styles.actionText}>Track Order</Text>
                  <Icon name="next" size={15} color={colors.inkInverse} />
                </Pressable>
              )}
            </View>
          </>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <Screen>
        <Header title="My Orders" large />
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 48 }} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="My Orders" large />
      <View style={styles.filters}>
        <Chips items={FILTERS} value={filter} onChange={setFilter} />
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => item._id}
        renderItem={renderOrder}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md + 1 }} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState title="No orders yet" subtitle="Your orders will appear here once you place them." />
        }
      />
    </Screen>
  );
}

const type_title = { fontSize: sizes.md + 0.5, fontWeight: weights.bold, color: colors.ink };

const styles = StyleSheet.create({
  filters: { backgroundColor: colors.surface, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  list: { padding: spacing.xl, paddingBottom: spacing.xxxl },

  card: { padding: spacing.lg, borderRadius: radius.xxl + 2 },
  top: { flexDirection: "row", alignItems: "center", gap: spacing.md + 1, marginBottom: spacing.md + 1 },
  info: { flex: 1, minWidth: 0 },
  meta: { fontSize: sizes.sm, fontWeight: weights.semibold, color: colors.inkSubtle, marginTop: 2 },

  divider: { height: 1, backgroundColor: colors.divider, marginBottom: spacing.md + 1 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  price: { fontSize: sizes.xl, fontWeight: weights.heavy, color: colors.primaryDark },

  action: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: 9, borderRadius: radius.md },
  actionText: { fontSize: sizes.sm + 0.5, fontWeight: weights.heavy, color: colors.inkInverse },
  actionGhost: { backgroundColor: colors.primaryTint, borderWidth: 1.5, borderColor: "#CFE6D8", paddingHorizontal: spacing.lg, paddingVertical: 8, borderRadius: radius.md },
  actionGhostText: { fontSize: sizes.sm + 0.5, fontWeight: weights.heavy, color: colors.primaryDark },
});
