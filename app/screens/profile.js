import React, { useState, useContext } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator,
} from "react-native";
import { COLORS, FONTS, CONFIG } from "../constants";
import { AuthContext } from "../context/authContext";

export default function Profile({ navigation }) {
  const { token, user, logout, updateUser } = useContext(AuthContext);
  const [businessName, setBusinessName] = useState(user?.businessName || "");
  const [address, setAddress] = useState(user?.address || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!businessName || !address) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      console.log("=== PROFILE SAVE DEBUG ===");
      console.log("token:", token);
      console.log("businessName:", businessName);
      console.log("address:", address);
      console.log("url:", `${CONFIG.BASE_URL}/vendor/profile`);

      const res = await fetch(`${CONFIG.BASE_URL}/vendor/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ businessName, address }),
      });
      const data = await res.json();
      console.log("response status:", res.status);
      console.log("response data:", JSON.stringify(data));

      if (res.ok) {
        updateUser(data.vendor);
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

  // Profile.js — update handleLogout
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout", style: "destructive",
        onPress: () => logout(), // ✅ just call logout — navigator auto-switches to login
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {businessName ? businessName[0].toUpperCase() : "V"}
          </Text>
        </View>
        <Text style={styles.phone}>{user?.phone || ""}</Text>
      </View>

      <Text style={styles.label}>Business Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your business name"
        placeholderTextColor={COLORS.gray}
        value={businessName}
        onChangeText={setBusinessName}
      />

      <Text style={styles.label}>Business Address</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter your business address"
        placeholderTextColor={COLORS.gray}
        value={address}
        onChangeText={setAddress}
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.saveBtnText}>Save Changes</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingTop: 56, paddingBottom: 20,
  },
  backBtn: { marginRight: 12 },
  backText: { fontSize: FONTS.sizes.md, color: COLORS.primary },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: "700", color: COLORS.textPrimary },
  avatarContainer: { alignItems: "center", marginVertical: 24 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center",
    marginBottom: 10,
  },
  avatarText: { fontSize: FONTS.sizes.xxxl, color: COLORS.white, fontWeight: "700" },
  phone: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary },
  label: {
    fontSize: FONTS.sizes.sm, fontWeight: "600",
    color: COLORS.textSecondary, marginBottom: 6, marginTop: 14,
  },
  input: {
    backgroundColor: COLORS.white, borderWidth: 1,
    borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 13,
    fontSize: FONTS.sizes.md, color: COLORS.textPrimary,
  },
  textArea: { height: 90, textAlignVertical: "top" },
  saveBtn: {
    backgroundColor: COLORS.primary, borderRadius: 10,
    paddingVertical: 15, alignItems: "center", marginTop: 28,
  },
  saveBtnText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: "600" },
  logoutBtn: {
    borderWidth: 1, borderColor: COLORS.error, borderRadius: 10,
    paddingVertical: 14, alignItems: "center", marginTop: 14,
  },
  logoutText: { color: COLORS.error, fontSize: FONTS.sizes.lg, fontWeight: "600" },
});