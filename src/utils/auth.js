import { jwtDecode } from "jwt-decode";

export function getToken() {
  return localStorage.getItem("token");
}

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}

export function getAuthHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ✅ ADD THIS FUNCTION */
export function getUserRole() {

  const token = getToken();

  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.role;
  } catch {
    return null;
  }
}