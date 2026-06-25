import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SectionList, ActivityIndicator } from "react-native";
import { CONFIG } from "../constants";
import { useCart } from "../context/cartContext";
import { colors, spacing, type } from "../theme";
import { Screen, Header, CategoryTile, IconButton, EmptyState } from "../components/ui";

export default function Categories({ navigation }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { totalItems } = useCart();

  useEffect(() => {
    fetch(`${CONFIG.BASE_URL}/categories`)
      .then((r) => r.json())
      .then((data) => {
        const cats = data.categories || data || [];
        // Group by `group` field → one grid row of tiles per section.
        const groupMap = {};
        cats.forEach((cat) => {
          const group = cat.group || "Other";
          (groupMap[group] = groupMap[group] || []).push(cat);
        });
        setSections(Object.entries(groupMap).map(([title, items]) => ({ title, data: [items] })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const renderGrid = ({ item: cats }) => (
    <View style={styles.grid}>
      {cats.map((cat) => (
        <View key={cat._id} style={styles.cell}>
          <CategoryTile
            variant="card"
            name={cat.name}
            emoji={cat.emoji}
            image={cat.image}
            onPress={() => navigation.navigate("categoryProducts", { categoryName: cat.name })}
          />
        </View>
      ))}
    </View>
  );

  return (
    <Screen>
      <Header
        title="Categories"
        subtitle="Browse all wholesale supplies"
        large
        right={totalItems > 0 ? <IconButton name="cart" badge={totalItems} onPress={() => navigation.navigate("Cart")} /> : null}
      />

      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 48 }} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderGrid}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionTitle}>{title}</Text>
          )}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={<EmptyState title="No categories" subtitle="Categories will appear here." />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, paddingTop: spacing.sm },
  sectionTitle: { ...type.section, fontSize: 15, marginTop: spacing.xl, marginBottom: spacing.md + 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -spacing.xs - 1 },
  cell: { width: "33.333%", paddingHorizontal: spacing.xs + 1, marginBottom: spacing.md - 1 },
});
