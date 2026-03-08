import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getUserEmail } from "../utils/auth";
import { placeOrder } from "../api/orderApi";
import { createPaymentOrder, verifyPayment } from "../api/paymentApi";
import Button from "../components/Button";
import "./Checkout.css";

/**
 * Checkout page — delivery form + Razorpay payment.
 *
 * Flow
 * ────
 * 1. User fills in delivery details and clicks "Proceed to Payment".
 * 2. POST /orders/checkout  → backend creates the order (status PENDING, paymentStatus UNPAID).
 * 3. POST /payments/create-order  → backend creates a Razorpay order and returns the config.
 * 4. We open the Razorpay checkout modal using the official JS SDK.
 * 5a. On payment success  → POST /payments/verify  → backend verifies HMAC signature
 *     and marks the order PAID/PROCESSING.  We show the success screen.
 * 5b. On payment failure/dismissal  → we show an error; the order remains UNPAID and
 *     the user can retry without creating a duplicate order.
 *
 * Security notes
 * ──────────────
 * - Amount is never sent to the verify endpoint — the backend uses the DB amount.
 * - The Razorpay signature is verified server-side; we never trust the modal's
 *   success callback alone.
 */

/** Dynamically load the Razorpay checkout script if it isn't already on the page. */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Checkout() {
  const location = useLocation();
  const navigate  = useNavigate();

  const { cartItems = [], totalAmount = 0 } = location.state || {};

  const [formData, setFormData] = useState({
    firstName:  "",
    lastName:   "",
    email:      "",
    phone:      "",
    address:    "",
    city:       "",
    state:      "",
    zipCode:    "",
    couponCode: "",
  });

  const [discount,    setDiscount]    = useState(0);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState("");
  const [paidOrder,   setPaidOrder]   = useState(null); // set after successful verification

  // ── Guard ─────────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <h2>No items in checkout</h2>
          <p>Please add items to your cart first.</p>
          <Button variant="primary" onClick={() => navigate("/")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const applyCoupon = () => {
    const coupons = { SAVE10: 0.1, SAVE15: 0.15, SAVE20: 0.2 };
    if (coupons[formData.couponCode]) {
      const amt = totalAmount * coupons[formData.couponCode];
      setDiscount(amt);
      alert(`Coupon applied! You saved ₹${Math.round(amt)}`);
    } else {
      alert("Invalid coupon code");
      setDiscount(0);
    }
  };

  // ── Price calculations ────────────────────────────────────────────────
  const afterDiscount = totalAmount - discount;
  const tax           = Math.round(afterDiscount * 0.05);
  const finalPrice    = afterDiscount + tax;

  // ── Main submit handler ───────────────────────────────────────────────
  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.firstName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      // ── 1. Ensure Razorpay SDK is loaded ────────────────────────────
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        setError("Unable to load payment gateway. Please check your internet connection.");
        setSubmitting(false);
        return;
      }

      // ── 2. Create the backend order (PENDING, UNPAID) ───────────────
      const deliveryAddress =
        `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`.trim();

      const order = await placeOrder(cartItems, deliveryAddress);

      // ── 3. Create a Razorpay order for this DB order ────────────────
      const paymentConfig = await createPaymentOrder(order.id);

      // ── 4. Open the Razorpay checkout modal ─────────────────────────
      const options = {
        key:      paymentConfig.keyId,
        amount:   paymentConfig.amount,      // in paise
        currency: paymentConfig.currency,
        name:     "ThriftBazaar",
        description: `Order #${order.id}`,
        order_id: paymentConfig.razorpayOrderId,
        prefill: {
          name:    `${formData.firstName} ${formData.lastName}`.trim(),
          email:   formData.email,
          contact: formData.phone,
        },
        theme: { color: "#D6BFA7" },

        // ── Success callback ─────────────────────────────────────────
        // Razorpay calls this after the customer completes payment.
        // We MUST verify server-side — never trust this alone.
        handler: async (response) => {
          try {
            const verifiedOrder = await verifyPayment({
              orderId:            order.id,
              razorpayOrderId:    response.razorpay_order_id,
              razorpayPaymentId:  response.razorpay_payment_id,
              razorpaySignature:  response.razorpay_signature,
            });

            // Clear the user's cart now that payment is confirmed
            const email   = getUserEmail();
            const cartKey = email ? `cart_${email}` : "cart";
            localStorage.setItem(cartKey, JSON.stringify([]));

            setPaidOrder(verifiedOrder);

          } catch (verifyErr) {
            const msg =
              verifyErr.response?.data?.message ||
              verifyErr.response?.data?.error   ||
              "Payment was received but verification failed. Please contact support.";
            setError(msg);
          }
          setSubmitting(false);
        },

        // ── Modal closed without paying ──────────────────────────────
        modal: {
          ondismiss: () => {
            setError("Payment was cancelled. Your order has been saved — you can retry from your Orders page.");
            setSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      // Handle payment failures inside the modal (e.g. card decline)
      rzp.on("payment.failed", (response) => {
        const desc = response.error?.description || "Payment failed";
        setError(`Payment failed: ${desc}. Please try again.`);
        setSubmitting(false);
      });

      rzp.open();
      // NOTE: do NOT setSubmitting(false) here — we stay in loading state
      // until the modal's handler/ondismiss fires.

    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error   ||
        "Something went wrong. Please try again.";
      setError(msg);
      setSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────
  if (paidOrder) {
    return (
      <div className="checkout-page">
        <div className="order-success">
          <div className="success-icon">✅</div>
          <h1>Payment Successful!</h1>
          <p className="order-id">
            Order ID: <strong>#{paidOrder.id}</strong>
          </p>

          <div className="order-details">
            <div className="detail-row">
              <span>Items:</span>
              <span>{paidOrder.items.length}</span>
            </div>
            <div className="detail-row">
              <span>Amount Paid:</span>
              <span>₹{paidOrder.totalAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="detail-row">
              <span>Delivery Address:</span>
              <span>{paidOrder.deliveryAddress}</span>
            </div>
            <div className="detail-row">
              <span>Payment Status:</span>
              <span className="status-badge" style={{ background: "#4caf50", color: "#fff" }}>
                ✓ {paidOrder.paymentStatus}
              </span>
            </div>
            <div className="detail-row">
              <span>Order Status:</span>
              <span className="status-badge">{paidOrder.status}</span>
            </div>
          </div>

          <div className="success-actions">
            <Button variant="primary" size="lg" onClick={() => navigate("/orders")}>
              View My Orders
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate("/")}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main checkout form ────────────────────────────────────────────────
  return (
    <div className="checkout-page">
      <button className="back-button" onClick={() => navigate("/cart")}>
        ← Back to Cart
      </button>

      <div className="checkout-container">

        {/* ── Left: delivery form ──────────────────────────────────────── */}
        <div className="checkout-form-section">
          <h1>Checkout</h1>

          {error && (
            <div style={{
              background: "#ffebee",
              color: "#c62828",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
              borderLeft: "4px solid #c62828",
              fontSize: "0.9rem",
            }}>
              {error}
            </div>
          )}

          <form className="checkout-form" onSubmit={handleProceedToPayment}>

            {/* Delivery information */}
            <div className="form-section">
              <h2>Delivery Information</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input type="text" name="firstName" value={formData.firstName}
                    onChange={handleInputChange} placeholder="John" required disabled={submitting} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName}
                    onChange={handleInputChange} placeholder="Doe" disabled={submitting} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" value={formData.email}
                    onChange={handleInputChange} placeholder="john@example.com"
                    required disabled={submitting} />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input type="tel" name="phone" value={formData.phone}
                    onChange={handleInputChange} placeholder="+91 98765 43210"
                    required disabled={submitting} />
                </div>
              </div>

              <div className="form-group">
                <label>Address *</label>
                <input type="text" name="address" value={formData.address}
                  onChange={handleInputChange} placeholder="123 Main Street, Apartment 4B"
                  required disabled={submitting} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input type="text" name="city" value={formData.city}
                    onChange={handleInputChange} placeholder="Mumbai"
                    required disabled={submitting} />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input type="text" name="state" value={formData.state}
                    onChange={handleInputChange} placeholder="Maharashtra"
                    required disabled={submitting} />
                </div>
                <div className="form-group">
                  <label>ZIP Code *</label>
                  <input type="text" name="zipCode" value={formData.zipCode}
                    onChange={handleInputChange} placeholder="400001"
                    required disabled={submitting} />
                </div>
              </div>
            </div>

            {/* Coupon */}
            <div className="form-section">
              <h2>Apply Coupon</h2>
              <div className="coupon-input">
                <input type="text" name="couponCode" value={formData.couponCode}
                  onChange={handleInputChange}
                  placeholder="Enter coupon code (SAVE10, SAVE15, SAVE20)"
                  disabled={submitting} />
                <Button type="button" variant="secondary" onClick={applyCoupon} disabled={submitting}>
                  Apply
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={submitting}
              disabled={submitting}
            >
              {submitting ? "Opening Payment…" : `Pay ₹${finalPrice.toLocaleString("en-IN")} via Razorpay`}
            </Button>

            <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#888", marginTop: "12px" }}>
              🔒 Payments are secured and processed by Razorpay
            </p>
          </form>
        </div>

        {/* ── Right: order summary ─────────────────────────────────────── */}
        <div className="order-summary-section">
          <div className="order-summary">
            <h2>Order Summary</h2>

            <div className="summary-items">
              {cartItems.map((item) => (
                <div key={item.id} className="summary-item">
                  <img
                    src={
                      Array.isArray(item.images) && item.images.length > 0
                        ? item.images[0]
                        : "https://via.placeholder.com/60"
                    }
                    alt={item.name}
                  />
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

            <div className="summary-divider" />

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
              <div className="summary-divider" />
              <div className="calc-row total">
                <span>Total Amount</span>
                <span>₹{finalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="payment-info">
              <div className="info-item"><span className="icon">🔒</span><span>Secure Payment via Razorpay</span></div>
              <div className="info-item"><span className="icon">🚚</span><span>Free Shipping</span></div>
              <div className="info-item"><span className="icon">↩️</span><span>Easy Returns</span></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Checkout;
