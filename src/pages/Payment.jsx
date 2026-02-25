import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import "./Payment.css";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId = "", totalAmount = 0 } = location.state || {};

  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const [upiId, setUpiId] = useState("");
  const [paymentStep, setPaymentStep] = useState("method"); // method, processing, success, failed
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cardNumber") {
      formattedValue = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
    } else if (name === "expiryDate") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .slice(0, 5);
    } else if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 3);
    }

    setCardDetails((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const validateCard = () => {
    if (cardDetails.cardNumber.length < 19) {
      alert("Invalid card number");
      return false;
    }
    if (!cardDetails.cardName) {
      alert("Please enter cardholder name");
      return false;
    }
    if (!cardDetails.expiryDate || cardDetails.expiryDate.length < 5) {
      alert("Invalid expiry date");
      return false;
    }
    if (cardDetails.cvv.length < 3) {
      alert("Invalid CVV");
      return false;
    }
    return true;
  };

  const validateUPI = () => {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
    if (!upiRegex.test(upiId)) {
      alert("Invalid UPI ID. Format: username@bankname");
      return false;
    }
    return true;
  };

  const processPayment = () => {
    if (selectedPaymentMethod === "card") {
      if (!validateCard()) return;
    } else if (selectedPaymentMethod === "upi") {
      if (!validateUPI()) return;
    }

    setPaymentStep("processing");

    // Simulate payment processing
    setTimeout(() => {
      // Randomly succeed or fail for demo
      if (Math.random() > 0.2) {
        setPaymentStep("success");
        // Save payment record
        const payment = {
          orderId,
          amount: totalAmount,
          method: selectedPaymentMethod,
          status: "completed",
          timestamp: new Date().toISOString(),
        };
        const payments = JSON.parse(localStorage.getItem("payments")) || [];
        payments.push(payment);
        localStorage.setItem("payments", JSON.stringify(payments));
      } else {
        setPaymentStep("failed");
      }
    }, 2000);
  };

  if (paymentStep === "success") {
    return (
      <div className="payment-page">
        <div className="payment-success">
          <div className="success-animation">
            <div className="checkmark">✓</div>
          </div>
          <h1>Payment Successful!</h1>
          <p>Your order has been confirmed</p>

          <div className="payment-receipt">
            <div className="receipt-row">
              <span>Order ID:</span>
              <strong>{orderId}</strong>
            </div>
            <div className="receipt-row">
              <span>Amount:</span>
              <strong>₹{totalAmount.toLocaleString("en-IN")}</strong>
            </div>
            <div className="receipt-row">
              <span>Payment Method:</span>
              <strong>
                {selectedPaymentMethod === "card"
                  ? "Credit/Debit Card"
                  : "UPI"}
              </strong>
            </div>
            <div className="receipt-row">
              <span>Status:</span>
              <strong style={{ color: "#4caf50" }}>✓ Confirmed</strong>
            </div>
          </div>

          <div className="success-message">
            <p>📧 Confirmation email sent to your registered email address</p>
            <p>🚚 You will receive tracking information soon</p>
          </div>

          <div className="success-actions">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/orders")}
            >
              View Orders
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStep === "failed") {
    return (
      <div className="payment-page">
        <div className="payment-failed">
          <div className="failed-icon">✕</div>
          <h1>Payment Failed</h1>
          <p>Unfortunately, your payment could not be processed</p>

          <div className="error-message">
            <p>Please try again with valid payment details</p>
          </div>

          <div className="failed-actions">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setPaymentStep("method")}
            >
              Try Again
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/cart")}
            >
              Back to Cart
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStep === "processing") {
    return (
      <div className="payment-page">
        <div className="payment-processing">
          <div className="processing-spinner">
            <div className="spinner"></div>
          </div>
          <h2>Processing Payment...</h2>
          <p>Please wait while we securely process your payment</p>
          <p className="amount">₹{totalAmount.toLocaleString("en-IN")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <button className="back-button" onClick={() => navigate("/checkout")}>
        ← Back
      </button>

      <div className="payment-container">
        <div className="payment-header">
          <h1>Complete Payment</h1>
          <div className="payment-amount">
            <span>Amount to Pay:</span>
            <strong>₹{totalAmount.toLocaleString("en-IN")}</strong>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="payment-methods">
          <h2>Select Payment Method</h2>

          <div className="methods-grid">
            <div
              className={`method-card ${selectedPaymentMethod === "card" ? "selected" : ""}`}
              onClick={() => setSelectedPaymentMethod("card")}
            >
              <div className="method-icon">💳</div>
              <h3>Credit/Debit Card</h3>
              <p>Visa, Mastercard, Amex</p>
            </div>

            <div
              className={`method-card ${selectedPaymentMethod === "upi" ? "selected" : ""}`}
              onClick={() => setSelectedPaymentMethod("upi")}
            >
              <div className="method-icon">📱</div>
              <h3>UPI</h3>
              <p>Google Pay, PhonePe, PayTM</p>
            </div>

            <div
              className={`method-card ${selectedPaymentMethod === "wallet" ? "selected" : ""}`}
              onClick={() => setSelectedPaymentMethod("wallet")}
            >
              <div className="method-icon">💰</div>
              <h3>Digital Wallet</h3>
              <p>PayTM, Amazon Pay</p>
            </div>

            <div
              className={`method-card ${selectedPaymentMethod === "cod" ? "selected" : ""}`}
              onClick={() => setSelectedPaymentMethod("cod")}
            >
              <div className="method-icon">🚚</div>
              <h3>Cash on Delivery</h3>
              <p>No advance payment</p>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        {selectedPaymentMethod === "card" && (
          <div className="payment-form-section">
            <h2>Card Details</h2>
            <div className="card-form">
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={handleCardChange}
                  maxLength="19"
                />
              </div>

              <div className="form-group">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  name="cardName"
                  placeholder="John Doe"
                  value={cardDetails.cardName}
                  onChange={handleCardChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={cardDetails.expiryDate}
                    onChange={handleCardChange}
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="password"
                    name="cvv"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={handleCardChange}
                  />
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={processPayment}
              >
                Pay ₹{totalAmount.toLocaleString("en-IN")}
              </Button>
            </div>
          </div>
        )}

        {selectedPaymentMethod === "upi" && (
          <div className="payment-form-section">
            <h2>UPI Details</h2>
            <div className="upi-form">
              <div className="form-group">
                <label>UPI ID</label>
                <input
                  type="text"
                  placeholder="yourname@bankname"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={processPayment}
              >
                Pay ₹{totalAmount.toLocaleString("en-IN")} via UPI
              </Button>
            </div>
          </div>
        )}

        {selectedPaymentMethod === "wallet" && (
          <div className="payment-form-section">
            <h2>Select Wallet</h2>
            <div className="wallet-options">
              <button className="wallet-option">
                <span>💜</span>
                <span>PayTM</span>
              </button>
              <button className="wallet-option">
                <span>🟠</span>
                <span>Amazon Pay</span>
              </button>
              <button className="wallet-option">
                <span>🔵</span>
                <span>Google Pay</span>
              </button>
            </div>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={processPayment}
            >
              Continue with Wallet
            </Button>
          </div>
        )}

        {selectedPaymentMethod === "cod" && (
          <div className="payment-form-section">
            <div className="cod-info">
              <p>✓ Pay when you receive your order</p>
              <p>✓ No advance payment required</p>
              <p>✓ Safe and convenient</p>
            </div>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={processPayment}
            >
              Confirm Cash on Delivery
            </Button>
          </div>
        )}

        {!selectedPaymentMethod && (
          <div className="no-method-selected">
            <p>Please select a payment method to continue</p>
          </div>
        )}

        {/* Security Information */}
        <div className="security-info">
          <div className="security-item">
            <span>🔒</span>
            <span>256-bit SSL Encryption</span>
          </div>
          <div className="security-item">
            <span>✓</span>
            <span>PCI DSS Compliant</span>
          </div>
          <div className="security-item">
            <span>🛡️</span>
            <span>Fraud Protection</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;