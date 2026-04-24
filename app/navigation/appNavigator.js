// // import React from "react";
// // import { createNativeStackNavigator } from "@react-navigation/native-stack";

// // import Login from "../screens/login";
// // import Home from "../screens/home";
// // import Profile from "../screens/profile";

// // const Stack = createNativeStackNavigator();

// // export default function AppNavigator() {
// //   return (
// //     <Stack.Navigator
// //       initialRouteName="login"
// //       screenOptions={{ headerShown: false }}
// //     >
// //       <Stack.Screen name="login" component={Login} />
// //       <Stack.Screen name="home" component={Home} />
// //       <Stack.Screen name="profile" component={Profile} />
// //     </Stack.Navigator>
// //   );
// // }
// // // app/navigation/appNavigator.js
// // app/navigation/appNavigator.js
// import React, { useContext } from "react";
// import { View, Text, StyleSheet } from "react-native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { AuthContext } from "../context/authContext";
// import { COLORS, FONTS } from "../constants";
// import Cart from "../screens/cart";
// import CategoryProducts from "../screens/categoryProducts";
// import Login from "../screens/login";
// import Home from "../screens/home";
// import Profile from "../screens/profile";
// import MyOrders from "../screens/myOrders";
// import Categories from "../screens/categories";

// const Stack = createNativeStackNavigator();
// const Tab = createBottomTabNavigator();

// // Tab bar icon component
// function TabIcon({ emoji, label, focused }) {
//   return (
//     <View style={tabStyles.iconWrapper}>
//       <Text style={tabStyles.emoji}>{emoji}</Text>
//       <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
//     </View>
//   );
// }

// // Bottom tab navigator for authenticated users
// function VendorTabs() {
//   return (
//     <Tab.Navigator
//       screenOptions={{
//         headerShown: false,
//         tabBarStyle: tabStyles.tabBar,
//         tabBarShowLabel: false,
//       }}
//     >
//       <Tab.Screen
//         name="home"
//         component={Home}
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <TabIcon emoji="🏠" label="Home" focused={focused} />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="categories"
//         component={Categories}
//         options={{
//           tabBarLabel: "Categories",
//           tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⊞</Text>,
//         }}
//       />
//       <Tab.Screen
//         name="myOrders"
//         component={MyOrders}
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <TabIcon emoji="📦" label="Orders" focused={focused} />
//           ),
//         }}
//       />
//       <Stack.Screen
//         name="categoryProducts"
//         component={CategoryProducts}
//         options={{ headerShown: false }}
//       />
//       <Tab.Screen
//         name="profile"
//         component={Profile}
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <TabIcon emoji="👤" label="Profile" focused={focused} />
//           ),
//         }}
//       />
//     </Tab.Navigator>
//   );
// }

// // Root navigator — switches between auth and app
// export default function AppNavigator() {
//   const { token } = useContext(AuthContext);

//   return (
//     // AFTER — correct
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       {token ? (
//         [
//           <Stack.Screen key="tabs" name="vendorTabs" component={VendorTabs} />,
//           <Stack.Screen key="cart" name="Cart" component={Cart} />,
//         ]
//       ) : (
//         <Stack.Screen name="login" component={Login} />
//       )}
//     </Stack.Navigator>
//   );
// }

// const tabStyles = StyleSheet.create({
//   tabBar: {
//     height: 64,
//     backgroundColor: COLORS.white,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.lightGray,
//     elevation: 12,
//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowRadius: 12,
//   },
//   iconWrapper: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingTop: 6,
//   },
//   emoji: { fontSize: 22 },
//   label: {
//     fontSize: 10, fontWeight: "600",
//     color: COLORS.textSecondary, marginTop: 2,
//   },
//   labelActive: { color: COLORS.primary },
// });

import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthContext } from "../context/authContext";
import { COLORS } from "../constants";
import Cart from "../screens/cart";
import CategoryProducts from "../screens/categoryProducts";
import Login from "../screens/login";
import Home from "../screens/home";
import Profile from "../screens/profile";
import MyOrders from "../screens/myOrders";
import Categories from "../screens/categories";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ── Icon components ───────────────────────────────────────────────────

function HomeIcon({ focused }) {
  const c = focused ? COLORS.primary : "#888";
  return (
    <View style={tabStyles.iconWrapper}>
      <View style={{ width: 24, height: 24, alignItems: "center", justifyContent: "center" }}>
        {/* House shape */}
        <View style={{
          width: 14, height: 10, borderWidth: 2, borderColor: c,
          borderTopWidth: 0, position: "absolute", bottom: 0,
          borderRadius: 1,
        }} />
        {/* Roof */}
        <View style={{
          width: 0, height: 0,
          borderLeftWidth: 11, borderRightWidth: 11, borderBottomWidth: 9,
          borderLeftColor: "transparent", borderRightColor: "transparent",
          borderBottomColor: c,
          position: "absolute", top: 1,
        }} />
        {/* Door */}
        <View style={{
          width: 4, height: 5, borderWidth: 1.5, borderColor: c,
          borderTopWidth: 0, position: "absolute", bottom: 0,
          borderBottomLeftRadius: 1, borderBottomRightRadius: 1,
        }} />
      </View>
      <Text style={[tabStyles.label, { color: c }]}>Home</Text>
    </View>
  );
}

function CategoriesIcon({ focused }) {
  const c = focused ? COLORS.primary : "#888";
  return (
    <View style={tabStyles.iconWrapper}>
      <View style={{ width: 24, height: 24, alignItems: "center", justifyContent: "center" }}>
        {/* 2x2 grid of squares */}
        <View style={{ flexDirection: "row", gap: 3 }}>
          <View style={{ gap: 3 }}>
            <View style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: c }} />
            <View style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: c }} />
          </View>
          <View style={{ gap: 3 }}>
            <View style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: c }} />
            <View style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: c }} />
          </View>
        </View>
      </View>
      <Text style={[tabStyles.label, { color: c }]}>Categories</Text>
    </View>
  );
}

function OrdersIcon({ focused }) {
  const c = focused ? COLORS.primary : "#888";
  return (
    <View style={tabStyles.iconWrapper}>
      <View style={{ width: 24, height: 24, alignItems: "center", justifyContent: "center" }}>
        {/* Bag outline */}
        <View style={{
          width: 16, height: 13, borderWidth: 2, borderColor: c,
          borderRadius: 3, position: "absolute", bottom: 0,
        }} />
        {/* Bag handle */}
        <View style={{
          width: 8, height: 5,
          borderLeftWidth: 2, borderRightWidth: 2, borderTopWidth: 2,
          borderColor: c, borderTopLeftRadius: 4, borderTopRightRadius: 4,
          position: "absolute", top: 2,
        }} />
      </View>
      <Text style={[tabStyles.label, { color: c }]}>Orders</Text>
    </View>
  );
}

function ProfileIcon({ focused }) {
  const c = focused ? COLORS.primary : "#888";
  return (
    <View style={tabStyles.iconWrapper}>
      <View style={{ width: 24, height: 24, alignItems: "center", justifyContent: "center" }}>
        {/* Head circle */}
        <View style={{
          width: 10, height: 10, borderRadius: 5,
          borderWidth: 2, borderColor: c,
          position: "absolute", top: 1,
        }} />
        {/* Shoulders arc */}
        <View style={{
          width: 18, height: 9,
          borderLeftWidth: 2, borderRightWidth: 2, borderTopWidth: 2,
          borderColor: c, borderTopLeftRadius: 9, borderTopRightRadius: 9,
          position: "absolute", bottom: 0,
        }} />
      </View>
      <Text style={[tabStyles.label, { color: c }]}>Profile</Text>
    </View>
  );
}

// ── Tab Navigator ─────────────────────────────────────────────────────
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
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="categories"
        component={Categories}
        options={{
          tabBarIcon: ({ focused }) => <CategoriesIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="myOrders"
        component={MyOrders}
        options={{
          tabBarIcon: ({ focused }) => <OrdersIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="profile"
        component={Profile}
        options={{
          tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

// ── Root Navigator ────────────────────────────────────────────────────
export default function AppNavigator() {
  const { token } = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          <Stack.Screen name="vendorTabs" component={VendorTabs} />
          <Stack.Screen name="Cart" component={Cart} />
          <Stack.Screen name="categoryProducts" component={CategoryProducts} />
        </>
      ) : (
        <Stack.Screen name="login" component={Login} />
      )}
    </Stack.Navigator>
  );
}

// ── Styles ────────────────────────────────────────────────────────────
const tabStyles = StyleSheet.create({
  tabBar: {
    height: 64,
    backgroundColor: "#fff",
    borderTopWidth: 0.5,
    borderTopColor: "#e0e0e0",
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
});