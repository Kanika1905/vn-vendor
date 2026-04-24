// app/screens/myOrders.js
import React, { useState, useContext, useCallback } from "react";
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, Alert, RefreshControl, Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
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

  // Refetch every time this tab is focused
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchOrders();
    }, [])
  );

  const renderOrder = ({ item }) => {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const hasImage = item.product?.images?.[0];

    return (
      <View style={styles.row}>
        {/* Thumbnail — same as cart */}
        {hasImage ? (
          <Image source={{ uri: item.product.images[0] }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Text style={{ fontSize: 24 }}>📦</Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.product?.name}</Text>
          <Text style={styles.wholesaler}>
            🏪 {item.wholesaler?.businessName || "Wholesaler"}
          </Text>
          <Text style={styles.unit}>{item.quantity} units</Text>
          <Text style={styles.price}>₹{item.totalPrice}</Text>
        </View>

        {/* Right side — status + date */}
        <View style={styles.rightCol}>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short",
            })}
          </Text>
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
        <Text style={styles.headerSub}>
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrder}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchOrders(); }}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>
              Your orders will appear here once you place them
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F0" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5, borderBottomColor: "#e0e0e0",
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end",
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#111" },
  headerSub: { fontSize: 13, color: "#888", fontWeight: "500" },

  // Cart-style row card
  row: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 12, padding: 12, gap: 12,
    borderWidth: 0.5, borderColor: "#e8e8e8",
  },
  thumb: { width: 64, height: 64, borderRadius: 10 },
  thumbPlaceholder: {
    backgroundColor: "#edf7ed", alignItems: "center", justifyContent: "center",
  },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: "600", color: "#111", marginBottom: 2 },
  wholesaler: { fontSize: 12, color: "#888", marginBottom: 2 },
  unit: { fontSize: 12, color: "#888", marginBottom: 4 },
  price: { fontSize: 15, fontWeight: "700", color: "#2E7D32" },

  rightCol: { alignItems: "flex-end", gap: 8 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: "700" },
  date: { fontSize: 11, color: "#aaa", fontWeight: "500" },

  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 6 },
  emptySubtitle: {
    fontSize: 13, color: "#888", textAlign: "center", paddingHorizontal: 40,
  },
});