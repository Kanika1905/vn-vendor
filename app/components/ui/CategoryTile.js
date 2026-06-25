// app/components/ui/CategoryTile.js
// Category cell with real images. Two layouts:
//  - "compact" (Home 4-up row): image over label, no card chrome
//  - "card"    (Categories grid): bordered white card with image
import React, { useState } from "react";
import { Pressable, View, Text, Image, StyleSheet } from "react-native";
import { colors, radius, spacing, sizes, weights, tileColorFor } from "../../theme";

// Fallback image mapping keyed by category name – used when the API
// hasn't yet returned an `image` field (e.g. before re-seeding).
const FALLBACK_IMAGES = {
  "Fruits & Vegetables":    "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop",
  "Dairy, Bread & Eggs":    "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=400&fit=crop",
  "Atta, Rice, Oil & Dals": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop",
  "Meat & Fish":            "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=400&fit=crop",
  "Masala & Dry Fruits":    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop",
  "Breakfast & Sauces":     "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=400&fit=crop",
  "Packaged Food":          "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=400&fit=crop",
  "Tea, Coffee & More":     "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop",
  "Ice Creams & More":      "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=400&fit=crop",
  "Frozen Food":            "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=400&fit=crop",
  "Chips & Namkeen":        "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop",
  "Cold Drinks & Juices":   "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&h=400&fit=crop",
  "Cleaning Supplies":      "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400&h=400&fit=crop",
  "Personal Care":          "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop",
  "Home & Kitchen":         "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
};

export default function CategoryTile({ name, emoji = "📦", image, onPress, variant = "card", active = false }) {
  const bg = tileColorFor(name || emoji);
  const isCard = variant === "card";
  const imageUrl = image || FALLBACK_IMAGES[name];
  const [imgError, setImgError] = useState(false);

  return (
    <Pressable onPress={onPress} style={[styles.base, isCard && styles.card, ({ pressed }) => pressed && styles.pressed]}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: bg },
          isCard ? styles.iconCard : styles.iconCompact,
          active && styles.iconActive,
        ]}
      >
        {imageUrl && !imgError ? (
          <Image
            source={{ uri: imageUrl }}
            style={[
              styles.image,
              isCard ? styles.imageCard : styles.imageCompact,
            ]}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <Text style={{ fontSize: isCard ? 24 : 26 }}>{emoji}</Text>
        )}
      </View>
      <Text style={[styles.label, active && styles.labelActive]} numberOfLines={2}>{name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: "center", gap: 7 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xxl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  pressed: { opacity: 0.9 },
  iconWrap: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
  iconCard: { width: 56, height: 56, borderRadius: radius.lg },
  iconCompact: { width: "100%", aspectRatio: 1, borderRadius: radius.xl },
  iconActive: { borderWidth: 2, borderColor: colors.primary },
  image: { width: "100%", height: "100%" },
  imageCard: { borderRadius: radius.lg },
  imageCompact: { borderRadius: radius.xl },
  label: { fontSize: sizes.xs, fontWeight: weights.bold, color: colors.inkMuted, textAlign: "center" },
  labelActive: { color: colors.primary },
});
