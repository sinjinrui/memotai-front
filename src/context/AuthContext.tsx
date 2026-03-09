import { createContext, useContext, useState, useEffect } from "react";
import { setTokens, clearTokens, setGuestLogin, getGuestLogin, clearGuestLogin } from "../utils/token";
import api from "../lib/axios"

type AuthContextType = {
  isAuthenticated: boolean;
  isGuestLogin: boolean;
  login: (access: string, refresh: string) => void;
  guestLogin: (access: string, refresh: string) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuestLogin, setIsGuestLogin] = useState(getGuestLogin());

  // 初回ロード時にtoken確認
  useEffect(() => {
    const token = localStorage.getItem("memotai_access_token");
    setIsAuthenticated(!!token);
  }, []);

  const login = (access: string, refresh: string) => {
    setTokens(access, refresh);
    setIsAuthenticated(true);
  };

  const guestLogin = (access: string, refresh: string) => {
    setTokens(access, refresh);
    setIsAuthenticated(true);
    setGuestLogin();
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (e) {
      console.error(e);
    } finally {
      clearTokens();
      setIsAuthenticated(false);
      clearGuestLogin();
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isGuestLogin, login, logout, guestLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};