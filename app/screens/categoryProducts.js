// import React, { useState } from "react";
// import {
//   View, Text, TextInput, StyleSheet,
//   TouchableOpacity,
// } from "react-native";
// import { COLORS } from "../constants";
// import { useCart } from "../context/cartContext";

// export default function CategoryProducts({ navigation, route }) {
//   const { categoryName } = route.params || {};
//   const [search, setSearch] = useState("");
//   const { totalItems } = useCart();

//   return (
//     <View style={styles.container}>
//       {/* Search Bar */}
//       <View style={styles.searchWrap}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={styles.back}>←</Text>
//         </TouchableOpacity>
//         <TextInput
//           style={styles.search}
//           placeholder={`Search in ${categoryName || "category"}...`}
//           placeholderTextColor="#aaa"
//           value={search}
//           onChangeText={setSearch}
//         />
//       </View>

//       {/* Category name pill */}
//       <View style={styles.catPill}>
//         <Text style={styles.catPillText}>{categoryName}</Text>
//       </View>

//       {/* Empty state */}
//       <View style={styles.emptyContainer}>
//         <Text style={styles.emptyEmoji}>📦</Text>
//         <Text style={styles.emptyTitle}>No products yet</Text>
//         <Text style={styles.emptySub}>
//           Wholesaler hasn't added products{"\n"}in "{categoryName}" yet.
//         </Text>
//       </View>

//       {/* Cart FAB */}
//       {totalItems > 0 && (
//         <TouchableOpacity
//           style={styles.cartFab}
//           onPress={() => navigation.navigate("Cart")}
//         >
//           <Text style={styles.cartFabIcon}>🛒</Text>
//           <View style={styles.cartFabTextBlock}>
//             <Text style={styles.cartFabTitle}>Cart</Text>
//             <Text style={styles.cartFabSub}>{totalItems} item{totalItems > 1 ? "s" : ""}</Text>
//           </View>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F5F5F0" },

//   searchWrap: {
//     flexDirection: "row", alignItems: "center", gap: 10,
//     paddingHorizontal: 12, paddingTop: 52, paddingBottom: 12,
//     backgroundColor: "#fff",
//     borderBottomWidth: 0.5, borderBottomColor: "#e0e0e0",
//   },
//   back: { fontSize: 22, color: COLORS.primary, fontWeight: "700", paddingHorizontal: 4 },
//   search: {
//     flex: 1, backgroundColor: "#f5f5f5", borderRadius: 10,
//     paddingHorizontal: 12, paddingVertical: 9,
//     fontSize: 13, color: "#111",
//     borderWidth: 0.5, borderColor: "#ddd",
//   },

//   catPill: {
//     alignSelf: "flex-start",
//     marginHorizontal: 16, marginTop: 14,
//     backgroundColor: COLORS.primary,
//     borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
//   },
//   catPillText: { color: "#fff", fontWeight: "700", fontSize: 13 },

//   emptyContainer: {
//     flex: 1, alignItems: "center", justifyContent: "center", gap: 10,
//   },
//   emptyEmoji: { fontSize: 52 },
//   emptyTitle: { fontSize: 17, fontWeight: "700", color: "#111" },
//   emptySub: { fontSize: 13, color: "#888", textAlign: "center", lineHeight: 20 },

//   cartFab: {
//     position: "absolute", bottom: 16, right: 16,
//     backgroundColor: COLORS.primary, borderRadius: 30,
//     paddingHorizontal: 16, paddingVertical: 10,
//     flexDirection: "row", alignItems: "center", gap: 10,
//     elevation: 6, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8,
//   },
//   cartFabIcon: { fontSize: 26 },
//   cartFabTextBlock: { flexDirection: "column" },
//   cartFabTitle: { color: "#fff", fontWeight: "700", fontSize: 14, lineHeight: 17 },
//   cartFabSub: { color: "#fff", fontSize: 11, lineHeight: 14 },
// });

import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, FlatList, Image,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { COLORS, CONFIG } from "../constants";
import { useCart } from "../context/cartContext";

export default function CategoryProducts({ navigation, route }) {
  const { categoryName } = route.params || {};
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addToCart, totalItems } = useCart();

  const fetchProducts = async () => {
    try {
      const res = await fetch(
        `${CONFIG.BASE_URL}/products?category=${encodeURIComponent(categoryName)}`
      );
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.log("CategoryProducts fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const hasImage = item.images && item.images.length > 0;
    return (
      <View style={styles.card}>
        <View style={styles.imgWrap}>
          {hasImage ? (
            <Image source={{ uri: item.images[0] }} style={styles.productImg} resizeMode="cover" />
          ) : (
            <View style={styles.imgPlaceholder}>
              <Text style={{ fontSize: 28 }}>📦</Text>
            </View>
          )}
          <TouchableOpacity style={styles.plusBtn} onPress={() => addToCart(item)}>
            <Text style={styles.plusIcon}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.priceRow}>
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>₹{item.price}</Text>
            </View>
          </View>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.qtyText}>{item.quantity} {item.unit}</Text>
          {item.wholesalerId?.businessName ? (
            <Text style={styles.wholesalerName} numberOfLines={1}>
              {item.wholesalerId.businessName}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.search}
          placeholder={`Search in ${categoryName || "category"}...`}
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category pill */}
      <View style={styles.catPill}>
        <Text style={styles.catPillText}>{categoryName}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchProducts(); }}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyTitle}>No products yet</Text>
              <Text style={styles.emptySub}>
                No products in "{categoryName}" yet.
              </Text>
            </View>
          }
          renderItem={renderItem}
        />
      )}

      {/* Cart FAB */}
      {totalItems > 0 && (
        <TouchableOpacity
          style={styles.cartFab}
          onPress={() => navigation.navigate("Cart")}
        >
          <Text style={styles.cartFabIcon}>🛒</Text>
          <View style={styles.cartFabTextBlock}>
            <Text style={styles.cartFabTitle}>Cart</Text>
            <Text style={styles.cartFabSub}>{totalItems} item{totalItems > 1 ? "s" : ""}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: "#F5F5F0" },

  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 12, paddingTop: 52, paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5, borderBottomColor: "#e0e0e0",
  },
  back: { fontSize: 22, color: COLORS.primary, fontWeight: "700", paddingHorizontal: 4 },
  search: {
    flex: 1, backgroundColor: "#f5f5f5", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 9,
    fontSize: 13, color: "#111",
    borderWidth: 0.5, borderColor: "#ddd",
  },

  catPill: {
    alignSelf: "flex-start",
    marginHorizontal: 16, marginTop: 14, marginBottom: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  catPillText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  // grid
  listContent: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 100 },
  row:         { justifyContent: "space-between", marginBottom: 10 },

  // card — matches vendor Home style
  card: {
    width: "31%", backgroundColor: "#fff",
    borderRadius: 12, overflow: "hidden",
    borderWidth: 0.5, borderColor: "#e8e8e8",
  },
  imgWrap: {
    width: "100%", aspectRatio: 1,
    backgroundColor: "#f0f0f0", position: "relative",
  },
  productImg:   { width: "100%", height: "100%" },
  imgPlaceholder: {
    flex: 1, alignItems: "center", justifyContent: "center",
    backgroundColor: "#edf7ed",
  },
  plusBtn: {
    position: "absolute", bottom: 6, right: 6,
    width: 28, height: 28, borderRadius: 7,
    backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#E0115F",
    alignItems: "center", justifyContent: "center",
  },
  plusIcon: { color: "#E0115F", fontSize: 18, fontWeight: "700", lineHeight: 20 },
  cardInfo:    { padding: 7 },
  priceRow:    { flexDirection: "row", marginBottom: 3 },
  priceBadge: {
    backgroundColor: "#2E7D32", borderRadius: 5,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  priceText:     { color: "#fff", fontSize: 12, fontWeight: "700" },
  productName:   { fontSize: 12, fontWeight: "600", color: "#111", marginBottom: 2, lineHeight: 16 },
  qtyText:       { fontSize: 11, color: "#888" },
  wholesalerName:{ fontSize: 10, color: "#aaa", marginTop: 2 },

  // empty
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 10 },
  emptyEmoji:     { fontSize: 52 },
  emptyTitle:     { fontSize: 17, fontWeight: "700", color: "#111" },
  emptySub:       { fontSize: 13, color: "#888", textAlign: "center", lineHeight: 20 },

  // cart fab
  cartFab: {
    position: "absolute", bottom: 16, right: 16,
    backgroundColor: COLORS.primary, borderRadius: 30,
    paddingHorizontal: 16, paddingVertical: 10,
    flexDirection: "row", alignItems: "center", gap: 10,
    elevation: 6, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8,
  },
  cartFabIcon:      { fontSize: 26 },
  cartFabTextBlock: { flexDirection: "column" },
  cartFabTitle:     { color: "#fff", fontWeight: "700", fontSize: 14, lineHeight: 17 },
  cartFabSub:       { color: "#fff", fontSize: 11, lineHeight: 14 },
});