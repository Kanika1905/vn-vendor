import React, { useState, useContext } from "react";
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Alert,
} from "react-native";
import { CONFIG } from "../constants";
import { AuthContext } from "../context/authContext";
import { colors, spacing, radius, sizes, weights, shadow, type } from "../theme";
import { Screen, Button, Icon } from "../components/ui";

export default function Login({ navigation }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  // ── Auth (unchanged backend contract) ──
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
        await login(data.token, data.vendor);
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
    <Screen background={colors.surface}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.flexGrow}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.brandRow}>
              <View style={styles.logo}>
                <Icon name="shopping-bag" size={20} color={colors.inkInverse} />
              </View>
              <Text style={styles.brand}>VendorNest</Text>
            </View>
            <View style={styles.heroEmojiWrap}>
              <Text style={styles.heroEmoji}>🛒</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={type.display}>Stock your store,{"\n"}the easy way.</Text>
            <Text style={[type.body, styles.subtitle]}>
              Order wholesale supplies in a tap. Just enter your number to begin.
            </Text>

            <Text style={[type.label, styles.fieldLabel]}>Mobile number</Text>
            <View style={styles.inputRow}>
              <Text style={styles.prefix}>🇮🇳 +91</Text>
              <View style={styles.inputDivider} />
              <TextInput
                style={styles.input}
                placeholder="98765 43210"
                placeholderTextColor={colors.inkFaint}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={10}
              />
            </View>

            <Button
              title="Continue"
              iconRight="next"
              onPress={handleLogin}
              loading={loading}
            />

            <Text style={styles.terms}>
              By continuing you agree to our <Text style={styles.link}>Terms</Text> &{" "}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexGrow: { flexGrow: 1 },

  hero: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl + 14,
    alignItems: "center",
    borderBottomLeftRadius: 44,
    borderBottomRightRadius: 44,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm + 2, marginBottom: spacing.xxl + 6 },
  logo: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", ...shadow.primary },
  brand: { fontSize: 22, fontWeight: weights.heavy, color: colors.primaryDeep, letterSpacing: -0.2 },
  heroEmojiWrap: {
    width: 138, height: 138, borderRadius: 46, backgroundColor: colors.surface,
    alignItems: "center", justifyContent: "center", ...shadow.raised,
  },
  heroEmoji: { fontSize: 66 },

  form: { paddingHorizontal: spacing.xxl, paddingTop: spacing.xxxl, flex: 1 },
  subtitle: { marginTop: spacing.sm, marginBottom: spacing.xxl + 4 },
  fieldLabel: { marginBottom: 9 },

  inputRow: {
    flexDirection: "row", alignItems: "center", gap: spacing.md,
    backgroundColor: colors.surfaceAlt, borderWidth: 1.5, borderColor: colors.borderStrong,
    borderRadius: radius.xl, paddingHorizontal: spacing.lg, height: 58, marginBottom: spacing.xxl,
  },
  prefix: { fontSize: sizes.lg + 1, fontWeight: weights.bold, color: colors.ink },
  inputDivider: { width: 1, height: 24, backgroundColor: "#DCE5DC" },
  input: { flex: 1, fontSize: sizes.lg + 2, fontWeight: weights.bold, color: colors.ink, letterSpacing: 0.5, padding: 0 },

  terms: { marginTop: spacing.lg, textAlign: "center", fontSize: sizes.sm, fontWeight: weights.medium, color: colors.inkFaint, lineHeight: 18 },
  link: { color: colors.primary, fontWeight: weights.bold },
});
