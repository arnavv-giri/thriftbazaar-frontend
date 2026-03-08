import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserEmail } from "../utils/auth";
import Button from "../components/Button";
import "./Cart.css";

function Cart() {
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCartKey = () => {
    const email = getUserEmail();
    return email ? `cart_${email}` : "cart";
  };

  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const key = getCartKey();
    const cart = JSON.parse(localStorage.getItem(key)) || [];
    setCartItems(cart);
    setLoading(false);
  }, [isLoggedIn, authLoading, navigate]);

  const saveCart = (updated) => {
    const key = getCartKey();
    localStorage.setItem(key, JSON.stringify(updated));
    setCartItems(updated);
  };

  const handleRemoveItem = (productId) => {
    saveCart(cartItems.filter((item) => item.id !== productId));
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    saveCart(
      cartItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + tax;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }
    navigate("/checkout", { state: { cartItems, totalAmount: subtotal } });
  };

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="spinner" />
        <p>Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <button className="back-button" onClick={() => navigate("/shop")}>
        ← Back to Shopping
      </button>

      <div className="cart-container">
        <h1>Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Start adding items to your cart by browsing our collection</p>
            <Button variant="primary" size="lg" onClick={() => navigate("/shop")}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              <div className="items-header">
                <span>{cartItems.length} item(s) in cart</span>
              </div>

              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img
                    src={
                      Array.isArray(item.images) && item.images.length > 0
                        ? item.images[0]
                        : "https://via.placeholder.com/80"
                    }
                    alt={item.name}
                    className="item-image"
                  />

                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-seller">{item.seller}</p>
                    <p className="item-category">{item.category}</p>
                  </div>

                  <div className="item-price">
                    <p className="price">₹{item.price.toLocaleString("en-IN")}</p>
                    <p className="total">
                      Total: ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="quantity-control">
                    <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                      −
                    </button>
                    <input type="number" value={item.quantity} readOnly />
                    <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                      +
                    </button>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span>{subtotal > 500 ? "Free" : "₹50"}</span>
              </div>

              <div className="summary-row">
                <span>Tax (5%)</span>
                <span>₹{tax.toLocaleString("en-IN")}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total">
                <span>Total Amount</span>
                <span>₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>

              <Button
                variant="tertiary"
                size="lg"
                fullWidth
                onClick={() => navigate("/shop")}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
