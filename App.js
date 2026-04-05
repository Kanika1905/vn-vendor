import { registerRootComponent } from "expo";
import React, { useEffect, useState, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider, AuthContext } from "./app/context/authContext";
import AppNavigator from "./app/navigation/appNavigator";
import { View, ActivityIndicator } from "react-native";
import { COLORS } from "./app/constants";

function RootNavigator() {
  const { login } = useContext(AuthContext);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const t = await AsyncStorage.getItem("vendorToken");
        const u = await AsyncStorage.getItem("vendorUser");
        if (t && u) login(t, JSON.parse(u));
      } catch (e) {
        console.log("Session restore error", e);
      } finally {
        setChecking(false);
      }
    };
    restore();
  }, []);

  if (checking)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );

  return <AppNavigator />;
}

function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

registerRootComponent(App);