import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerCustomer, loginUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import "./Register.css";

/**
 * Customer registration page.
 *
 * Flow:
 *  1. POST /users  → creates a CUSTOMER account
 *  2. POST /users/login → get JWT
 *  3. Store token via AuthContext.login()
 *  4. Redirect to home
 *
 * If the user wants to become a seller they can do so from the
 * "Become a Seller" page (/become-seller) after logging in.
 */
function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email:           "",
    password:        "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading]         = useState(false);

  // ── Validation ────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};

    if (!formData.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Invalid email format";
    }

    if (!formData.password) {
      errs.password = "Password is required";
    } else if (formData.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error as the user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);

    try {
      // 1. Create the CUSTOMER account
      await registerCustomer(formData.email.trim(), formData.password);

      // 2. Auto-login to get JWT
      const authData = await loginUser(formData.email.trim(), formData.password);

      // 3. Hydrate context
      login(authData.token);

      // 4. Go home
      navigate("/");
    } catch (err) {
      let msg = "Registration failed. Please try again.";

      if (err.response?.status === 409) {
        msg = "An account with this email already exists.";
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }

      setServerError(msg);
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Create Account</h1>
          <p className="subtitle">Shop pre-loved fashion on ThriftBazaar</p>
        </div>

        {serverError && <div className="error-message">{serverError}</div>}

        <form onSubmit={handleSubmit} className="register-form">

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
            />
            {fieldErrors.email && <span className="error-text">{fieldErrors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
              />
              {fieldErrors.password && (
                <span className="error-text">{fieldErrors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
              />
              {fieldErrors.confirmPassword && (
                <span className="error-text">{fieldErrors.confirmPassword}</span>
              )}
            </div>
          </div>

          <Button type="submit" variant="primary" size="md" fullWidth loading={loading}>
            Create Account
          </Button>
        </form>

        <div className="register-footer">
          <p>Already have an account? <Link to="/login">Sign in here</Link></p>
          <p className="register-seller-link">
            Want to sell? <Link to="/become-seller">Apply to become a seller →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
