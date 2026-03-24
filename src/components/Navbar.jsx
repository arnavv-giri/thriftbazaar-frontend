import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyVendorProfile } from "../api/authApi";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, role, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [vendorProfile, setVendorProfile] = useState(null);
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change / resize back to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    if (!isLoggedIn || role !== "CUSTOMER") {
      setVendorProfile(null);
      setProfileChecked(false);
      return;
    }
    getMyVendorProfile()
      .then((profile) => setVendorProfile(profile))
      .catch(() => setVendorProfile(false))
      .finally(() => setProfileChecked(true));
  }, [isLoggedIn, role]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const navTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const renderSellCta = () => {
    if (!profileChecked) return null;
    if (vendorProfile === false) {
      return (
        <button className="nav-link nav-link--cta" onClick={() => navTo("/become-seller")}>
          SELL
        </button>
      );
    }
    if (vendorProfile && !vendorProfile.approved) {
      return (
        <button className="nav-link nav-link--muted" onClick={() => navTo("/become-seller")}
          title="Your seller application is under review">
          PENDING ⏳
        </button>
      );
    }
    if (vendorProfile && vendorProfile.approved) {
      return (
        <button className="nav-link nav-link--cta" onClick={() => navTo("/become-seller")}
          title="Log out and back in to access your seller dashboard">
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
        <button className="nav-link" onClick={() => navTo("/")}>HOME</button>
        <button className="nav-link" onClick={() => navTo("/shop")}>SHOP</button>
        <button className="nav-link" onClick={() => navTo("/about")}>ABOUT</button>
      </div>

      {/* LOGO */}
      <div className="nav-logo" onClick={() => navTo("/")}>
        THRIFTBAZAAR
      </div>

      {/* RIGHT — desktop only */}
      <div className="nav-right">
        {isLoggedIn && role === "ADMIN" && (
          <button className="nav-link" onClick={() => navTo("/admin")}>ADMIN</button>
        )}
        {isLoggedIn && role === "VENDOR" && (
          <button className="nav-link" onClick={() => navTo("/dashboard")}>DASHBOARD</button>
        )}
        {isLoggedIn && role === "CUSTOMER" && (
          <>
            <button className="nav-link" onClick={() => navTo("/orders")}>ORDERS</button>
            {renderSellCta()}
          </>
        )}
        {isLoggedIn && (
          <>
            <button className="nav-link" onClick={() => navTo("/profile")}>PROFILE</button>
            <button className="nav-link" onClick={() => navTo("/inbox")}>INBOX</button>
            <button className="nav-link" onClick={() => navTo("/cart")}>CART</button>
          </>
        )}
        {!isLoggedIn && (
          <>
            <button className="nav-link" onClick={() => navTo("/login")}>LOGIN</button>
            <button className="nav-link" onClick={() => navTo("/register")}>REGISTER</button>
          </>
        )}
        {isLoggedIn && (
          <button className="nav-link" onClick={handleLogout}>LOGOUT</button>
        )}
      </div>

      {/* HAMBURGER BUTTON — mobile only */}
      <button
        className={`nav-hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen((o) => !o)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
      >
        <span />
        <span />
        <span />
      </button>

      {/* MOBILE DRAWER */}
      {menuOpen && (
        <div className="nav-overlay" onClick={() => setMenuOpen(false)} />
      )}
      <nav className={`nav-drawer ${menuOpen ? "nav-drawer--open" : ""}`}>
        <div className="nav-drawer-header">
          <span className="nav-drawer-logo">THRIFTBAZAAR</span>
          <button
            className="nav-drawer-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="nav-drawer-links">
          <button className="nav-drawer-link" onClick={() => navTo("/")}>Home</button>
          <button className="nav-drawer-link" onClick={() => navTo("/shop")}>Shop</button>
          <button className="nav-drawer-link" onClick={() => navTo("/about")}>About</button>

          {isLoggedIn && role === "ADMIN" && (
            <button className="nav-drawer-link" onClick={() => navTo("/admin")}>Admin Dashboard</button>
          )}
          {isLoggedIn && role === "VENDOR" && (
            <button className="nav-drawer-link" onClick={() => navTo("/dashboard")}>Seller Dashboard</button>
          )}
          {isLoggedIn && role === "CUSTOMER" && (
            <>
              <button className="nav-drawer-link" onClick={() => navTo("/orders")}>Orders</button>
              {vendorProfile === false && (
                <button className="nav-drawer-link" onClick={() => navTo("/become-seller")}>Become a Seller</button>
              )}
            </>
          )}
          {isLoggedIn && (
            <>
              <button className="nav-drawer-link" onClick={() => navTo("/profile")}>Profile</button>
              <button className="nav-drawer-link" onClick={() => navTo("/inbox")}>Inbox</button>
              <button className="nav-drawer-link" onClick={() => navTo("/cart")}>Cart</button>
            </>
          )}

          <div className="nav-drawer-divider" />

          {!isLoggedIn ? (
            <>
              <button className="nav-drawer-link nav-drawer-link--cta" onClick={() => navTo("/login")}>Login</button>
              <button className="nav-drawer-link nav-drawer-link--cta" onClick={() => navTo("/register")}>Register</button>
            </>
          ) : (
            <button className="nav-drawer-link nav-drawer-link--logout" onClick={handleLogout}>Logout</button>
          )}
        </div>
      </nav>

    </header>
  );
}

export default Navbar;
