import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css"; // reuse login styles — same card look

/**
 * OAuth2Redirect
 * ─────────────
 * The backend redirects here after a successful Google / GitHub login:
 *
 *   http://localhost:5173/oauth2/redirect?token=<JWT>
 *
 * This page:
 *   1. Reads the `token` query param.
 *   2. Calls AuthContext.login(token) — same function used by the email/password
 *      flow, so role decoding, localStorage persistence, and cross-tab sync all
 *      work exactly the same way.
 *   3. Routes to the right dashboard based on role.
 *   4. On error (missing token or `?error=...` param) shows a friendly message.
 */
function OAuth2Redirect() {
  const navigate        = useNavigate();
  const { login, role } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("token");
    const err    = params.get("error");

    if (err || !token) {
      setError(
        err === "oauth_failed"
          ? "Social login failed. Please try again or use email & password."
          : "Authentication error. No token received."
      );
      return;
    }

    // Hydrate AuthContext — decodes email + role from JWT, saves to localStorage
    login(token);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Once login() has run, role is populated — navigate to the right place
  useEffect(() => {
    if (!role) return; // still loading
    if (role === "VENDOR") {
      navigate("/dashboard", { replace: true });
    } else if (role === "ADMIN") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [role, navigate]);

  // ── Render ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>ThriftBazaar</h1>
            <p className="subtitle">Social Login</p>
          </div>
          <div className="error-message">{error}</div>
          <p style={{ textAlign: "center", marginTop: "16px" }}>
            <a href="/login" style={{ color: "var(--color-primary-beige)", fontWeight: 600 }}>
              ← Back to Login
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card" style={{ textAlign: "center" }}>
        <div className="login-header">
          <h1>ThriftBazaar</h1>
          <p className="subtitle">Signing you in…</p>
        </div>
        <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
          <div style={{
            width: 40, height: 40,
            border: "3px solid var(--color-border)",
            borderTop: "3px solid var(--color-primary-beige)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

export default OAuth2Redirect;
