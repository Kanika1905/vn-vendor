import React, { useState, useContext } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { COLORS, FONTS, CONFIG } from "../constants";
import { AuthContext } from "../context/authContext";

export default function Login({ navigation }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!phone) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${CONFIG.BASE_URL}/auth/vendor/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (res.ok) {
        await login(data.token, data.vendor); // ✅ saves real JWT token
        navigation.replace("home");
      } else {
        Alert.alert("Error", data.message || "Login failed");
      }
    } catch (err) {
      console.log("Login error:", err);
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Vendor Login</Text>
      <Text style={styles.subtitle}>Enter your phone number to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor={COLORS.gray}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: COLORS.background,
    justifyContent: "center", paddingHorizontal: 24,
  },
  title: { fontSize: FONTS.sizes.xxxl, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 6 },
  subtitle: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginBottom: 32 },
  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 13,
    fontSize: FONTS.sizes.md, color: COLORS.textPrimary, marginBottom: 14,
  },
  button: {
    backgroundColor: COLORS.primary, borderRadius: 10,
    paddingVertical: 15, alignItems: "center", marginTop: 6,
  },
  buttonText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: "600" },
});