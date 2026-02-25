import { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import "./ContactSeller.css";

function ContactSeller() {
  const { sellerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const product = location.state?.product;
  const seller = location.state?.seller || "Unknown Seller";

  // Seller details database
  const sellers = {
    seller1: {
      name: "VintageVault Store",
      rating: 4.8,
      responseTime: "< 1 hour",
      avatar: "🏪",
    },
    seller2: {
      name: "ClassicStyle Shop",
      rating: 4.9,
      responseTime: "< 30 min",
      avatar: "👔",
    },
    seller3: {
      name: "Premium Leather Store",
      rating: 4.7,
      responseTime: "< 2 hours",
      avatar: "🧥",
    },
  };

  const currentSeller = sellers[sellerId] || {
    name: seller,
    rating: 4.8,
    responseTime: "< 1 hour",
    avatar: "👤",
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !inputMessage.trim()) {
      alert("Please fill in all fields");
      return;
    }

    const newMessage = {
      id: Date.now(),
      type: "customer",
      name,
      email,
      message: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
      avatar: "👤",
    };

    setMessages([...messages, newMessage]);
    setInputMessage("");
    setFormSubmitted(true);

    // Simulate seller response after 2 seconds
    setTimeout(() => {
      const sellerResponse = {
        id: Date.now() + 1,
        type: "seller",
        name: currentSeller.name,
        message:
          "Thank you for your inquiry! I'm very interested in helping you. Will provide more details shortly.",
        timestamp: new Date().toLocaleTimeString(),
        avatar: currentSeller.avatar,
      };
      setMessages((prev) => [...prev, sellerResponse]);
    }, 2000);
  };

  return (
    <div className="contact-seller">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="contact-seller-container">
        {/* Seller Info Sidebar */}
        <div className="seller-sidebar">
          <div className="seller-header">
            <div className="seller-avatar-large">{currentSeller.avatar}</div>
            <div className="seller-info">
              <h2>{currentSeller.name}</h2>
              <div className="seller-stats">
                <div className="stat">
                  <span className="stat-label">Rating</span>
                  <span className="stat-value">
                    ⭐ {currentSeller.rating}/5
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Response Time</span>
                  <span className="stat-value">{currentSeller.responseTime}</span>
                </div>
              </div>
            </div>
          </div>

          {product && (
            <div className="product-preview">
              <h3>About Product</h3>
              <div className="product-preview-card">
                <img src={product.images[0]} alt={product.name} />
                <div className="preview-details">
                  <p className="preview-name">{product.name}</p>
                  <p className="preview-price">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                  <span className="preview-badge">{product.category}</span>
                </div>
              </div>
            </div>
          )}

          <div className="seller-features">
            <div className="feature">
              <span className="feature-icon">✅</span>
              <span>Verified Seller</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🚚</span>
              <span>Fast Shipping</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🔄</span>
              <span>Easy Returns</span>
            </div>
          </div>
        </div>

        {/* Messages Section */}
        <div className="messages-section">
          <div className="messages-header">
            <h3>Message Seller</h3>
            <p>Get quick responses to your questions</p>
          </div>

          {/* Messages Display */}
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="empty-messages">
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.type === "seller" ? "seller" : "customer"}`}
                >
                  <div className="message-avatar">{msg.avatar}</div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-name">{msg.name}</span>
                      <span className="message-time">{msg.timestamp}</span>
                    </div>
                    <div className="message-text">{msg.message}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Form */}
          <form className="message-form" onSubmit={handleSendMessage}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                disabled={formSubmitted}
              />
            </div>

            <div className="form-group">
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                disabled={formSubmitted}
              />
            </div>

            <div className="form-group">
              <textarea
                placeholder="Type your message here... Ask about product details, shipping, discounts, etc."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="form-textarea"
                rows="5"
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              type="submit"
            >
              Send Message
            </Button>
          </form>

          {formSubmitted && (
            <div className="form-info">
              <p>✓ Message sent! The seller typically responds within {currentSeller.responseTime}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContactSeller;