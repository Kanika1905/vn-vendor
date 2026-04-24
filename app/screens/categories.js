import React, { useEffect, useState } from "react";
import {
    View, Text, TouchableOpacity,
    StyleSheet, ActivityIndicator, SectionList,
} from "react-native";
import { COLORS, CONFIG } from "../constants";
import { useCart } from "../context/cartContext";

export default function Categories({ navigation }) {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const { totalItems } = useCart();

    useEffect(() => {
        fetch(`${CONFIG.BASE_URL}/categories`)
            .then((r) => r.json())
            .then((data) => {
                console.log("API response:", JSON.stringify(data)); // ← add this
                const cats = data.categories || data || [];
                console.log("Cats array:", cats.length, cats[0]); // ← and this

                // Group by group field
                const groupMap = {};
                cats.forEach((cat) => {
                    const group = cat.group || "Other";
                    if (!groupMap[group]) groupMap[group] = [];
                    groupMap[group].push(cat);
                });

                const built = Object.entries(groupMap).map(([group, items]) => ({
                    title: group,
                    data: [items], // single row per section for grid
                }));
                setSections(built);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const renderGrid = ({ item: cats }) => (
        <View style={styles.grid}>
            {cats.map((cat) => (
                <TouchableOpacity
                    key={cat._id}
                    style={styles.catCard}
                    onPress={() => navigation.navigate("categoryProducts", { categoryName: cat.name })} // will wire up later
                >
                    <View style={styles.emojiWrap}>
                        <Text style={styles.emoji}>{cat.emoji || "📦"}</Text>
                    </View>
                    <Text style={styles.catName} numberOfLines={2}>{cat.name}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color={COLORS.primary} size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Categories</Text>
                {totalItems > 0 && (
                    <TouchableOpacity
                        style={styles.cartBtn}
                        onPress={() => navigation.navigate("Cart")}
                    >
                        <Text style={styles.cartBtnIcon}>🛒</Text>
                        <View style={styles.cartBtnTextBlock}>
                            <Text style={styles.cartBtnTitle}>Cart</Text>
                            <Text style={styles.cartBtnSub}>{totalItems} item{totalItems > 1 ? "s" : ""}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            <SectionList
                sections={sections}
                keyExtractor={(_, i) => String(i)}
                renderItem={renderGrid}
                renderSectionHeader={({ section: { title } }) => (
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{title}</Text>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F5F0" },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },

    // Header
    header: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14,
        backgroundColor: "#fff", borderBottomWidth: 0.5, borderBottomColor: "#e0e0e0",
    },
    headerTitle: { fontSize: 20, fontWeight: "700", color: "#111" },

    cartBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 24,
        paddingHorizontal: 14,
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    cartBtnIcon: { fontSize: 18 },
    cartBtnTextBlock: { flexDirection: "column" },
    cartBtnTitle: { color: "#fff", fontWeight: "700", fontSize: 13, lineHeight: 16 },
    cartBtnSub: { color: "#fff", fontSize: 11, lineHeight: 14 },

    // Section header
    sectionHeader: {
        paddingHorizontal: 16,
        paddingTop: 22,
        paddingBottom: 12,
        backgroundColor: "#F5F5F0",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111",
    },

    // Grid
    grid: {
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
    emoji: { fontSize: 30 },
    catName: {
        fontSize: 11,
        fontWeight: "600",
        color: "#111",
        textAlign: "center",
        lineHeight: 15,
    },
});