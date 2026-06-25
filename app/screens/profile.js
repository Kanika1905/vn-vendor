import React, { useState, useContext } from "react";
import {
  View, Text, TextInput, StyleSheet, Alert, ScrollView, Modal, Pressable,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { CONFIG } from "../constants";
import { AuthContext } from "../context/authContext";
import { colors, spacing, radius, sizes, weights, type } from "../theme";
import { Screen, Header, Card, Avatar, Button, MenuRow, IconButton, Icon } from "../components/ui";

export default function Profile({ navigation }) {
  const { token, user, logout, updateUser } = useContext(AuthContext);
  const [businessName, setBusinessName] = useState(user?.businessName || "");
  const [address, setAddress] = useState(user?.address || "");
  const [loading, setLoading] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  const isComplete = !!(user?.businessName && user?.address);

  const openEdit = () => {
    setBusinessName(user?.businessName || "");
    setAddress(user?.address || "");
    setEditVisible(true);
  };

  const handleSave = async () => {
    if (!businessName || !address) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${CONFIG.BASE_URL}/vendor/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ businessName, address }),
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data.vendor);
        setEditVisible(false);
        Alert.alert("Success", "Profile updated!");
      } else {
        Alert.alert("Error", data.message || "Update failed");
      }
    } catch (err) {
      console.log("Save error:", err);
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: () => logout() },
    ]);
  };

  const soon = () => Alert.alert("Coming soon", "This feature is on the way.");

  return (
    <Screen>
      <Header title="Profile" large right={<IconButton name="cart" onPress={() => navigation.navigate("Cart")} />} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Avatar name={businessName || user?.businessName || "Vendor"} size={56} rounded={radius.xl} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.heroName} numberOfLines={1}>{user?.businessName || "Your business"}</Text>
            {user?.phone ? <Text style={styles.heroPhone}>+91 {user.phone}</Text> : null}
            {isComplete && (
              <View style={styles.badge}>
                <Icon name="verified" size={12} color="#6FD79B" />
                <Text style={styles.badgeText}>Profile complete</Text>
              </View>
            )}
          </View>
        </View>

        {/* Menu */}
        <Card padded={false} style={styles.menu}>
          <MenuRow icon="briefcase" label="Business Details" onPress={openEdit} />
          <MenuRow icon="clock" label="Order History" onPress={() => navigation.navigate("myOrders")} />
          <MenuRow icon="credit-card" label="Payment Methods" onPress={soon} />
          <MenuRow icon="bell" label="Notifications" onPress={soon} />
          <MenuRow icon="settings" label="Settings" onPress={soon} last />
        </Card>

        <Button title="Log out" variant="danger" iconLeft="logout" onPress={handleLogout} />
      </ScrollView>

      {/* Business Details edit section */}
      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.sheetHead}>
              <Text style={type.h2}>Business Details</Text>
              <Pressable style={styles.closeBtn} onPress={() => setEditVisible(false)} hitSlop={8}>
                <Icon name="close" size={16} color={colors.inkMuted} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.sheetBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={[type.label, styles.label]}>Business name</Text>
              <TextInput
                style={styles.input}
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="Enter your business name"
                placeholderTextColor={colors.inkFaint}
              />
              <Text style={[type.label, styles.label]}>Business address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your business address"
                placeholderTextColor={colors.inkFaint}
                multiline
              />
              <Button title="Save changes" onPress={handleSave} loading={loading} style={{ marginTop: spacing.sm }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.xxxl },

  hero: {
    flexDirection: "row", alignItems: "center", gap: spacing.lg,
    backgroundColor: colors.primaryDeep, borderRadius: radius.xxl + 2,
    padding: spacing.lg, marginBottom: spacing.xl,
  },
  heroName: { fontSize: sizes.xl, fontWeight: weights.heavy, color: colors.inkInverse },
  heroPhone: { fontSize: sizes.sm + 0.5, fontWeight: weights.semibold, color: "#9DC9AF", marginTop: 2 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 3, marginTop: 6 },
  badgeText: { fontSize: sizes.xs - 0.5, fontWeight: weights.heavy, color: "#6FD79B" },

  menu: { marginBottom: spacing.xl },

  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xxl + 2, borderTopRightRadius: radius.xxl + 2, maxHeight: "92%" },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong, alignSelf: "center", marginTop: spacing.md },
  sheetHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.xxl, paddingVertical: spacing.lg },
  closeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  sheetBody: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxxl + 8 },
  label: { marginBottom: 8, marginTop: spacing.md },
  input: {
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.borderStrong,
    borderRadius: radius.lg, paddingHorizontal: spacing.lg, paddingVertical: 14,
    fontSize: sizes.md + 0.5, fontWeight: weights.semibold, color: colors.ink,
  },
  textArea: { minHeight: 84, textAlignVertical: "top" },
});
