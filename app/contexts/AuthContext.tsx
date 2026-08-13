import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { setUnauthorizedHandler } from "../lib/api";
import type { User } from "../lib/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("shoppie_token") : null
  );
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const s = localStorage.getItem("shoppie_user");
    return s ? (JSON.parse(s) as User) : null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
      localStorage.removeItem("shoppie_token");
      localStorage.removeItem("shoppie_user");
      localStorage.removeItem("shoppie_csrf");
      navigate("/login");
    });
  }, [navigate]);

  const setAuth = (t: string, u: User) => {
    setToken(t);
    setUser(u);
    localStorage.setItem("shoppie_token", t);
    localStorage.setItem("shoppie_user", JSON.stringify(u));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("shoppie_token");
    localStorage.removeItem("shoppie_user");
    localStorage.removeItem("shoppie_csrf");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, setAuth, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
