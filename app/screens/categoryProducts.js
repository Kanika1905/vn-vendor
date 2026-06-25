import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Pressable } from "react-native";
import { CONFIG } from "../constants";
import { useCart } from "../context/cartContext";
import { colors, spacing, radius, sizes, weights, shadow } from "../theme";
import { Screen, Header, SearchBar, ProductGridCard, EmptyState, IconButton, Icon } from "../components/ui";

export default function CategoryProducts({ navigation, route }) {
  const { categoryName } = route.params || {};
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { totalItems, totalPrice } = useCart();

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${CONFIG.BASE_URL}/products?category=${encodeURIComponent(categoryName)}`);
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

  const filtered = useMemo(
    () => products.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  return (
    <Screen>
      <Header
        title={categoryName || "Category"}
        subtitle={`${products.length} product${products.length !== 1 ? "s" : ""} available`}
        onBack={() => navigation.goBack()}
        right={<IconButton name="cart" badge={totalItems} onPress={() => navigation.navigate("Cart")} />}
      />
      <View style={styles.searchWrap}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={`Search in ${categoryName || "category"}…`} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 48 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.column}
          renderItem={({ item }) => (
            <ProductGridCard product={item} onPress={() => navigation.navigate("productDetails", { product: item })} />
          )}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProducts(); }} tintColor={colors.primary} />
          }
          ListEmptyComponent={<EmptyState title="No products yet" subtitle={`No products in "${categoryName}" yet.`} />}
        />
      )}

      {/* Sticky cart bar */}
      {totalItems > 0 && (
        <Pressable style={styles.cartBar} onPress={() => navigation.navigate("Cart")}>
          <View>
            <Text style={styles.cartBarCount}>{totalItems} item{totalItems > 1 ? "s" : ""} in cart</Text>
            <Text style={styles.cartBarTotal}>₹{totalPrice}</Text>
          </View>
          <View style={styles.cartBarBtn}>
            <Text style={styles.cartBarBtnText}>View cart</Text>
            <Icon name="next" size={16} color={colors.inkInverse} />
          </View>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: { backgroundColor: colors.surface, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: 110 },
  column: { gap: spacing.md, marginBottom: spacing.md },

  cartBar: {
    position: "absolute", left: spacing.xl, right: spacing.xl, bottom: spacing.xxl,
    backgroundColor: colors.primary, borderRadius: radius.xl,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 1,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", ...shadow.primary,
  },
  cartBarCount: { fontSize: sizes.sm, fontWeight: weights.bold, color: "#BDEBCE" },
  cartBarTotal: { fontSize: sizes.xl, fontWeight: weights.heavy, color: colors.inkInverse },
  cartBarBtn: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: spacing.md + 3, paddingVertical: 9, borderRadius: radius.md },
  cartBarBtnText: { fontSize: sizes.md, fontWeight: weights.heavy, color: colors.inkInverse },
});
