// app/navigation/BottomTabBar.js
// Custom bottom tab bar: filled/outline Ionicons with an animated active pill.
import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, radius, sizes, weights, shadow } from "../theme";

// route name → label + icon pair (filled when focused, outline otherwise)
const TABS = {
  home: { label: "Home", active: "home", inactive: "home-outline" },
  categories: { label: "Categories", active: "grid", inactive: "grid-outline" },
  myOrders: { label: "Orders", active: "bag-handle", inactive: "bag-handle-outline" },
  profile: { label: "Profile", active: "person", inactive: "person-outline" },
};

function TabButton({ meta, focused, onPress, onLongPress }) {
  // Pop the icon slightly when it becomes active.
  const scale = useRef(new Animated.Value(focused ? 1 : 0.92)).current;
  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1 : 0.92,
      useNativeDriver: true,
      speed: 18,
      bounciness: 9,
    }).start();
  }, [focused, scale]);

  return (
    <Pressable
      style={styles.tab}
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={{ color: "transparent" }}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
    >
      <Animated.View style={[styles.pill, focused && styles.pillActive, { transform: [{ scale }] }]}>
        <Ionicons
          name={focused ? meta.active : meta.inactive}
          size={22}
          color={focused ? colors.primary : colors.inkFaint}
        />
      </Animated.View>
      <Text style={[styles.label, { color: focused ? colors.primary : colors.inkFaint }]} numberOfLines={1}>
        {meta.label}
      </Text>
    </Pressable>
  );
}

export default function BottomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 8, height: 64 + insets.bottom }]}>
      {state.routes.map((route, index) => {
        const meta = TABS[route.name];
        if (!meta) return null;
        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        const onLongPress = () => navigation.emit({ type: "tabLongPress", target: route.key });

        return (
          <TabButton key={route.key} meta={meta} focused={focused} onPress={onPress} onLongPress={onLongPress} />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    paddingHorizontal: spacing.sm,
    ...shadow.raised,
    shadowOffset: { width: 0, height: -4 },
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3 },
  pill: {
    width: 56,
    height: 32,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  pillActive: { backgroundColor: colors.primarySoft },
  label: { fontSize: sizes.xs - 0.5, fontWeight: weights.heavy, letterSpacing: 0.1 },
});
