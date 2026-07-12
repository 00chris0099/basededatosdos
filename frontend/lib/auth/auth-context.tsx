"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { mockData } from "@/lib/mock/data";

interface AuthContextType {
  user: typeof mockData.session;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  canManage: () => boolean;
  canSupervise: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<typeof mockData.session>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("wmspro_session");
    if (stored) {
      try {
        const session = JSON.parse(stored);
        mockData.session = session;
        setUser(session);
      } catch { localStorage.removeItem("wmspro_session"); }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const found = mockData.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.active
    );
    if (!found) throw new Error("Usuario o contraseña incorrectos.");
    const session = { id: found.id, name: found.name, email: found.email, dni: found.dni, role: found.role, photo: found.photo };
    mockData.session = session;
    localStorage.setItem("wmspro_session", JSON.stringify(session));
    setUser(session);
  };

  const logout = () => {
    mockData.session = null;
    localStorage.removeItem("wmspro_session");
    setUser(null);
  };

  const canManage = () => user?.role === "Administrador" || user?.role === "Dueño";
  const canSupervise = () => ["Administrador", "Dueño", "Supervisor"].includes(user?.role || "");

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, canManage, canSupervise }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
