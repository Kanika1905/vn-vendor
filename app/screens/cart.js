import React, { useContext } from "react";
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, Alert, ActivityIndicator, Image,
} from "react-native";
import { useCart } from "../context/cartContext";
import { AuthContext } from "../context/authContext";
import { COLORS, CONFIG } from "../constants";

export default function Cart({ navigation }) {
    const { cartItems, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
    const { token } = useContext(AuthContext);
    const [ordering, setOrdering] = React.useState(false);

    const placeOrder = async () => {
        if (cartItems.length === 0) return;
        setOrdering(true);
        try {
            const promises = cartItems.map((item) =>
                fetch(`${CONFIG.BASE_URL}/vendor/orders`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        productId: item.product._id,
                        quantity: item.quantity,
                    }),
                })
            );
            await Promise.all(promises);
            clearCart();
            Alert.alert(
                "Order Placed!",
                "Your order has been placed successfully.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            // First go back to tabs, then switch to myOrders tab
                            navigation.navigate("vendorTabs", { screen: "myOrders" });
                        },
                    },
                ]
            );
        } catch {
            Alert.alert("Error", "Failed to place order. Try again.");
        } finally {
            setOrdering(false);
        }
    };



    const renderItem = ({ item }) => (
        <View style={styles.row}>
            {item.product.images?.[0] ? (
                <Image source={{ uri: item.product.images[0] }} style={styles.thumb} />
            ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]}>
                    <Text style={{ fontSize: 24 }}>📦</Text>
                </View>
            )}

            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.product.name}</Text>
                <Text style={styles.unit}>{item.product.quantity} {item.product.unit}</Text>
                <Text style={styles.price}>₹{item.product.price * item.quantity}</Text>
            </View>

            <View style={styles.qtyControl}>
                <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.product._id, item.quantity - 1)}
                >
                    <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyNum}>{item.quantity}</Text>
                <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.product._id, item.quantity + 1)}
                >
                    <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (cartItems.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={{ fontSize: 48 }}>🛒</Text>
                <Text style={styles.emptyText}>Your cart is empty</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.shopLink}>Browse products</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.back}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Cart</Text>
                <TouchableOpacity onPress={clearCart}>
                    <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={cartItems}
                keyExtractor={(item) => item.product._id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            {/* Bottom checkout bar */}
            <View style={styles.checkoutBar}>
                <View>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalPrice}>₹{totalPrice}</Text>
                </View>
                <TouchableOpacity
                    style={styles.placeOrderBtn}
                    onPress={placeOrder}
                    disabled={ordering}
                >
                    {ordering
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.placeOrderText}>Place Order</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F5F0" },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    emptyText: { fontSize: 16, color: "#666" },
    shopLink: { color: COLORS.primary, fontWeight: "600", fontSize: 15 },

    header: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14,
        backgroundColor: "#fff", borderBottomWidth: 0.5, borderBottomColor: "#e0e0e0",
    },
    headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
    back: { fontSize: 15, color: COLORS.primary, fontWeight: "600" },
    clearText: { fontSize: 13, color: "#E0115F", fontWeight: "600" },

    row: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#fff", borderRadius: 12, padding: 12, gap: 12,
    },
    thumb: { width: 64, height: 64, borderRadius: 10 },
    thumbPlaceholder: { backgroundColor: "#edf7ed", alignItems: "center", justifyContent: "center" },
    info: { flex: 1 },
    name: { fontSize: 14, fontWeight: "600", color: "#111", marginBottom: 2 },
    unit: { fontSize: 12, color: "#888", marginBottom: 4 },
    price: { fontSize: 15, fontWeight: "700", color: "#2E7D32" },

    qtyControl: { flexDirection: "row", alignItems: "center", gap: 8 },
    qtyBtn: {
        width: 30, height: 30, borderRadius: 8,
        borderWidth: 1, borderColor: "#ddd",
        alignItems: "center", justifyContent: "center",
        backgroundColor: "#f5f5f5",
    },
    qtyBtnText: { fontSize: 18, color: "#111", fontWeight: "500", lineHeight: 22 },
    qtyNum: { fontSize: 15, fontWeight: "700", color: "#111", minWidth: 20, textAlign: "center" },

    separator: { height: 8 },

    checkoutBar: {
        position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: "#fff",
        borderTopWidth: 0.5, borderTopColor: "#e0e0e0",
        padding: 16, paddingBottom: 30,
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    },
    totalLabel: { fontSize: 12, color: "#888" },
    totalPrice: { fontSize: 20, fontWeight: "700", color: "#111" },
    placeOrderBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 12, paddingHorizontal: 28, paddingVertical: 14,
    },
    placeOrderText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});