import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPaymentOrder, verifyPayment } from "../api/paymentApi";
import { getUserEmail } from "../utils/auth";
import Button from "../components/Button";
import "./Payment.css";

/**
 * Payment page — used to retry payment for an UNPAID order.
 *
 * Reached from:
 *  - Orders.jsx when the user clicks "Complete Payment" on an UNPAID order.
 *  - Any link that passes { orderId, totalAmount } via router state.
 *
 * The actual payment flow (Razorpay modal) is triggered here.
 * On success the user is redirected to /orders.
 */

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Payment() {
  const location = useLocation();
  const navigate  = useNavigate();

  const { orderId = null, totalAmount = 0 } = location.state || {};

  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);

  const handlePayNow = async () => {
    if (!orderId) {
      setError("No order selected. Please go back to your Orders page.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        setError("Unable to load payment gateway. Please check your internet connection.");
        setLoading(false);
        return;
      }

      const paymentConfig = await createPaymentOrder(orderId);

      const options = {
        key:      paymentConfig.keyId,
        amount:   paymentConfig.amount,
        currency: paymentConfig.currency,
        name:     "ThriftBazaar",
        description: `Order #${orderId}`,
        order_id: paymentConfig.razorpayOrderId,
        theme: { color: "#D6BFA7" },

        handler: async (response) => {
          try {
            await verifyPayment({
              orderId,
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setSuccess(true);
          } catch (err) {
            setError(
              err.response?.data?.message ||
              "Verification failed. Contact support if amount was deducted."
            );
          }
          setLoading(false);
        },

        modal: {
          ondismiss: () => {
            setError("Payment cancelled. You can try again anytime from your Orders page.");
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setError(`Payment failed: ${response.error?.description || "Unknown error"}. Please retry.`);
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="payment-page">
        <div className="payment-success">
          <div className="success-animation">
            <div className="checkmark">✓</div>
          </div>
          <h1>Payment Successful!</h1>
          <p>Your order has been confirmed and is now being processed.</p>
          <div className="payment-receipt">
            <div className="receipt-row">
              <span>Order ID:</span>
              <strong>#{orderId}</strong>
            </div>
            <div className="receipt-row">
              <span>Amount:</span>
              <strong>₹{totalAmount.toLocaleString("en-IN")}</strong>
            </div>
            <div className="receipt-row">
              <span>Status:</span>
              <strong style={{ color: "#4caf50" }}>✓ PAID</strong>
            </div>
          </div>
          <div className="success-actions">
            <Button variant="primary" size="lg" onClick={() => navigate("/orders")}>
              View My Orders
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <button className="back-button" onClick={() => navigate("/orders")}>
        ← Back to Orders
      </button>

      <div className="payment-container">
        <div className="payment-header">
          <h1>Complete Payment</h1>
          <div className="payment-amount">
            <span>Amount to Pay:</span>
            <strong>₹{totalAmount.toLocaleString("en-IN")}</strong>
          </div>
        </div>

        {error && (
          <div style={{
            background: "#ffebee", color: "#c62828",
            padding: "12px 16px", borderRadius: "8px",
            marginBottom: "20px", borderLeft: "4px solid #c62828",
            fontSize: "0.9rem",
          }}>
            {error}
          </div>
        )}

        {!orderId ? (
          <div className="no-method-selected">
            <p>No order found. Please go back to your Orders page and select an unpaid order.</p>
            <Button variant="primary" onClick={() => navigate("/orders")} style={{ marginTop: 16 }}>
              Go to Orders
            </Button>
          </div>
        ) : (
          <>
            <div className="payment-form-section">
              <div className="cod-info" style={{ background: "#e8f4fd", borderColor: "#2196F3" }}>
                <p style={{ color: "#1565C0" }}>📋 Order ID: <strong>#{orderId}</strong></p>
                <p style={{ color: "#1565C0" }}>💰 Total: <strong>₹{totalAmount.toLocaleString("en-IN")}</strong></p>
                <p style={{ color: "#1565C0" }}>🔒 Payment is processed securely via Razorpay</p>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                disabled={loading}
                onClick={handlePayNow}
                style={{ marginTop: "20px" }}
              >
                {loading ? "Opening Payment…" : `Pay ₹${totalAmount.toLocaleString("en-IN")} via Razorpay`}
              </Button>
            </div>

            <div className="security-info">
              <div className="security-item"><span>🔒</span><span>256-bit SSL</span></div>
              <div className="security-item"><span>✓</span><span>PCI DSS Compliant</span></div>
              <div className="security-item"><span>🛡️</span><span>Fraud Protection</span></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Payment;
