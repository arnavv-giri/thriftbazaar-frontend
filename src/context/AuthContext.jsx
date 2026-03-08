import { createContext, useContext, useEffect, useState } from "react";
import { getToken, setToken as storeToken, clearAuth, getUserRole, getUserEmail } from "../utils/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole]             = useState(null);
  const [email, setEmail]           = useState(null);
  const [loading, setLoading]       = useState(true);

  // Hydrate from localStorage on first load
  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsLoggedIn(true);
      setRole(getUserRole());
      setEmail(getUserEmail());
    }
    setLoading(false);

    // React to token changes in other tabs
    const handleStorageChange = () => {
      const t = getToken();
      setIsLoggedIn(!!t);
      setRole(t ? getUserRole() : null);
      setEmail(t ? getUserEmail() : null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  /**
   * Called after a successful login.
   * Stores the JWT, caches role + email in localStorage, and
   * updates all reactive context state atomically.
   *
   * @param {string} token - raw JWT string from the server
   */
  const login = (token) => {
    storeToken(token);
    const derivedRole  = getUserRole();  // decoded from the JWT we just stored
    const derivedEmail = getUserEmail();
    // Cache for cross-tab sync and clearAuth()
    if (derivedRole)  localStorage.setItem("role",  derivedRole);
    if (derivedEmail) localStorage.setItem("email", derivedEmail);
    setIsLoggedIn(true);
    setRole(derivedRole);
    setEmail(derivedEmail);
  };

  /**
   * Clears auth state and token. Does NOT redirect — callers navigate themselves.
   */
  const logout = () => {
    clearAuth();
    setIsLoggedIn(false);
    setRole(null);
    setEmail(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, email, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
