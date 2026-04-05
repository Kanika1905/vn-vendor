import React, { createContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (newToken, vendorData) => {
    setToken(newToken);
    setUser(vendorData);
    await AsyncStorage.setItem("vendorToken", newToken);
    await AsyncStorage.setItem("vendorUser", JSON.stringify(vendorData));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem("vendorToken");
    await AsyncStorage.removeItem("vendorUser");
  };

  const updateUser = (updatedData) => {
    setUser(updatedData);
    AsyncStorage.setItem("vendorUser", JSON.stringify(updatedData));
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}