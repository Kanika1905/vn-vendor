import { registerRootComponent } from "expo";
import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider, AuthContext } from "./app/context/authContext";
import AppNavigator from "./app/navigation/appNavigator";
import { View, ActivityIndicator } from "react-native";
import { COLORS } from "./app/constants";
import { CartProvider } from "./app/context/cartContext";

function RootNavigator() {
  const { loading } = useContext(AuthContext); // ✅ just use loading from context

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return <AppNavigator />;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}
registerRootComponent(App);