// import React, { useContext } from "react";
// import {
//     View, Text, FlatList, TouchableOpacity,
//     StyleSheet, Alert, ActivityIndicator, Image,
// } from "react-native";
// import { useCart } from "../context/cartContext";
// import { AuthContext } from "../context/authContext";
// import { COLORS, CONFIG } from "../constants";

// export default function Cart({ navigation }) {
//     const { cartItems, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
//     const { token } = useContext(AuthContext);
//     const [ordering, setOrdering] = React.useState(false);

//     const placeOrder = async () => {
//         if (cartItems.length === 0) return;
//         setOrdering(true);
//         try {
//             const promises = cartItems.map((item) =>
//                 fetch(`${CONFIG.BASE_URL}/vendor/orders`, {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json",
//                         Authorization: `Bearer ${token}`,
//                     },
//                     body: JSON.stringify({
//                         productId: item.product._id,
//                         quantity: item.quantity,
//                     }),
//                 })
//             );
//             await Promise.all(promises);
//             clearCart();
//             Alert.alert(
//                 "Order Placed!",
//                 "Your order has been placed successfully.",
//                 [
//                     {
//                         text: "OK",
//                         onPress: () => {
//                             // First go back to tabs, then switch to myOrders tab
//                             navigation.navigate("vendorTabs", { screen: "myOrders" });
//                         },
//                     },
//                 ]
//             );
//         } catch {
//             Alert.alert("Error", "Failed to place order. Try again.");
//         } finally {
//             setOrdering(false);
//         }
//     };

//     const renderItem = ({ item }) => (
//         <View style={styles.row}>
//             {item.product.images?.[0] ? (
//                 <Image source={{ uri: item.product.images[0] }} style={styles.thumb} />
//             ) : (
//                 <View style={[styles.thumb, styles.thumbPlaceholder]}>
//                     <Text style={{ fontSize: 24 }}>📦</Text>
//                 </View>
//             )}

//             <View style={styles.info}>
//                 <Text style={styles.name} numberOfLines={1}>{item.product.name}</Text>
//                 <Text style={styles.unit}>{item.product.quantity} {item.product.unit}</Text>
//                 <Text style={styles.price}>₹{item.product.price * item.quantity}</Text>
//             </View>

//             <View style={styles.qtyControl}>
//                 <TouchableOpacity
//                     style={styles.qtyBtn}
//                     onPress={() => updateQuantity(item.product._id, item.quantity - 1)}
//                 >
//                     <Text style={styles.qtyBtnText}>−</Text>
//                 </TouchableOpacity>
//                 <Text style={styles.qtyNum}>{item.quantity}</Text>
//                 <TouchableOpacity
//                     style={styles.qtyBtn}
//                     onPress={() => updateQuantity(item.product._id, item.quantity + 1)}
//                 >
//                     <Text style={styles.qtyBtnText}>+</Text>
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );

//     if (cartItems.length === 0) {
//         return (
//             <View style={styles.emptyContainer}>
//                 <Text style={{ fontSize: 48 }}>🛒</Text>
//                 <Text style={styles.emptyText}>Your cart is empty</Text>
//                 <TouchableOpacity onPress={() => navigation.goBack()}>
//                     <Text style={styles.shopLink}>Browse products</Text>
//                 </TouchableOpacity>
//             </View>
//         );
//     }

//     return (
//         <View style={styles.container}>
//             <View style={styles.header}>
//                 <TouchableOpacity onPress={() => navigation.goBack()}>
//                     <Text style={styles.back}>← Back</Text>
//                 </TouchableOpacity>
//                 <Text style={styles.headerTitle}>My Cart</Text>
//                 <TouchableOpacity onPress={clearCart}>
//                     <Text style={styles.clearText}>Clear</Text>
//                 </TouchableOpacity>
//             </View>

//             <FlatList
//                 data={cartItems}
//                 keyExtractor={(item) => item.product._id}
//                 renderItem={renderItem}
//                 contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
//                 ItemSeparatorComponent={() => <View style={styles.separator} />}
//             />

//             {/* Bottom checkout bar */}
//             <View style={styles.checkoutBar}>
//                 <View>
//                     <Text style={styles.totalLabel}>Total</Text>
//                     <Text style={styles.totalPrice}>₹{totalPrice}</Text>
//                 </View>
//                 <TouchableOpacity
//                     style={styles.placeOrderBtn}
//                     onPress={placeOrder}
//                     disabled={ordering}
//                 >
//                     {ordering
//                         ? <ActivityIndicator color="#fff" />
//                         : <Text style={styles.placeOrderText}>Place Order</Text>}
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: "#F5F5F0" },
//     emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
//     emptyText: { fontSize: 16, color: "#666" },
//     shopLink: { color: COLORS.primary, fontWeight: "600", fontSize: 15 },

//     header: {
//         flexDirection: "row", justifyContent: "space-between", alignItems: "center",
//         paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14,
//         backgroundColor: "#fff", borderBottomWidth: 0.5, borderBottomColor: "#e0e0e0",
//     },
//     headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
//     back: { fontSize: 15, color: COLORS.primary, fontWeight: "600" },
//     clearText: { fontSize: 13, color: "#E0115F", fontWeight: "600" },

//     row: {
//         flexDirection: "row", alignItems: "center",
//         backgroundColor: "#fff", borderRadius: 12, padding: 12, gap: 12,
//     },
//     thumb: { width: 64, height: 64, borderRadius: 10 },
//     thumbPlaceholder: { backgroundColor: "#edf7ed", alignItems: "center", justifyContent: "center" },
//     info: { flex: 1 },
//     name: { fontSize: 14, fontWeight: "600", color: "#111", marginBottom: 2 },
//     unit: { fontSize: 12, color: "#888", marginBottom: 4 },
//     price: { fontSize: 15, fontWeight: "700", color: "#2E7D32" },

//     qtyControl: { flexDirection: "row", alignItems: "center", gap: 8 },
//     qtyBtn: {
//         width: 30, height: 30, borderRadius: 8,
//         borderWidth: 1, borderColor: "#ddd",
//         alignItems: "center", justifyContent: "center",
//         backgroundColor: "#f5f5f5",
//     },
//     qtyBtnText: { fontSize: 18, color: "#111", fontWeight: "500", lineHeight: 22 },
//     qtyNum: { fontSize: 15, fontWeight: "700", color: "#111", minWidth: 20, textAlign: "center" },

//     separator: { height: 8 },

//     checkoutBar: {
//         position: "absolute", bottom: 0, left: 0, right: 0,
//         backgroundColor: "#fff",
//         borderTopWidth: 0.5, borderTopColor: "#e0e0e0",
//         padding: 16, paddingBottom: 30,
//         flexDirection: "row", justifyContent: "space-between", alignItems: "center",
//     },
//     totalLabel: { fontSize: 12, color: "#888" },
//     totalPrice: { fontSize: 20, fontWeight: "700", color: "#111" },
//     placeOrderBtn: {
//         backgroundColor: COLORS.primary,
//         borderRadius: 12, paddingHorizontal: 28, paddingVertical: 14,
//     },
//     placeOrderText: { color: "#fff", fontWeight: "700", fontSize: 15 },
// });

import React, { useContext } from "react";
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, Alert, ActivityIndicator, Image,
    Modal, TextInput, ScrollView,
} from "react-native";
import { useCart } from "../context/cartContext";
import { AuthContext } from "../context/authContext";
import { COLORS, CONFIG } from "../constants";

export default function Cart({ navigation }) {
    const { cartItems, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
    const { token } = useContext(AuthContext);
    const [ordering, setOrdering] = React.useState(false);
    const [showUpiModal, setShowUpiModal] = React.useState(false);
    const [upiId, setUpiId] = React.useState("");
    const [upiStep, setUpiStep] = React.useState("input"); // "input" | "processing" | "success"
    const [upiError, setUpiError] = React.useState("");

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

    const handleCOD = () => {
        Alert.alert(
            "Cash on Delivery",
            `Confirm order of ₹${totalPrice} with Cash on Delivery?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm",
                    onPress: placeOrder,
                },
            ]
        );
    };

    const validateUpiId = (id) => {
        // Basic UPI ID validation: something@something
        const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
        return upiRegex.test(id);
    };

    const handleUpiPay = () => {
        setUpiError("");
        if (!validateUpiId(upiId)) {
            setUpiError("Enter a valid UPI ID (e.g. name@upi)");
            return;
        }
        setUpiStep("processing");
        // Simulate payment processing (fake gateway)
        setTimeout(() => {
            setUpiStep("success");
        }, 2500);
    };

    const handleUpiSuccess = () => {
        setShowUpiModal(false);
        setUpiStep("input");
        setUpiId("");
        placeOrder();
    };

    const closeUpiModal = () => {
        setShowUpiModal(false);
        setUpiStep("input");
        setUpiId("");
        setUpiError("");
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
                contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            {/* Bottom checkout bar */}
            <View style={styles.checkoutBar}>
                {/* Total */}
                <View style={styles.totalBlock}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalPrice}>₹{totalPrice}</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    {/* Pay Online / UPI */}
                    <TouchableOpacity
                        style={styles.upiBtn}
                        onPress={() => setShowUpiModal(true)}
                        disabled={ordering}
                    >
                        <Text style={styles.upiBtnIcon}>⚡</Text>
                        <Text style={styles.upiBtnText}>Pay Online{"\n"}/ UPI</Text>
                    </TouchableOpacity>

                    {/* Cash on Delivery */}
                    <TouchableOpacity
                        style={styles.codBtn}
                        onPress={handleCOD}
                        disabled={ordering}
                    >
                        {ordering ? (
                            <ActivityIndicator color={COLORS.primary} />
                        ) : (
                            <>
                                <Text style={styles.codBtnIcon}>💵</Text>
                                <Text style={styles.codBtnText}>Cash on{"\n"}Delivery</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* UPI Payment Modal */}
            <Modal
                visible={showUpiModal}
                animationType="slide"
                transparent
                onRequestClose={closeUpiModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>

                        {upiStep === "input" && (
                            <>
                                {/* Header */}
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Pay via UPI</Text>
                                    <TouchableOpacity onPress={closeUpiModal}>
                                        <Text style={styles.modalClose}>✕</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Amount */}
                                <View style={styles.amountBadge}>
                                    <Text style={styles.amountLabel}>Amount to Pay</Text>
                                    <Text style={styles.amountValue}>₹{totalPrice}</Text>
                                </View>

                                {/* UPI Apps row */}
                                <Text style={styles.sectionLabel}>Pay using any UPI app</Text>
                                <View style={styles.upiAppsRow}>
                                    {[
                                        { name: "GPay", emoji: "🟢" },
                                        { name: "PhonePe", emoji: "🟣" },
                                        { name: "Paytm", emoji: "🔵" },
                                        { name: "BHIM", emoji: "🟠" },
                                    ].map((app) => (
                                        <View key={app.name} style={styles.upiAppChip}>
                                            <Text style={styles.upiAppEmoji}>{app.emoji}</Text>
                                            <Text style={styles.upiAppName}>{app.name}</Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Divider */}
                                <View style={styles.dividerRow}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>or enter UPI ID</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                {/* UPI ID Input */}
                                <TextInput
                                    style={[styles.upiInput, upiError ? styles.upiInputError : null]}
                                    placeholder="yourname@upi"
                                    placeholderTextColor="#aaa"
                                    value={upiId}
                                    onChangeText={(t) => { setUpiId(t); setUpiError(""); }}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                                {upiError ? <Text style={styles.errorText}>{upiError}</Text> : null}

                                <TouchableOpacity style={styles.payNowBtn} onPress={handleUpiPay}>
                                    <Text style={styles.payNowText}>Pay ₹{totalPrice}</Text>
                                </TouchableOpacity>

                                <Text style={styles.secureNote}>🔒 Secured by UPI · 256-bit encrypted</Text>
                            </>
                        )}

                        {upiStep === "processing" && (
                            <View style={styles.processingContainer}>
                                <ActivityIndicator size="large" color={COLORS.primary} />
                                <Text style={styles.processingTitle}>Processing Payment…</Text>
                                <Text style={styles.processingSubtitle}>Please wait, do not close this screen</Text>
                                <View style={styles.processingInfoBox}>
                                    <Text style={styles.processingInfoText}>UPI ID: {upiId}</Text>
                                    <Text style={styles.processingInfoText}>Amount: ₹{totalPrice}</Text>
                                </View>
                            </View>
                        )}

                        {upiStep === "success" && (
                            <View style={styles.successContainer}>
                                <View style={styles.successCircle}>
                                    <Text style={styles.successTick}>✓</Text>
                                </View>
                                <Text style={styles.successTitle}>Payment Successful!</Text>
                                <Text style={styles.successSubtitle}>₹{totalPrice} paid via UPI</Text>
                                <View style={styles.successInfoBox}>
                                    <Text style={styles.successInfoRow}>
                                        <Text style={styles.successInfoKey}>UPI ID  </Text>
                                        <Text style={styles.successInfoVal}>{upiId}</Text>
                                    </Text>
                                    <Text style={styles.successInfoRow}>
                                        <Text style={styles.successInfoKey}>Txn ID  </Text>
                                        <Text style={styles.successInfoVal}>TXN{Math.floor(Math.random() * 9000000000) + 1000000000}</Text>
                                    </Text>
                                    <Text style={styles.successInfoRow}>
                                        <Text style={styles.successInfoKey}>Status  </Text>
                                        <Text style={[styles.successInfoVal, { color: "#2E7D32" }]}>Success ✓</Text>
                                    </Text>
                                </View>
                                <TouchableOpacity style={styles.payNowBtn} onPress={handleUpiSuccess}>
                                    <Text style={styles.payNowText}>Continue →</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                    </View>
                </View>
            </Modal>
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

    // ── Checkout Bar ──────────────────────────────────────────────
    checkoutBar: {
        position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: "#fff",
        borderTopWidth: 0.5, borderTopColor: "#e0e0e0",
        paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    totalBlock: { flexShrink: 0 },
    totalLabel: { fontSize: 11, color: "#888", marginBottom: 2 },
    totalPrice: { fontSize: 20, fontWeight: "700", color: "#111" },

    actionButtons: { flexDirection: "row", gap: 8, flex: 1, justifyContent: "flex-end" },

    upiBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        alignItems: "center",
        flexDirection: "column",
        minWidth: 90,
    },
    upiBtnIcon: { fontSize: 14, marginBottom: 2 },
    upiBtnText: { color: "#fff", fontWeight: "700", fontSize: 11, textAlign: "center", lineHeight: 15 },

    codBtn: {
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        alignItems: "center",
        flexDirection: "column",
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        minWidth: 90,
    },
    codBtnIcon: { fontSize: 14, marginBottom: 2 },
    codBtnText: { color: COLORS.primary, fontWeight: "700", fontSize: 11, textAlign: "center", lineHeight: 15 },

    // ── UPI Modal ────────────────────────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "flex-end",
    },
    modalCard: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20,
    },
    modalTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
    modalClose: { fontSize: 18, color: "#888", fontWeight: "600" },

    amountBadge: {
        backgroundColor: "#edf7ed",
        borderRadius: 12,
        padding: 14,
        alignItems: "center",
        marginBottom: 20,
    },
    amountLabel: { fontSize: 12, color: "#555", marginBottom: 4 },
    amountValue: { fontSize: 28, fontWeight: "800", color: "#2E7D32" },

    sectionLabel: { fontSize: 12, color: "#888", marginBottom: 10, fontWeight: "500" },

    upiAppsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
    upiAppChip: {
        flex: 1, backgroundColor: "#f5f5f5", borderRadius: 10,
        paddingVertical: 10, alignItems: "center", gap: 4,
    },
    upiAppEmoji: { fontSize: 18 },
    upiAppName: { fontSize: 11, fontWeight: "600", color: "#333" },

    dividerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 8 },
    dividerLine: { flex: 1, height: 0.5, backgroundColor: "#ddd" },
    dividerText: { fontSize: 12, color: "#999" },

    upiInput: {
        borderWidth: 1.5, borderColor: "#ddd", borderRadius: 12,
        paddingHorizontal: 14, paddingVertical: 12,
        fontSize: 15, color: "#111", marginBottom: 6,
    },
    upiInputError: { borderColor: "#E0115F" },
    errorText: { fontSize: 12, color: "#E0115F", marginBottom: 10 },

    payNowBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 14, paddingVertical: 15,
        alignItems: "center", marginTop: 10,
    },
    payNowText: { color: "#fff", fontWeight: "700", fontSize: 16 },

    secureNote: { textAlign: "center", fontSize: 11, color: "#aaa", marginTop: 12 },

    // Processing
    processingContainer: { alignItems: "center", paddingVertical: 20, gap: 12 },
    processingTitle: { fontSize: 18, fontWeight: "700", color: "#111", marginTop: 8 },
    processingSubtitle: { fontSize: 13, color: "#888" },
    processingInfoBox: {
        backgroundColor: "#f5f5f5", borderRadius: 12, padding: 14,
        width: "100%", gap: 6, marginTop: 8,
    },
    processingInfoText: { fontSize: 13, color: "#555", textAlign: "center" },

    // Success
    successContainer: { alignItems: "center", paddingVertical: 10, gap: 10 },
    successCircle: {
        width: 70, height: 70, borderRadius: 35,
        backgroundColor: "#2E7D32", alignItems: "center", justifyContent: "center",
        marginBottom: 6,
    },
    successTick: { fontSize: 32, color: "#fff", fontWeight: "700" },
    successTitle: { fontSize: 20, fontWeight: "800", color: "#111" },
    successSubtitle: { fontSize: 14, color: "#555" },
    successInfoBox: {
        backgroundColor: "#f9f9f9", borderRadius: 12, padding: 14,
        width: "100%", gap: 8, marginTop: 4,
    },
    successInfoRow: { fontSize: 13 },
    successInfoKey: { color: "#888", fontWeight: "500" },
    successInfoVal: { color: "#111", fontWeight: "600" },
});