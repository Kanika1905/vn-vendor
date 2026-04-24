// import React from "react";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";

// import Login from "../screens/login";
// import Home from "../screens/home";
// import Profile from "../screens/profile";

// const Stack = createNativeStackNavigator();

// export default function AppNavigator() {
//   return (
//     <Stack.Navigator
//       initialRouteName="login"
//       screenOptions={{ headerShown: false }}
//     >
//       <Stack.Screen name="login" component={Login} />
//       <Stack.Screen name="home" component={Home} />
//       <Stack.Screen name="profile" component={Profile} />
//     </Stack.Navigator>
//   );
// }
// // app/navigation/appNavigator.js
// app/navigation/appNavigator.js
import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthContext } from "../context/authContext";
import { COLORS, FONTS } from "../constants";
import Cart from "../screens/cart";

import Login from "../screens/login";
import Home from "../screens/home";
import Profile from "../screens/profile";
import MyOrders from "../screens/myOrders";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab bar icon component
function TabIcon({ emoji, label, focused }) {
  return (
    <View style={tabStyles.iconWrapper}>
      <Text style={tabStyles.emoji}>{emoji}</Text>
      <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
    </View>
  );
}

// Bottom tab navigator for authenticated users
function VendorTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: tabStyles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="home"
        component={Home}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="myOrders"
        component={MyOrders}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📦" label="Orders" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="profile"
        component={Profile}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Root navigator — switches between auth and app
export default function AppNavigator() {
  const { token } = useContext(AuthContext);

  return (
    // AFTER — correct
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        [
          <Stack.Screen key="tabs" name="vendorTabs" component={VendorTabs} />,
          <Stack.Screen key="cart" name="Cart" component={Cart} />,
        ]
      ) : (
        <Stack.Screen name="login" component={Login} />
      )}
    </Stack.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  tabBar: {
    height: 64,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
  },
  emoji: { fontSize: 22 },
  label: {
    fontSize: 10, fontWeight: "600",
    color: COLORS.textSecondary, marginTop: 2,
  },
  labelActive: { color: COLORS.primary },
});