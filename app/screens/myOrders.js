// app/screens/myOrders.js
import React, { useEffect, useState, useContext } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, RefreshControl,
} from "react-native";
import { COLORS, FONTS, CONFIG } from "../constants";
import { AuthContext } from "../context/authContext";

const STATUS_CONFIG = {
  pending:          { color: "#F59E0B", bg: "#FEF3C7", label: "Pending" },
  accepted:         { color: "#3B82F6", bg: "#EFF6FF", label: "Accepted" },
  out_for_delivery: { color: "#8B5CF6", bg: "#F5F3FF", label: "Out for Delivery" },
  delivered:        { color: "#10B981", bg: "#ECFDF5", label: "Delivered" },
  cancelled:        { color: "#EF4444", bg: "#FEF2F2", label: "Cancelled" },
};

export default function MyOrders() {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => { fetchOrders(); }, []);

  const renderOrder = ({ item }) => {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardTopLeft}>
            <Text style={styles.productName}>{item.product?.name}</Text>
            <Text style={styles.wholesalerName}>
              🏪 {item.wholesaler?.businessName || "Wholesaler"}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBottom}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Qty</Text>
            <Text style={styles.metaValue}>{item.quantity} units</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Total</Text>
            <Text style={[styles.metaValue, { color: COLORS.primary }]}>₹{item.totalPrice}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>
              {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </Text>
          </View>
        </View>

        <View style={styles.addressRow}>
          <Text style={styles.addressIcon}>📍</Text>
          <Text style={styles.addressText}>{item.deliveryAddress}</Text>
        </View>
      </View>
    );
  };

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator color={COLORS.primary} size="large" />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSub}>{orders.length} order{orders.length !== 1 ? "s" : ""}</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrder}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>Your orders will appear here once you place them</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.lightGray,
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end",
  },
  headerTitle: { fontSize: FONTS.sizes.xxl, fontWeight: "700", color: COLORS.textPrimary },
  headerSub: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: "500" },
  card: {
    backgroundColor: COLORS.white, borderRadius: 16, marginBottom: 12,
    padding: 16, elevation: 2,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8,
    borderWidth: 1, borderColor: COLORS.lightGray,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardTopLeft: { flex: 1, marginRight: 10 },
  productName: { fontSize: FONTS.sizes.lg, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 4 },
  wholesalerName: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: "700" },
  divider: { height: 1, backgroundColor: COLORS.lightGray, marginVertical: 12 },
  cardBottom: { flexDirection: "row", justifyContent: "space-between" },
  metaItem: { alignItems: "center" },
  metaLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: "500", marginBottom: 2 },
  metaValue: { fontSize: FONTS.sizes.sm, fontWeight: "700", color: COLORS.textPrimary },
  addressRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 12 },
  addressIcon: { fontSize: 12, marginRight: 4, marginTop: 1 },
  addressText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, flex: 1 },
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 6 },
  emptySubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: "center", paddingHorizontal: 40 },
});