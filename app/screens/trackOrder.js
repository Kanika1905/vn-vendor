// app/screens/trackOrder.js
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { colors, spacing, radius, sizes, weights, type } from "../theme";
import { Screen, Header, Card, Thumb, Icon, Button } from "../components/ui";

// Timeline steps; backend status maps to the active index.
const STEPS = [
  { key: "ordered", label: "Order placed", description: "Your order has been placed" },
  { key: "accepted", label: "Confirmed by wholesaler", description: "Your order has been confirmed" },
  { key: "out_for_delivery", label: "Out for delivery", description: "Your order is on its way" },
  { key: "delivered", label: "Delivered", description: "Order delivered successfully" },
];
const STATUS_TO_STEP = { pending: 0, accepted: 1, out_for_delivery: 2, delivered: 3 };

export default function TrackOrder() {
  const navigation = useNavigation();
  const { order } = useRoute().params;
  const activeStep = STATUS_TO_STEP[order.status] ?? 0;
  const current = STEPS[activeStep];

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <Screen>
      <Header
        title="Track Order"
        subtitle={`Order #${String(order._id).slice(-6).toUpperCase()}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Icon name={order.status === "delivered" ? "tick" : "delivery"} size={24} color={colors.inkInverse} />
          </View>
          <View>
            <Text style={styles.bannerTitle}>{current.label}</Text>
            <Text style={styles.bannerSub}>{current.description}</Text>
          </View>
        </View>

        {/* Live map entry */}
        <Button
          title="View live map"
          iconLeft="location"
          onPress={() => navigation.navigate("liveTrack", { order })}
          style={styles.liveBtn}
        />

        {/* Product summary */}
        <Card style={styles.product} padded>
          <Thumb uri={order.product?.images?.[0]} emoji="📦" colorKey={order.product?.name} size={54} rounded={radius.lg} />
          <View style={styles.productInfo}>
            <Text style={type.title} numberOfLines={2}>
              {order.product?.name} × {order.quantity}
            </Text>
            <Text style={styles.placed}>Placed {orderDate} · {order.wholesaler?.businessName || "Wholesaler"}</Text>
          </View>
          <Text style={styles.price}>₹{order.totalPrice}</Text>
        </Card>

        {/* Timeline */}
        <Text style={[type.section, styles.timelineHeading]}>Delivery progress</Text>
        <View>
          {STEPS.map((step, index) => {
            const completed = index <= activeStep;
            const active = index === activeStep;
            const isLast = index === STEPS.length - 1;
            return (
              <View key={step.key} style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  <View style={[styles.node, completed && styles.nodeDone, active && styles.nodeActive]}>
                    {completed && !active ? (
                      <Icon name="tick" size={15} color={colors.inkInverse} />
                    ) : active ? (
                      <View style={styles.nodeActiveDot} />
                    ) : (
                      <View style={styles.nodeIdleDot} />
                    )}
                  </View>
                  {!isLast && <View style={[styles.connector, index < activeStep && styles.connectorDone]} />}
                </View>
                <View style={styles.stepBody}>
                  <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{step.label}</Text>
                  <Text style={styles.stepDesc}>{step.description}</Text>
                  {active && (
                    <View style={styles.currentTag}>
                      <Text style={styles.currentTagText}>Current status</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.orderId}>Order ID: {order._id}</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  liveBtn: { marginBottom: spacing.xl },

  banner: { flexDirection: "row", alignItems: "center", gap: spacing.md + 2, backgroundColor: colors.primarySoft, borderRadius: radius.xxl + 2, padding: spacing.lg, marginBottom: spacing.xl },
  bannerIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  bannerTitle: { fontSize: sizes.lg + 1, fontWeight: weights.heavy, color: colors.primaryDeep },
  bannerSub: { fontSize: sizes.sm, fontWeight: weights.semibold, color: "#3E7B57", marginTop: 2 },

  product: { flexDirection: "row", alignItems: "center", gap: spacing.md + 1, marginBottom: spacing.xl },
  productInfo: { flex: 1, minWidth: 0 },
  placed: { fontSize: sizes.sm, fontWeight: weights.semibold, color: colors.inkSubtle, marginTop: 3 },
  price: { fontSize: sizes.lg + 1, fontWeight: weights.heavy, color: colors.primaryDark },

  timelineHeading: { marginBottom: spacing.lg },
  stepRow: { flexDirection: "row", gap: spacing.lg },
  stepLeft: { alignItems: "center", width: 32 },
  node: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#F0F3F0", borderWidth: 2, borderColor: "#E1E8E2", alignItems: "center", justifyContent: "center" },
  nodeDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  nodeActive: { backgroundColor: colors.primary, borderColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
  nodeActiveDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.inkInverse },
  nodeIdleDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#C7D1C9" },
  connector: { width: 3, flex: 1, minHeight: 28, backgroundColor: "#E1E8E2", marginVertical: 2 },
  connectorDone: { backgroundColor: colors.primary },

  stepBody: { flex: 1, paddingBottom: spacing.xl },
  stepLabel: { fontSize: sizes.md + 0.5, fontWeight: weights.bold, color: colors.ink },
  stepLabelActive: { color: colors.primary, fontWeight: weights.heavy },
  stepDesc: { fontSize: sizes.sm, fontWeight: weights.medium, color: colors.inkSubtle, marginTop: 2 },
  currentTag: { alignSelf: "flex-start", backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 4, marginTop: spacing.sm },
  currentTagText: { fontSize: sizes.xs, fontWeight: weights.heavy, color: colors.primaryDark },

  orderId: { fontSize: sizes.sm, fontWeight: weights.semibold, color: colors.inkFaint, textAlign: "center", marginTop: spacing.lg },
});
