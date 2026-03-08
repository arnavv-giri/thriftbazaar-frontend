import { jwtDecode } from "jwt-decode";

// ─── Token storage ────────────────────────────────────────────────────────────

export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

/**
 * Removes all auth data from localStorage.
 * Does NOT redirect — the caller (AuthContext / component) handles navigation.
 */
export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
}

/** @deprecated Use AuthContext.logout() instead */
export function logout() {
  clearAuth();
  window.location.href = "/login";
}

// ─── Token inspection ─────────────────────────────────────────────────────────

export function isLoggedIn() {
  return !!getToken();
}

export function getAuthHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Decodes the JWT and returns the user's role claim.
 * Returns null if there is no token or it cannot be decoded.
 */
export function getUserRole() {
  const token = getToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.role ?? null;
  } catch {
    return null;
  }
}

/**
 * Decodes the JWT and returns the email (subject claim).
 * Returns null if there is no token or it cannot be decoded.
 */
export function getUserEmail() {
  const token = getToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.sub ?? null;
  } catch {
    return null;
  }
}
