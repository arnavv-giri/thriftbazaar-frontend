import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getUserRole } from "../utils/auth"; // ✅ added
import Button from "./Button";
import "./Navbar.css";

function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const { getTotalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const role = getUserRole(); // ✅ detect role

  const cartCount = getTotalItems();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  const closeMobileMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <a href="/" className="navbar-brand" onClick={closeMobileMenu}>
          <div className="logo-wrapper">
            <span className="logo-icon">♻️</span>
            <span className="brand-text">ThriftBazaar</span>
          </div>
        </a>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${menuOpen ? "active" : ""}`}></span>
        </button>

        <div className={`navbar-menu ${menuOpen ? "open" : ""}`}>

          {/* Links */}
          <div className="navbar-links">

            <a href="/" onClick={closeMobileMenu}>
              Home
            </a>

            <a href="/#products" onClick={closeMobileMenu}>
              Products
            </a>

            {/* ✅ Vendor-only link */}
            {role === "VENDOR" && (
              <a href="/add-product" onClick={closeMobileMenu}>
                Add Product
              </a>
            )}

          </div>

          {/* Actions */}
          <div className="navbar-actions">

            {/* Cart */}
            <a href="/cart" className="cart-link" onClick={closeMobileMenu}>
              <span className="cart-icon">🛒</span>
              Cart
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </a>

            {/* Orders (customer only) */}
            {role === "CUSTOMER" && (
              <a href="/orders" className="orders-link" onClick={closeMobileMenu}>
                <span className="orders-icon">📦</span>
                Orders
              </a>
            )}

            {/* Auth Buttons */}
            {!isLoggedIn ? (
              <>
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={closeMobileMenu}
                >
                  <a href="/login" style={{ color: "inherit" }}>
                    Sign In
                  </a>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={closeMobileMenu}
                >
                  <a href="/register" style={{ color: "inherit" }}>
                    Become a Seller
                  </a>
                </Button>
              </>
            ) : (
              <>
                {/* Vendor Dashboard */}
                {role === "VENDOR" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={closeMobileMenu}
                  >
                    <a href="/vendor/dashboard" style={{ color: "inherit" }}>
                      Vendor Dashboard
                    </a>
                  </Button>
                )}

                {/* Customer dashboard */}
                {role === "CUSTOMER" && (
                  <Button
                    variant="tertiary"
                    size="sm"
                    onClick={closeMobileMenu}
                  >
                    <a href="/orders" style={{ color: "inherit" }}>
                      My Orders
                    </a>
                  </Button>
                )}

                {/* Logout */}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;