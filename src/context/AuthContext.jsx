import { createContext, useContext, useEffect, useState } from "react";
import { getToken, setToken as storeToken, logout as logoutUser } from "../utils/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
    setLoading(false);

    const handleStorageChange = () => {
      setIsLoggedIn(!!getToken());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (token) => {
    storeToken(token);
    setIsLoggedIn(true);
  };

  const logout = () => {
    logoutUser();
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};