import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, FlatList, ActivityIndicator } from "react-native";
import { CONFIG } from "../constants";
import { useCart } from "../context/cartContext";
import { colors, spacing, radius, sizes, weights, type, tileColorFor } from "../theme";
import {
  Screen, Header, Badge, CartControl, ProductGridCard, SectionHeading,
  IconButton, Icon, Button,
} from "../components/ui";

const LOW_STOCK = 15;

export default function ProductDetails({ navigation, route }) {
  const product = route.params?.product || {};
  const { totalItems } = useCart();

  const [allProducts, setAllProducts] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`${CONFIG.BASE_URL}/products`);
        const data = await res.json();
        if (active) setAllProducts(data.products || []);
      } catch {
        // recommendations are non-critical
      } finally {
        if (active) setLoadingRecs(false);
      }
    })();
    return () => { active = false; };
  }, [product._id]);

  // Recommend same-category products first, then fill with others.
  const recommended = useMemo(() => {
    const others = allProducts.filter((p) => p._id !== product._id);
    const sameCat = others.filter((p) => p.categoryId?._id && p.categoryId._id === product.categoryId?._id);
    const seen = new Set(sameCat.map((p) => p._id));
    const filler = others.filter((p) => !seen.has(p._id));
    return [...sameCat, ...filler].slice(0, 8);
  }, [allProducts, product._id, product.categoryId]);

  const hasImage = !!product.images?.[0];
  const low = product.quantity != null && Number(product.quantity) <= LOW_STOCK;

  return (
    <Screen>
      <Header
        title="Details"
        onBack={() => navigation.goBack()}
        right={<IconButton name="cart" badge={totalItems} onPress={() => navigation.navigate("Cart")} />}
      />

      <ScrollView style={styles.flex} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View style={[styles.hero, { backgroundColor: tileColorFor(product.name) }]}>
          {hasImage ? (
            <Image source={{ uri: product.images[0] }} style={styles.heroImg} resizeMode="cover" />
          ) : (
            <Text style={styles.heroEmoji}>📦</Text>
          )}
        </View>

        <View style={styles.content}>
          {/* Category + stock */}
          <View style={styles.metaRow}>
            {product.categoryId?.name ? <Badge label={product.categoryId.name} fg={colors.info} bg="#EAF2FE" /> : <View />}
            <Text style={[styles.stock, low && styles.stockLow]}>
              {product.quantity != null ? `${low ? "Low stock" : "In stock"}: ${product.quantity} ${product.unit || ""}` : ""}
            </Text>
          </View>

          {/* Name + price */}
          <Text style={type.h1}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.price}</Text>
            <Text style={styles.priceUnit}>/ {product.unit || "unit"}</Text>
          </View>

          {/* Wholesaler */}
          {product.wholesalerId?.businessName ? (
            <View style={styles.sellerRow}>
              <Icon name="briefcase" size={15} color={colors.primary} />
              <Text style={styles.sellerText}>Sold by {product.wholesalerId.businessName}</Text>
            </View>
          ) : null}

          {/* Description */}
          {product.description ? (
            <>
              <Text style={[type.label, styles.sectionLabel]}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </>
          ) : null}

          <View style={styles.divider} />

          {/* Recommended */}
          <SectionHeading title="You might also like" style={styles.recHeading} />
          {loadingRecs ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
          ) : recommended.length === 0 ? (
            <Text style={styles.noRecs}>No other products yet.</Text>
          ) : (
            <FlatList
              data={recommended}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recList}
              ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
              renderItem={({ item }) => (
                <View style={styles.recCard}>
                  <ProductGridCard
                    product={item}
                    onPress={() => navigation.push("productDetails", { product: item })}
                  />
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>

      {/* Sticky add-to-cart bar */}
      <View style={styles.bar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.barLabel}>Price</Text>
          <Text style={styles.barPrice}>₹{product.price}<Text style={styles.barUnit}> / {product.unit || "unit"}</Text></Text>
        </View>
        {totalItems > 0 && (
          <Button title="View cart" variant="secondary" block={false} onPress={() => navigation.navigate("Cart")} style={styles.cartBtn} />
        )}
        <CartControl product={product} size={48} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: 130 },

  hero: { width: "100%", height: 250, alignItems: "center", justifyContent: "center" },
  heroImg: { width: "100%", height: "100%" },
  heroEmoji: { fontSize: 96 },

  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
  stock: { fontSize: sizes.sm, fontWeight: weights.bold, color: colors.inkSubtle },
  stockLow: { color: colors.danger },

  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: spacing.sm },
  price: { fontSize: sizes.h1, fontWeight: weights.heavy, color: colors.primaryDark },
  priceUnit: { fontSize: sizes.md, fontWeight: weights.semibold, color: colors.inkFaint },

  sellerRow: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: spacing.md },
  sellerText: { fontSize: sizes.md, fontWeight: weights.semibold, color: colors.inkMuted },

  sectionLabel: { marginTop: spacing.xl, marginBottom: spacing.sm },
  description: { fontSize: sizes.md + 0.5, fontWeight: weights.medium, color: colors.inkMuted, lineHeight: 22 },

  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xl },

  recHeading: { marginBottom: spacing.md },
  noRecs: { fontSize: sizes.md, fontWeight: weights.medium, color: colors.inkSubtle, marginBottom: spacing.lg },
  recList: { paddingBottom: spacing.sm },
  recCard: { width: 160 },

  bar: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    flexDirection: "row", alignItems: "center", gap: spacing.md,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
    paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl + 4,
  },
  barLabel: { fontSize: sizes.xs, fontWeight: weights.semibold, color: colors.inkSubtle },
  barPrice: { fontSize: sizes.xl, fontWeight: weights.heavy, color: colors.ink },
  barUnit: { fontSize: sizes.sm, fontWeight: weights.semibold, color: colors.inkFaint },
  cartBtn: { paddingHorizontal: spacing.lg },
});
