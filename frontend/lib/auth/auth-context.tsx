"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { apiClient } from "@/lib/api/client";

interface UserSession {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  canManage: () => boolean;
  canSupervise: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("wmspro_token");
    const storedUser = localStorage.getItem("wmspro_user");
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("wmspro_token");
        localStorage.removeItem("wmspro_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    const { token: newToken, user: userData } = response.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("wmspro_token", newToken);
    localStorage.setItem("wmspro_user", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("wmspro_token");
    localStorage.removeItem("wmspro_user");
  };

  const canManage = () => user?.role === "Administrador" || user?.role === "Dueño";
  const canSupervise = () => ["Administrador", "Dueño", "Supervisor"].includes(user?.role || "");

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, canManage, canSupervise }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
