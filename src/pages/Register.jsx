import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerVendor } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    shopName: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.shopName.trim()) {
      newErrors.shopName = "Shop name is required";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const data = await registerVendor({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        shopName: formData.shopName,
        description: formData.description,
      });

      if (data.token) {
        login(data.token);
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    } catch (err) {
      let errorMessage = "Registration failed. Please try again.";

      // Handle specific error status codes from backend
      if (err.response?.status === 409) {
        errorMessage = "This email is already in use. Please use a different email or sign in.";
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.error || "Please fill all required fields.";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }

      setServerError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Create Your Seller Account</h1>
          <p className="subtitle">
            Join ThriftBazaar and start selling today
          </p>
        </div>

        {serverError && (
          <div className="error-message">{serverError}</div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.name && (
                <span className="error-text">{errors.name}</span>
              )}
            </div>

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
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>
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
              />
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.confirmPassword && (
                <span className="error-text">
                  {errors.confirmPassword}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="shopName">Shop Name *</label>
            <input
              id="shopName"
              name="shopName"
              type="text"
              placeholder="My Thrift Shop"
              value={formData.shopName}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.shopName && (
              <span className="error-text">{errors.shopName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Shop Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Tell us about your shop and what you sell..."
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              rows="4"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={loading}
          >
            Create Account
          </Button>
        </form>

        <div className="register-footer">
          <p>Already have an account?</p>
          <a href="/login">Sign in here</a>
        </div>
      </div>
    </div>
  );
}

export default Register;