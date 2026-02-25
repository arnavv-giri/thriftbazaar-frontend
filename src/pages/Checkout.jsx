import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import "./Checkout.css";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems = [], totalAmount = 0 } = location.state || {};

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    couponCode: "",
  });

  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <h2>No items in checkout</h2>
          <p>Please add items to your cart first</p>
          <Button variant="primary" onClick={() => navigate("/")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyCoupon = () => {
    // Simple coupon logic
    const coupons = {
      SAVE10: 0.1,
      SAVE15: 0.15,
      SAVE20: 0.2,
    };

    if (coupons[formData.couponCode]) {
      const discountAmount = totalAmount * coupons[formData.couponCode];
      setDiscount(discountAmount);
      alert(`Coupon applied! You saved ₹${Math.round(discountAmount)}`);
    } else {
      alert("Invalid coupon code");
      setDiscount(0);
    }
  };

  const finalTotal = totalAmount - discount;
  const tax = Math.round(finalTotal * 0.05);
  const finalPrice = finalTotal + tax;

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.email ||
      !formData.phone ||
      !formData.address
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Generate order ID
    const newOrderId = "ORD" + Date.now();
    setOrderId(newOrderId);

    // Create order object
    const order = {
      orderId: newOrderId,
      items: cartItems,
      customer: formData,
      paymentMethod,
      status: "pending",
      totalAmount: finalPrice,
      discount,
      tax,
      createdAt: new Date().toISOString(),
      deliveryAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
    };

    // Save order to localStorage
    const existingOrders = JSON.parse(localStorage.getItem("orders")) || [];
    existingOrders.push(order);
    localStorage.setItem("orders", JSON.stringify(existingOrders));

    // Clear cart
    localStorage.setItem("cart", JSON.stringify([]));

    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="order-success">
          <div className="success-icon">✅</div>
          <h1>Order Placed Successfully!</h1>
          <p className="order-id">Order ID: <strong>{orderId}</strong></p>
          
          <div className="order-details">
            <div className="detail-row">
              <span>Items:</span>
              <span>{cartItems.length}</span>
            </div>
            <div className="detail-row">
              <span>Total Amount:</span>
              <span>₹{finalPrice.toLocaleString("en-IN")}</span>
            </div>
            <div className="detail-row">
              <span>Delivery Address:</span>
              <span>{formData.address}, {formData.city}</span>
            </div>
            <div className="detail-row">
              <span>Status:</span>
              <span className="status-badge">Processing</span>
            </div>
          </div>

          <div className="success-actions">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/orders")}
            >
              View My Orders
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/")}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <button className="back-button" onClick={() => navigate("/cart")}>
        ← Back to Cart
      </button>

      <div className="checkout-container">
        {/* Checkout Form */}
        <div className="checkout-form-section">
          <h1>Checkout</h1>

          <form className="checkout-form" onSubmit={handlePlaceOrder}>
            {/* Delivery Information */}
            <div className="form-section">
              <h2>Delivery Information</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main Street, Apartment 4B"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="NY"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="form-section">
              <h2>Payment Method</h2>

              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>💳 Credit/Debit Card</span>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentMethod === "upi"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>📱 UPI</span>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wallet"
                    checked={paymentMethod === "wallet"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>💰 Digital Wallet</span>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>🚚 Cash on Delivery</span>
                </label>
              </div>
            </div>

            {/* Coupon Code */}
            <div className="form-section">
              <h2>Apply Coupon</h2>
              <div className="coupon-input">
                <input
                  type="text"
                  name="couponCode"
                  value={formData.couponCode}
                  onChange={handleInputChange}
                  placeholder="Enter coupon code (SAVE10, SAVE15, SAVE20)"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={applyCoupon}
                >
                  Apply
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
            >
              Place Order
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="order-summary-section">
          <div className="order-summary">
            <h2>Order Summary</h2>

            <div className="summary-items">
              {cartItems.map((item) => (
                <div key={item.cartItemId} className="summary-item">
                  <img src={item.images[0]} alt={item.name} />
                  <div className="item-info">
                    <p className="item-name">{item.name}</p>
                    <p className="item-seller">{item.seller}</p>
                  </div>
                  <div className="item-price">
                    <span className="qty">x{item.quantity}</span>
                    <span className="price">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-calculation">
              <div className="calc-row">
                <span>Subtotal</span>
                <span>₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>

              {discount > 0 && (
                <div className="calc-row discount">
                  <span>Discount</span>
                  <span>-₹{Math.round(discount).toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="calc-row">
                <span>Tax (5%)</span>
                <span>₹{tax.toLocaleString("en-IN")}</span>
              </div>

              <div className="calc-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>

              <div className="summary-divider"></div>

              <div className="calc-row total">
                <span>Total Amount</span>
                <span>₹{finalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="payment-info">
              <div className="info-item">
                <span className="icon">🔒</span>
                <span>Secure Payment</span>
              </div>
              <div className="info-item">
                <span className="icon">🚚</span>
                <span>Free Shipping</span>
              </div>
              <div className="info-item">
                <span className="icon">↩️</span>
                <span>Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;