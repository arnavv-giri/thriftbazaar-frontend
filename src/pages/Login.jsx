import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import "./Login.css";

/**
 * Login page — email/password + Google/GitHub OAuth2.
 *
 * OAuth2 flow:
 *   Click "Continue with Google"
 *     → browser navigates to backend GET /oauth2/authorization/google
 *     → Spring Security redirects to Google's consent screen
 *     → Google redirects to backend GET /oauth2/callback/google
 *     → backend calls OAuthService, issues JWT, redirects to
 *       frontend /oauth2/redirect?token=<JWT>
 *     → OAuth2Redirect.jsx calls login(token) and routes to dashboard.
 *
 * The VITE_API_BASE_URL env var already points at the correct backend,
 * so we derive the OAuth2 URL from it.
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const navigate  = useNavigate();
  const { login } = useAuth();

  // ── Email / password login ────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser(email.trim(), password);
      login(data.token);

      if (data.role === "VENDOR")      navigate("/dashboard");
      else if (data.role === "ADMIN")  navigate("/admin");
      else                             navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid email or password";
      setError(msg);
      setLoading(false);
    }
  };

  // ── OAuth2 — just navigate the browser to the backend endpoint ────────
  const handleOAuth2 = (provider) => {
    // Full-page redirect — Spring Security takes over from here.
    window.location.href = `${API_BASE}/oauth2/authorization/${provider}`;
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>ThriftBazaar</h1>
          <p className="subtitle">Login to your account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* ── Social login buttons ── */}
        <div className="oauth-buttons">
          <button
            className="oauth-btn oauth-btn--google"
            onClick={() => handleOAuth2("google")}
            type="button"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <button
            className="oauth-btn oauth-btn--github"
            onClick={() => handleOAuth2("github")}
            type="button"
          >
            <GitHubIcon />
            Continue with GitHub
          </button>
        </div>

        <div className="oauth-divider">
          <span>or continue with email</span>
        </div>

        {/* ── Email / password form ── */}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" variant="primary" size="md" fullWidth loading={loading}>
            Sign In
          </Button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <Link to="/register">Create one here</Link></p>
        </div>
      </div>
    </div>
  );
}

// ── Inline SVG icons (no extra dep needed) ────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

export default Login;
