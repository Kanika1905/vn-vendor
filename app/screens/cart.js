import React, { useContext, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, Alert, ActivityIndicator, Modal, Pressable,
} from "react-native";
import { useCart } from "../context/cartContext";
import { AuthContext } from "../context/authContext";
import { CONFIG } from "../constants";
import RazorpayCheckout from "react-native-razorpay";
import { colors, spacing, radius, sizes, weights, type, shadow } from "../theme";
import { Screen, Header, Card, Thumb, QuantityStepper, Button, EmptyState, Icon } from "../components/ui";

export default function Cart({ navigation }) {
  const { cartItems, updateQuantity, clearCart, totalPrice } = useCart();
  const { token } = useContext(AuthContext);
  const [ordering, setOrdering] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiStep, setUpiStep] = useState("input"); // input | processing | success

  // ── COD ──
  const placeOrder = async () => {
    if (cartItems.length === 0) return;
    setOrdering(true);
    try {
      await Promise.all(
        cartItems.map((item) =>
          fetch(`${CONFIG.BASE_URL}/vendor/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ productId: item.product._id, quantity: item.quantity }),
          })
        )
      );
      clearCart();
      Alert.alert("Order placed!", "Your order has been placed successfully.", [
        { text: "OK", onPress: () => navigation.navigate("vendorTabs", { screen: "myOrders" }) },
      ]);
    } catch {
      Alert.alert("Error", "Failed to place order. Try again.");
    } finally {
      setOrdering(false);
    }
  };

  const handleCOD = () => {
    Alert.alert("Cash on delivery", `Confirm order of ₹${totalPrice} with Cash on Delivery?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Confirm", onPress: placeOrder },
    ]);
  };

  // ── Online / UPI (Razorpay). Backend contract unchanged. ──
  const handleUpiPay = async () => {
    setUpiStep("processing");
    try {
      const payRes = await fetch(`${CONFIG.BASE_URL}/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: totalPrice }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) {
        setUpiStep("input");
        Alert.alert("Error", "Could not start payment");
        return;
      }

      const options = {
        key: "rzp_test_T3WWMcXHeoqiRN",
        amount: payData.razorpayOrder.amount,
        currency: "INR",
        name: "VendorNest",
        description: `${cartItems.length} item(s)`,
        order_id: payData.razorpayOrder.id,
      };

      const paymentData = await RazorpayCheckout.open(options);

      const placedOrders = await Promise.all(
        cartItems.map((item) =>
          fetch(`${CONFIG.BASE_URL}/vendor/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ productId: item.product._id, quantity: item.quantity }),
          }).then((r) => r.json())
        )
      );

      await Promise.all(
        placedOrders.map((res) =>
          fetch(`${CONFIG.BASE_URL}/payment/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              razorpay_order_id: paymentData.razorpay_order_id,
              razorpay_payment_id: paymentData.razorpay_payment_id,
              razorpay_signature: paymentData.razorpay_signature,
              orderId: res.order._id,
            }),
          })
        )
      );

      setUpiStep("success");
    } catch (err) {
      setUpiStep("input");
      if (err?.code === 2 || err?.description) Alert.alert("Payment cancelled", "You cancelled the payment");
      else Alert.alert("Error", "Payment failed. Try again.");
    }
  };

  const handleUpiSuccess = () => {
    setShowUpiModal(false);
    setUpiStep("input");
    clearCart();
    navigation.navigate("vendorTabs", { screen: "myOrders" });
  };

  const closeUpiModal = () => {
    setShowUpiModal(false);
    setUpiStep("input");
  };

  // ── Empty ──
  if (cartItems.length === 0) {
    return (
      <Screen>
        <Header title="Your Cart" onBack={() => navigation.goBack()} />
        <EmptyState
          emoji="🛒"
          title="Your cart is empty"
          subtitle="Browse products and add items to get started."
          action={<Button title="Browse products" variant="secondary" block={false} onPress={() => navigation.goBack()} />}
        />
      </Screen>
    );
  }

  const renderItem = ({ item }) => (
    <Card style={styles.row} padded>
      <Thumb uri={item.product.images?.[0]} emoji="📦" colorKey={item.product.name} size={58} rounded={radius.lg} />
      <View style={styles.info}>
        <Text style={type.title} numberOfLines={1}>{item.product.name}</Text>
        <Text style={styles.linePrice}>
          ₹{item.product.price * item.quantity}
          <Text style={styles.lineUnit}>  · ₹{item.product.price}×{item.quantity}</Text>
        </Text>
      </View>
      <QuantityStepper
        value={item.quantity}
        min={0}
        onDecrement={() => updateQuantity(item.product._id, item.quantity - 1)}
        onIncrement={() => updateQuantity(item.product._id, item.quantity + 1)}
      />
    </Card>
  );

  return (
    <Screen>
      <Header
        title="Your Cart"
        subtitle={`${cartItems.length} item${cartItems.length > 1 ? "s" : ""}`}
        onBack={() => navigation.goBack()}
        right={
          <Pressable onPress={clearCart} hitSlop={8}>
            <Text style={styles.clear}>Clear</Text>
          </Pressable>
        }
      />

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.product._id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <Card style={styles.summary} padded={false}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{totalPrice}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>FREE</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{totalPrice}</Text>
            </View>
          </Card>
        }
      />

      {/* Checkout bar */}
      <View style={styles.checkout}>
        <View style={styles.checkoutRow}>
          <View style={styles.checkoutBtnSmall}>
            <Button title="Cash" variant="secondary" iconLeft="pay" onPress={handleCOD} loading={ordering} />
          </View>
          <View style={styles.checkoutBtnLarge}>
            <Button title={`Pay ₹${totalPrice}`} iconLeft="credit-card" onPress={() => setShowUpiModal(true)} disabled={ordering} />
          </View>
        </View>
      </View>

      {/* UPI / Online payment sheet */}
      <Modal visible={showUpiModal} transparent animationType="slide" onRequestClose={closeUpiModal}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            {upiStep === "input" && (
              <>
                <View style={styles.sheetHeader}>
                  <Text style={type.h2}>Pay online</Text>
                  <Pressable onPress={closeUpiModal} hitSlop={8}><Icon name="close" size={20} color={colors.inkSubtle} /></Pressable>
                </View>
                <View style={styles.amountBadge}>
                  <Text style={styles.amountLabel}>Amount to pay</Text>
                  <Text style={styles.amountValue}>₹{totalPrice}</Text>
                </View>
                <Text style={[type.caption, { marginBottom: spacing.md }]}>Pay securely using any UPI app or card</Text>
                <Button title={`Pay ₹${totalPrice}`} onPress={handleUpiPay} />
                <Text style={styles.secure}>🔒 Secured by Razorpay · 256-bit encrypted</Text>
              </>
            )}

            {upiStep === "processing" && (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[type.h2, { marginTop: spacing.md }]}>Processing payment…</Text>
                <Text style={type.caption}>Please don't close this screen</Text>
              </View>
            )}

            {upiStep === "success" && (
              <View style={styles.center}>
                <View style={styles.successCircle}><Icon name="tick" size={32} color={colors.inkInverse} /></View>
                <Text style={type.h2}>Payment successful!</Text>
                <Text style={[type.caption, { marginBottom: spacing.lg }]}>₹{totalPrice} paid successfully</Text>
                <Button title="Continue" iconRight="next" onPress={handleUpiSuccess} />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  clear: { fontSize: sizes.sm, fontWeight: weights.bold, color: colors.danger },
  list: { padding: spacing.xl, paddingBottom: 170 },

  row: { flexDirection: "row", alignItems: "center", gap: spacing.md + 1 },
  info: { flex: 1, minWidth: 0 },
  linePrice: { fontSize: sizes.lg, fontWeight: weights.heavy, color: colors.primaryDark, marginTop: 3 },
  lineUnit: { fontSize: sizes.xs, fontWeight: weights.semibold, color: colors.inkFaint },

  summary: { marginTop: spacing.lg, padding: spacing.lg },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm + 2 },
  summaryLabel: { fontSize: sizes.md, fontWeight: weights.semibold, color: colors.inkMuted },
  summaryValue: { fontSize: sizes.md, fontWeight: weights.bold, color: colors.ink },
  summaryDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  totalLabel: { fontSize: sizes.xl, fontWeight: weights.heavy, color: colors.ink },
  totalValue: { fontSize: sizes.h2, fontWeight: weights.heavy, color: colors.primaryDark },

  checkout: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
    paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl + 6,
  },
  checkoutRow: { flexDirection: "row", gap: spacing.md },
  checkoutBtnSmall: { flex: 1 },
  checkoutBtnLarge: { flex: 2 },

  sheetOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xxl + 2, borderTopRightRadius: radius.xxl + 2, padding: spacing.xxl, paddingBottom: spacing.xxxl + 8 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
  amountBadge: { backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.lg, alignItems: "center", marginBottom: spacing.lg },
  amountLabel: { fontSize: sizes.sm, fontWeight: weights.semibold, color: colors.inkMuted, marginBottom: 4 },
  amountValue: { fontSize: 28, fontWeight: weights.heavy, color: colors.primaryDark },
  secure: { textAlign: "center", fontSize: sizes.xs, color: colors.inkFaint, marginTop: spacing.md },

  center: { alignItems: "center", paddingVertical: spacing.lg, gap: spacing.xs },
  successCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", marginBottom: spacing.md, ...shadow.primary },
});
