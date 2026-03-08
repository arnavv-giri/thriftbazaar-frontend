import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { requestVendorStatus, getMyVendorProfile } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import "./BecomeSeller.css";

/**
 * Become a Seller page.
 *
 * Accessible to any logged-in user (CUSTOMER or pending VENDOR).
 *
 * States the page can be in:
 *  1. Not logged in → redirect to /login
 *  2. Already has a vendor profile (pending) → show pending message
 *  3. Already approved (VENDOR) → redirect to /dashboard
 *  4. No vendor profile yet → show the request form
 */
function BecomeSeller() {
  const navigate = useNavigate();
  const { isLoggedIn, role } = useAuth();

  const [storeName, setStoreName]   = useState("");
  const [storeError, setStoreError] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading]       = useState(false);

  // Pending state: null = unknown, true = pending, false = no profile
  const [pendingProfile, setPendingProfile] = useState(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  // ── Auth gates ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    // Already an approved vendor — go straight to dashboard
    if (role === "VENDOR") {
      navigate("/dashboard");
      return;
    }

    // Check if they already have a pending vendor request
    getMyVendorProfile()
      .then((profile) => {
        // Profile exists — could be pending or approved
        setPendingProfile(profile);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          // No profile yet — show the form
          setPendingProfile(null);
        }
        // Any other error: fall through to form (will show server error on submit if needed)
      })
      .finally(() => setCheckingProfile(false));
  }, [isLoggedIn, role, navigate]);

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!storeName.trim()) {
      setStoreError("Store name is required");
      return;
    }
    if (storeName.trim().length < 2) {
      setStoreError("Store name must be at least 2 characters");
      return;
    }

    setLoading(true);

    try {
      const profile = await requestVendorStatus(storeName.trim());
      setPendingProfile(profile);  // show the pending UI
    } catch (err) {
      if (err.response?.status === 409) {
        setServerError("You have already submitted a vendor request.");
      } else {
        setServerError(
          err.response?.data?.message || "Something went wrong. Please try again."
        );
      }
      setLoading(false);
    }
  };

  // ── Render: loading ───────────────────────────────────────────────────
  if (checkingProfile) {
    return (
      <div className="become-seller-container">
        <div className="become-seller-card">
          <p>Checking your account...</p>
        </div>
      </div>
    );
  }

  // ── Render: approved but still on old CUSTOMER JWT ────────────────────
  if (pendingProfile && pendingProfile.approved) {
    return (
      <div className="become-seller-container">
        <div className="become-seller-card become-seller-card--pending">
          <div className="pending-icon">✅</div>
          <h2>You're Approved!</h2>
          <p>
            Your seller account for <strong>"{pendingProfile.storeName}"</strong> has
            been approved. Please log out and sign back in to activate your seller
            access.
          </p>
          <Button variant="primary" onClick={() => navigate("/login")}>
            Log Out &amp; Sign In Again
          </Button>
        </div>
      </div>
    );
  }

  // ── Render: already pending ───────────────────────────────────────────
  if (pendingProfile && !pendingProfile.approved) {
    return (
      <div className="become-seller-container">
        <div className="become-seller-card become-seller-card--pending">
          <div className="pending-icon">⏳</div>
          <h2>Application Under Review</h2>
          <p>
            Your seller application for <strong>"{pendingProfile.storeName}"</strong> has
            been submitted and is awaiting admin approval.
          </p>
          <p className="pending-note">
            We'll review your request shortly. Once approved, you'll be able to list
            products on ThriftBazaar.
          </p>
          <Button variant="secondary" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // ── Render: the request form ──────────────────────────────────────────
  return (
    <div className="become-seller-container">
      <div className="become-seller-card">
        <div className="become-seller-header">
          <h1>Become a Seller</h1>
          <p className="subtitle">
            Turn your closet into cash. Fill in your store details and we'll
            review your application.
          </p>
        </div>

        {serverError && <div className="error-message">{serverError}</div>}

        <form onSubmit={handleSubmit} className="become-seller-form">
          <div className="form-group">
            <label htmlFor="storeName">Store Name *</label>
            <input
              id="storeName"
              name="storeName"
              type="text"
              placeholder="My Thrift Store"
              value={storeName}
              onChange={(e) => {
                setStoreName(e.target.value);
                if (storeError) setStoreError("");
              }}
              disabled={loading}
            />
            {storeError && <span className="error-text">{storeError}</span>}
          </div>

          <div className="seller-info-box">
            <p>
              ⚠️ After submitting, your request will be reviewed by our team.
              You'll be notified once your seller account is approved.
            </p>
          </div>

          <Button type="submit" variant="primary" size="md" fullWidth loading={loading}>
            Submit Application
          </Button>
        </form>

        <div className="become-seller-footer">
          <Link to="/">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default BecomeSeller;
