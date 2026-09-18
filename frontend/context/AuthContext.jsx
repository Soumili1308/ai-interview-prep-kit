"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    try {
      const response = await api.get("/auth/me");

      setUser(response.user || response);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function login(email, password) {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    setUser(response.user || response);

    return response;
  }

  async function register(name, email, password) {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    setUser(response.user || response);

    return response;
  }

  async function logout() {
    try {
      await api.post("/auth/logout", {});
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}