import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyVendorProfile } from "../api/authApi";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, role, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);

  // Tracks vendor profile state for CUSTOMER users who may have a pending request
  // null  = not checked yet or not a customer
  // false = no vendor profile exists
  // { approved: false } = pending
  // { approved: true }  = approved but JWT still says CUSTOMER (stale token)
  const [vendorProfile, setVendorProfile] = useState(null);
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    // scrolled class adds box-shadow once the user has scrolled at all
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // When a CUSTOMER is logged in, quietly check if they have a vendor profile
  useEffect(() => {
    if (!isLoggedIn || role !== "CUSTOMER") {
      setVendorProfile(null);
      setProfileChecked(false);
      return;
    }

    getMyVendorProfile()
      .then((profile) => setVendorProfile(profile))
      .catch(() => setVendorProfile(false))   // 404 or error → no profile
      .finally(() => setProfileChecked(true));
  }, [isLoggedIn, role]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Derived label + destination for the CUSTOMER sell CTA
  const renderSellCta = () => {
    if (!profileChecked) return null; // still loading — show nothing, avoid flicker

    if (vendorProfile === false) {
      // No profile yet — standard CTA
      return (
        <button className="nav-link nav-link--cta" onClick={() => navigate("/become-seller")}>
          SELL
        </button>
      );
    }

    if (vendorProfile && !vendorProfile.approved) {
      // Pending approval
      return (
        <button
          className="nav-link nav-link--muted"
          onClick={() => navigate("/become-seller")}
          title="Your seller application is under review"
        >
          PENDING ⏳
        </button>
      );
    }

    if (vendorProfile && vendorProfile.approved) {
      // Approved but JWT is stale — nudge them to re-login
      return (
        <button
          className="nav-link nav-link--cta"
          onClick={() => navigate("/become-seller")}
          title="Log out and back in to access your seller dashboard"
        >
          ACTIVATE SELLER ✅
        </button>
      );
    }

    return null;
  };

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>

      {/* LEFT */}
      <div className="nav-left">
        <button className="nav-link" onClick={() => navigate("/")}>HOME</button>
        <button className="nav-link" onClick={() => navigate("/shop")}>SHOP</button>
        <button className="nav-link" onClick={() => navigate("/about")}>ABOUT</button>
      </div>

      {/* LOGO */}
      <div className="nav-logo" onClick={() => navigate("/")}>
        THRIFTBAZAAR
      </div>

      {/* RIGHT */}
      <div className="nav-right">

        {/* ADMIN */}
        {isLoggedIn && role === "ADMIN" && (
          <button className="nav-link" onClick={() => navigate("/admin")}>
            ADMIN
          </button>
        )}

        {/* VENDOR: approved — show dashboard */}
        {isLoggedIn && role === "VENDOR" && (
          <button className="nav-link" onClick={() => navigate("/dashboard")}>
            DASHBOARD
          </button>
        )}

        {/* CUSTOMER: orders + dynamic sell CTA */}
        {isLoggedIn && role === "CUSTOMER" && (
          <>
            <button className="nav-link" onClick={() => navigate("/orders")}>
              ORDERS
            </button>
            {renderSellCta()}
          </>
        )}

        {/* Everyone logged in sees profile + inbox + cart */}
        {isLoggedIn && (
          <>
            <button className="nav-link" onClick={() => navigate("/profile")}>
              PROFILE
            </button>
            <button className="nav-link" onClick={() => navigate("/inbox")}>
              INBOX
            </button>
            <button className="nav-link" onClick={() => navigate("/cart")}>
              CART
            </button>
          </>
        )}

        {!isLoggedIn && (
          <>
            <button className="nav-link" onClick={() => navigate("/login")}>
              LOGIN
            </button>
            <button className="nav-link" onClick={() => navigate("/register")}>
              REGISTER
            </button>
          </>
        )}

        {isLoggedIn && (
          <button className="nav-link" onClick={handleLogout}>
            LOGOUT
          </button>
        )}

      </div>
    </header>
  );
}

export default Navbar;
