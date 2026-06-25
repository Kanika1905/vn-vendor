// app/components/ui/Screen.js
// Standard screen wrapper: themed background + safe-area aware top/bottom padding.
import React from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme";

/**
 * @param {string}  background  - screen background color (default app screen bg)
 * @param {boolean} edges       - apply safe-area top padding (default true)
 * @param {boolean} bottomInset - apply safe-area bottom padding (default false; tab bars handle their own)
 */
export default function Screen({
  children,
  background = colors.screen,
  edges = true,
  bottomInset = false,
  style,
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: background,
          paddingTop: edges ? insets.top : 0,
          paddingBottom: bottomInset ? insets.bottom : 0,
        },
        style,
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={background} translucent={false} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
