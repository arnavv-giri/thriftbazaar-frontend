import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyOrders, cancelMyOrder } from "../api/orderApi";
import Button from "../components/Button";
import "./Orders.css";

/**
 * Orders page — shows the authenticated customer's order history.
 *
 * Data source: GET /orders  (real backend, JWT-authenticated)
 *
 * Backend response shape (OrderResponseDto):
 *   {
 *     id:              number
 *     status:          "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
 *     totalAmount:     number
 *     createdAt:       ISO string
 *     deliveryAddress: string
 *     items: [
 *       {
 *         id:              number
 *         productId:       number | null
 *         productName:     string
 *         priceAtPurchase: number
 *         quantity:        number
 *         imageUrl:        string | null
 *       }
 *     ]
 *   }
 *
 * All CSS classes are identical to the original Orders.css — no styling
 * changes are required.
 */
function Orders() {
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useAuth();

  const [orders,        setOrders]        = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [actionError,   setActionError]   = useState("");
  const [cancelling,    setCancelling]    = useState(false);

  // ── Load orders from backend ──────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    setError("");
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error   ||
        "Failed to load orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    loadOrders();
  }, [isLoggedIn, authLoading, navigate, loadOrders]);

  // ── Status helpers (backend uses UPPERCASE) ───────────────────────────
  const getStatusColor = (status = "") => {
    const map = {
      PENDING:    "status-pending",
      PROCESSING: "status-processing",
      SHIPPED:    "status-shipped",
      DELIVERED:  "status-delivered",
      CANCELLED:  "status-cancelled",
    };
    return map[status.toUpperCase()] ?? "status-pending";
  };

  const getStatusIcon = (status = "") => {
    const map = {
      PENDING:    "⏳",
      PROCESSING: "⚙️",
      SHIPPED:    "📦",
      DELIVERED:  "✅",
      CANCELLED:  "❌",
    };
    return map[status.toUpperCase()] ?? "📋";
  };

  const formatStatus = (status = "") =>
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  // ── Cancel order — calls PUT /orders/{id}/status ──────────────────────
  const handleCancelOrder = async (orderId) => {
    setActionError("");
    setCancelling(true);
    try {
      const updated = await cancelMyOrder(orderId);
      // Update both the list and the selected detail panel atomically
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );
      setSelectedOrder(updated);
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
        err.response?.data?.error   ||
        "Failed to cancel order. Please try again."
      );
    } finally {
      setCancelling(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="orders-loading">
        <div className="spinner" />
        <p>Loading your orders…</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="orders-page">
      <button className="back-button" onClick={() => navigate("/")}>
        ← Back to Home
      </button>

      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
        </div>

        {/* Top-level fetch error — only shown when a real API failure occurred */}
        {error ? (
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
        ) : orders.length === 0 ? (
          /* Empty state — zero orders is a valid state, not an error */
          <div className="empty-orders">
            <div className="empty-icon">🛍️</div>
            <h2>You have not placed any orders yet</h2>
            <p>Browse our collection and find something you love!</p>
            <Button variant="primary" size="lg" onClick={() => navigate("/shop")}>
              Shop Now
            </Button>
          </div>
        ) : (
          <div className="orders-content">

            {/* ── Orders list (left column) ─────────────────────────── */}
            <div className="orders-list">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`order-card ${selectedOrder?.id === order.id ? "active" : ""}`}
                  onClick={() => {
                    setActionError("");
                    setSelectedOrder(order);
                  }}
                >
                  <div className="order-card-header">
                    <div className="order-id">
                      <span className="label">Order ID</span>
                      <span className="value">#{order.id}</span>
                    </div>
                    <div className={`order-status ${getStatusColor(order.status)}`}>
                      <span>{getStatusIcon(order.status)}</span>
                      <span>{formatStatus(order.status)}</span>
                    </div>
                  </div>

                  <div className="order-card-body">
                    <div className="order-summary">
                      <p>
                        <strong>{order.items.length}</strong> item(s) •{" "}
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </p>
                      <p className="order-date">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Thumbnail strip — up to 2 images */}
                    <div className="order-items-preview">
                      {order.items.slice(0, 2).map((item) => (
                        item.imageUrl ? (
                          <img
                            key={item.id}
                            src={item.imageUrl}
                            alt={item.productName}
                          />
                        ) : (
                          <div
                            key={item.id}
                            className="more-items"
                            title={item.productName}
                          >
                            🛍️
                          </div>
                        )
                      ))}
                      {order.items.length > 2 && (
                        <div className="more-items">
                          +{order.items.length - 2}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Order detail panel (right column) ────────────────── */}
            {selectedOrder && (
              <div className="order-details-section">
                <div className="details-header">
                  <h2>Order Details</h2>
                  <button
                    className="close-btn"
                    onClick={() => {
                      setSelectedOrder(null);
                      setActionError("");
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div className="details-content">

                  {/* Action-level error */}
                  {actionError && (
                    <div style={{
                      background: "#ffebee",
                      color: "#c62828",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      borderLeft: "4px solid #c62828",
                      fontSize: "0.85rem",
                    }}>
                      {actionError}
                    </div>
                  )}

                  {/* ── Order info ───────────────────────────────────── */}
                  <div className="details-block">
                    <h3>Order Information</h3>
                    <div className="detail-row">
                      <span>Order ID</span>
                      <strong>#{selectedOrder.id}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Date</span>
                      <strong>
                        {new Date(selectedOrder.createdAt).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "long", year: "numeric" }
                        )}
                      </strong>
                    </div>
                    <div className="detail-row">
                      <span>Fulfilment Status</span>
                      <strong className={getStatusColor(selectedOrder.status)}>
                        {getStatusIcon(selectedOrder.status)}{" "}
                        {selectedOrder.status}
                      </strong>
                    </div>
                    <div className="detail-row">
                      <span>Payment Status</span>
                      <strong style={{
                        color: selectedOrder.paymentStatus === "PAID" ? "#2e7d32" : "#c62828"
                      }}>
                        {selectedOrder.paymentStatus === "PAID" ? "✓ PAID" : "⏳ UNPAID"}
                      </strong>
                    </div>
                  </div>

                  {/* ── Items ───────────────────────────────────────── */}
                  <div className="details-block">
                    <h3>Items ({selectedOrder.items.length})</h3>
                    <div className="items-list">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="item-detail">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.productName} />
                          ) : (
                            <div style={{
                              width: 70, height: 70,
                              background: "#f5f5f5",
                              borderRadius: 8,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.8rem",
                            }}>
                              🛍️
                            </div>
                          )}
                          <div className="item-info">
                            <p className="item-name">{item.productName}</p>
                            <p className="item-category">
                              ₹{item.priceAtPurchase.toLocaleString("en-IN")} each
                            </p>
                          </div>
                          <div className="item-purchase-info">
                            <span className="qty">×{item.quantity}</span>
                            <span className="price">
                              ₹{(item.priceAtPurchase * item.quantity).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Delivery address ────────────────────────────── */}
                  <div className="details-block">
                    <h3>Delivery Address</h3>
                    <div className="address-box">
                      <p>{selectedOrder.deliveryAddress}</p>
                    </div>
                  </div>

                  {/* ── Price summary ────────────────────────────────── */}
                  <div className="details-block">
                    <h3>Price Summary</h3>
                    <div className="price-summary">
                      <div className="summary-row">
                        <span>
                          {selectedOrder.items.reduce((s, i) => s + i.quantity, 0)} item(s)
                        </span>
                        <span>₹{selectedOrder.totalAmount.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="summary-row">
                        <span>Shipping</span>
                        <span>Free</span>
                      </div>
                      <div className="summary-divider" />
                      <div className="summary-row total">
                        <span>Total</span>
                        <span>₹{selectedOrder.totalAmount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  {/* ── Actions ─────────────────────────────────────── */}
                  <div className="details-block actions">
                  {/* Complete Payment — only if UNPAID and not CANCELLED */}
                  {selectedOrder.paymentStatus === "UNPAID" &&
                  selectedOrder.status !== "CANCELLED" && (
                  <Button
                  variant="primary"
                  fullWidth
                  onClick={() =>
                    navigate("/payment", {
                      state: {
                          orderId:     selectedOrder.id,
                        totalAmount: selectedOrder.totalAmount,
                        },
                        })
                        }
                      >
                        💳 Complete Payment
                      </Button>
                    )}

                    {/* Cancel — only if PENDING or PROCESSING */}
                    {(selectedOrder.status === "PENDING" ||
                      selectedOrder.status === "PROCESSING") && (
                      <Button
                        variant="danger"
                        fullWidth
                        loading={cancelling}
                        disabled={cancelling}
                        onClick={() => handleCancelOrder(selectedOrder.id)}
                      >
                        Cancel Order
                      </Button>
                    )}

                    {/* Contact seller — only if a productId is still available */}
                    {selectedOrder.items[0]?.productId && (
                      <Button
                        variant="secondary"
                        fullWidth
                        onClick={() =>
                          navigate(
                            `/contact-seller/${selectedOrder.items[0].productId}`,
                            {
                              state: {
                                productId:   selectedOrder.items[0].productId,
                                sellerEmail: "Seller",
                                product:     { name: selectedOrder.items[0].productName },
                              },
                            }
                          )
                        }
                      >
                        Contact Seller
                      </Button>
                    )}

                    <Button
                      variant="tertiary"
                      fullWidth
                      onClick={() => navigate("/shop")}
                    >
                      Continue Shopping
                    </Button>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
