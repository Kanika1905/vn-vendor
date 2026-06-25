import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthContext } from "../context/authContext";
import { colors } from "../theme";
import BottomTabBar from "./BottomTabBar";

import Cart from "../screens/cart";
import CategoryProducts from "../screens/categoryProducts";
import Login from "../screens/login";
import Home from "../screens/home";
import Profile from "../screens/profile";
import MyOrders from "../screens/myOrders";
import Categories from "../screens/categories";
import TrackOrder from "../screens/trackOrder";
import LiveTrackOrder from "../screens/liveTrackOrder";
import ProductDetails from "../screens/productDetails";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function VendorTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tab.Screen name="home" component={Home} />
      <Tab.Screen name="categories" component={Categories} />
      <Tab.Screen name="myOrders" component={MyOrders} />
      <Tab.Screen name="profile" component={Profile} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { token } = useContext(AuthContext);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.screen } }}>
      {token ? (
        <>
          <Stack.Screen name="vendorTabs" component={VendorTabs} />
          <Stack.Screen name="Cart" component={Cart} />
          <Stack.Screen name="categoryProducts" component={CategoryProducts} />
          <Stack.Screen name="productDetails" component={ProductDetails} />
          <Stack.Screen name="trackOrder" component={TrackOrder} />
          <Stack.Screen name="liveTrack" component={LiveTrackOrder} />
        </>
      ) : (
        <Stack.Screen name="login" component={Login} />
      )}
    </Stack.Navigator>
  );
}
