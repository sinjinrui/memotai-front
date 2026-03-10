import { createContext, useContext, useState } from "react";
import {
  setTokens,
  clearTokens,
  setGuestLogin,
  getGuestLogin,
  clearGuestLogin
} from "../utils/token";
import api from "../lib/axios";

type AuthContextType = {
  isAuthenticated: boolean;
  isGuestLogin: boolean;
  login: (access: string, refresh: string) => void;
  guestLogin: (access: string, refresh: string) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("memotai_access_token")
  );

  const [isGuestLogin, setIsGuestLogin] = useState(
    getGuestLogin()
  );

  const login = (access: string, refresh: string) => {
    setTokens(access, refresh);
    setIsAuthenticated(true);
    setIsGuestLogin(false);
  };

  const guestLogin = (access: string, refresh: string) => {
    setTokens(access, refresh);
    setGuestLogin();
    setIsAuthenticated(true);
    setIsGuestLogin(true);
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (e) {
      console.error(e);
    } finally {
      clearTokens();
      clearGuestLogin();
      setIsAuthenticated(false);
      setIsGuestLogin(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isGuestLogin,
        login,
        guestLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};