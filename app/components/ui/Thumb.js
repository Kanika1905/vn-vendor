// app/components/ui/Thumb.js
// Square product/category thumbnail: shows an image if available, otherwise an
// emoji on a stable pastel background.
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { radius, tileColorFor } from "../../theme";

export default function Thumb({ uri, emoji = "📦", size = 62, rounded = radius.lg, colorKey, fontScale = 0.48, style }) {
  const dimension = { width: size, height: size, borderRadius: rounded };
  if (uri) {
    return <Image source={{ uri }} style={[dimension, style]} resizeMode="cover" />;
  }
  return (
    <View style={[dimension, styles.placeholder, { backgroundColor: tileColorFor(colorKey || emoji) }, style]}>
      <Text style={{ fontSize: size * fontScale }}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { alignItems: "center", justifyContent: "center" },
});
