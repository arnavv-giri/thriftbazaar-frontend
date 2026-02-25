import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import "./Cart.css";

function Cart() {
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading before checking login status
    if (authLoading) {
      return;
    }

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(cart);
    setLoading(false);
  }, [isLoggedIn, authLoading, navigate]);

  const handleRemoveItem = (cartItemId) => {
    const updatedCart = cartItems.filter((item) => item.cartItemId !== cartItemId);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleUpdateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = cartItems.map((item) =>
      item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }
    navigate("/checkout", { state: { cartItems, totalAmount } });
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
      <button className="back-button" onClick={() => navigate("/")}>
        ← Back to Shopping
      </button>

      <div className="cart-container">
        <h1>Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Start adding items to your cart by browsing our collection</p>
            <Button variant="primary" size="lg" onClick={() => navigate("/")}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="cart-content">
            {/* Cart Items */}
            <div className="cart-items">
              <div className="items-header">
                <span>{cartItems.length} item(s) in cart</span>
              </div>

              {cartItems.map((item) => (
                <div key={item.cartItemId} className="cart-item">
                  <img src={item.images[0]} alt={item.name} className="item-image" />

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
                    <button onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1)}>
                      −
                    </button>
                    <input type="number" value={item.quantity} readOnly />
                    <button onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1)}>
                      +
                    </button>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveItem(item.cartItemId)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="cart-summary">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>

              <div className="summary-row">
                <span>Tax</span>
                <span>₹{Math.round(totalAmount * 0.05).toLocaleString("en-IN")}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total">
                <span>Total Amount</span>
                <span>
                  ₹{(totalAmount + Math.round(totalAmount * 0.05)).toLocaleString("en-IN")}
                </span>
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
                onClick={() => navigate("/")}
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