import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("auction_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("auction_token"));

  useEffect(() => {
    if (token) localStorage.setItem("auction_token", token);
    else localStorage.removeItem("auction_token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("auction_user", JSON.stringify(user));
    else localStorage.removeItem("auction_user");
  }, [user]);

  async function login(email, password) {
    const { data } = await api.post("/api/auth/login", { email, password });
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function register(name, email, password, role) {
    const { data } = await api.post("/api/auth/register", { name, email, password, role });
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  function logout() {
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
