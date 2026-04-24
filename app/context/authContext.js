import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ prevent rendering before storage loads

  // ✅ Restore token + user on app start
  useEffect(() => {
  const restore = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("vendorToken");
      const storedUser = await AsyncStorage.getItem("vendorUser");
      console.log("=== RESTORE ===");
      console.log("storedToken:", storedToken);  
      console.log("storedUser:", storedUser);
      if (storedToken) setToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (err) {
      console.log("Auth restore error:", err);
    } finally {
      setLoading(false);
    }
  };
  restore();
}, []);

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
    <AuthContext.Provider value={{ token, user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}