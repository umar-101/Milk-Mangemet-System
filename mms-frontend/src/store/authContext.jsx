import React, { createContext, useState, useEffect, useContext } from "react";
import { login as apiLogin, createVendor, getVendor, updateVendor } from "../api/accounts";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Auto login from localStorage
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    if (token && username && role) {
      setUser({ username, token, role });
    }
    setLoading(false);
  }, []);

  // LOGIN
  const login = async (username, password) => {
    const data = await apiLogin(username, password);
    localStorage.setItem("access_token", data.access);
    if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
    localStorage.setItem("username", username);
    localStorage.setItem("role", "vendor");

    const userData = { username, token: data.access, role: "vendor" };
    setUser(userData);
    navigate("/vendor/dashboard");
  };

  // SIGNUP
  const signup = async (vendorData) => {
    await createVendor(vendorData);
    await login(vendorData.username, vendorData.password); // auto login after signup
  };

  // LOGOUT
  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
