import axios from "axios";

/**
 * Pre-configured Axios instance used by every API module.
 *
 * The base URL is read from the VITE_API_BASE_URL environment variable
 * so that the same build artifact can point at different backends
 * (local dev, staging, production) without any source-code changes.
 *
 * Set the value in:
 *   .env              → local development  (http://localhost:8081)
 *   .env.production   → production build   (https://api.yourdomain.com)
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
