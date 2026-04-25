// app/screens/TrackOrder.js
import React from "react";
import {
  View, Text, StyleSheet, Image,
  ScrollView, TouchableOpacity, SafeAreaView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

// Steps in order. Map your backend status → step index
const STEPS = [
  {
    key: "ordered",
    label: "Ordered",
    icon: "🛒",
    description: "Your order has been placed",
  },
  {
    key: "accepted",
    label: "Shipped",
    icon: "✅",
    description: "Your order had been Shipped",
  },
  {
    key: "out_for_delivery",
    label: "Out for Delivery",
    icon: "🚚",
    description: "Your order is on its way",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: "📦",
    description: "Order delivered successfully",
  },
];

// Which step index is "active" for each backend status?
const STATUS_TO_STEP = {
  pending:          0,   // Ordered
  accepted:         1,   // Confirmed
  out_for_delivery: 2,   // Out for Delivery
  delivered:        3,   // Delivered
};

export default function TrackOrder() {
  const navigation = useNavigation();
  const route = useRoute();
  const { order } = route.params;

  const activeStep = STATUS_TO_STEP[order.status] ?? 0;
  const hasImage = order.product?.images?.[0];

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Product Card */}
        <View style={styles.productCard}>
          {hasImage ? (
            <Image
              source={{ uri: order.product.images[0] }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.productImage, styles.imagePlaceholder]}>
              <Text style={{ fontSize: 48 }}>📦</Text>
            </View>
          )}

          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {order.product?.name || "Product"}
            </Text>
            <Text style={styles.wholesalerName}>
              🏪 {order.wholesaler?.businessName || "Wholesaler"}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Text style={styles.metaLabel}>Qty</Text>
                <Text style={styles.metaValue}>{order.quantity} units</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaChip}>
                <Text style={styles.metaLabel}>Total</Text>
                <Text style={[styles.metaValue, { color: "#2E7D32" }]}>₹{order.totalPrice}</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaChip}>
                <Text style={styles.metaLabel}>Placed</Text>
                <Text style={styles.metaValue}>{orderDate}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tracking Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Order Status</Text>

          {STEPS.map((step, index) => {
            const isCompleted = index <= activeStep;
            const isActive = index === activeStep;
            const isLast = index === STEPS.length - 1;

            return (
              <View key={step.key} style={styles.stepRow}>
                {/* Left column: icon + connector line */}
                <View style={styles.stepLeft}>
                  <View style={[
                    styles.stepCircle,
                    isCompleted && styles.stepCircleCompleted,
                    isActive && styles.stepCircleActive,
                  ]}>
                    {isCompleted ? (
                      <Text style={styles.stepIcon}>{step.icon}</Text>
                    ) : (
                      <View style={styles.stepDot} />
                    )}
                  </View>
                  {/* Connector line — skip for last step */}
                  {!isLast && (
                    <View style={[
                      styles.connector,
                      index < activeStep && styles.connectorCompleted,
                    ]} />
                  )}
                </View>

                {/* Right column: label + description */}
                <View style={styles.stepContent}>
                  <Text style={[
                    styles.stepLabel,
                    isCompleted && styles.stepLabelCompleted,
                    isActive && styles.stepLabelActive,
                  ]}>
                    {step.label}
                  </Text>
                  <Text style={[
                    styles.stepDesc,
                    isActive && styles.stepDescActive,
                  ]}>
                    {step.description}
                  </Text>
                  {isActive && (
                    <View style={styles.activeTag}>
                      <Text style={styles.activeTagText}>Current Status</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Order ID footer */}
        <Text style={styles.orderId}>Order ID: {order._id}</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const ACTIVE_GREEN = "#2E7D32";
const LIGHT_GREEN  = "#E8F5E9";
const GREY         = "#C5C5C5";
const GREY_BG      = "#F0F0F0";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F0" },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  backBtn: {
    width: 40, height: 40,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
  },
  backArrow: { fontSize: 26, color: "#111", lineHeight: 30 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#111" },

  scroll: { padding: 16, paddingBottom: 40 },

  /* Product Card */
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "#e8e8e8",
    marginBottom: 16,
  },
  productImage: {
    width: "100%",
    height: 200,
  },
  imagePlaceholder: {
    backgroundColor: "#edf7ed",
    alignItems: "center",
    justifyContent: "center",
  },
  productInfo: { padding: 16 },
  productName: { fontSize: 17, fontWeight: "700", color: "#111", marginBottom: 4 },
  wholesalerName: { fontSize: 13, color: "#888", marginBottom: 14 },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  metaChip: { flex: 1, alignItems: "center" },
  metaLabel: { fontSize: 11, color: "#aaa", fontWeight: "500", marginBottom: 2 },
  metaValue: { fontSize: 13, fontWeight: "700", color: "#111" },
  metaDivider: { width: 0.5, height: 28, backgroundColor: "#e0e0e0" },

  /* Timeline Card */
  timelineCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.5,
    borderColor: "#e8e8e8",
    marginBottom: 16,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginBottom: 20,
  },

  stepRow: {
    flexDirection: "row",
    minHeight: 72,
  },

  /* Left: icon circle + connector */
  stepLeft: {
    alignItems: "center",
    width: 48,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GREY_BG,
    borderWidth: 2,
    borderColor: GREY,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleCompleted: {
    backgroundColor: LIGHT_GREEN,
    borderColor: ACTIVE_GREEN,
  },
  stepCircleActive: {
    // extra ring effect via shadow
    shadowColor: ACTIVE_GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  stepIcon: { fontSize: 18 },
  stepDot: {
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: GREY,
  },

  connector: {
    flex: 1,
    width: 2,
    backgroundColor: GREY_BG,
    marginTop: 2,
    marginBottom: 2,
    borderRadius: 2,
  },
  connectorCompleted: {
    backgroundColor: ACTIVE_GREEN,
    opacity: 0.4,
  },

  /* Right: text */
  stepContent: {
    flex: 1,
    paddingLeft: 14,
    paddingBottom: 20,
    paddingTop: 8,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#bbb",
    marginBottom: 2,
  },
  stepLabelCompleted: { color: "#444" },
  stepLabelActive: { color: ACTIVE_GREEN, fontSize: 15 },
  stepDesc: { fontSize: 12, color: "#ccc" },
  stepDescActive: { color: "#666" },
  activeTag: {
    alignSelf: "flex-start",
    marginTop: 6,
    backgroundColor: LIGHT_GREEN,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  activeTagText: { fontSize: 11, fontWeight: "700", color: ACTIVE_GREEN },

  /* Footer */
  orderId: {
    textAlign: "center",
    fontSize: 11,
    color: "#bbb",
    fontWeight: "500",
  },
});