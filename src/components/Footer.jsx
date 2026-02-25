import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>About ThriftBazaar</h3>
          <p>
            Discover curated pre-loved fashion at unbeatable prices. Join
            India's modern resale marketplace for sustainable fashion.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/#products">Browse Products</a>
            </li>
            <li>
              <a href="/register">Start Selling</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Support</h3>
          <ul>
            <li>
              <a href="/#faq">FAQ</a>
            </li>
            <li>
              <a href="/#contact">Contact Us</a>
            </li>
            <li>
              <a href="/#returns">Returns</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-links">
            <a href="#" aria-label="Instagram">
              Instagram
            </a>
            <a href="#" aria-label="Twitter">
              Twitter
            </a>
            <a href="#" aria-label="Facebook">
              Facebook
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} ThriftBazaar. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;