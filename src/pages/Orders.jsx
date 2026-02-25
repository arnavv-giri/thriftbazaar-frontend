import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import "./Orders.css";

function Orders() {
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState("customer"); // customer or seller

  useEffect(() => {
    // Wait for auth to finish loading before checking login status
    if (authLoading) {
      return;
    }

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
    setOrders(allOrders);
    setLoading(false);
  }, [isLoggedIn, authLoading, navigate]);

  const getStatusColor = (status) => {
    const colors = {
      pending: "status-pending",
      processing: "status-processing",
      shipped: "status-shipped",
      delivered: "status-delivered",
      cancelled: "status-cancelled",
    };
    return colors[status] || "status-pending";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: "⏳",
      processing: "⚙️",
      shipped: "📦",
      delivered: "✅",
      cancelled: "❌",
    };
    return icons[status] || "📋";
  };

  const handleCancelOrder = (orderId) => {
    const updatedOrders = orders.map((order) =>
      order.orderId === orderId ? { ...order, status: "cancelled" } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    setSelectedOrder(null);
    alert("Order cancelled successfully");
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map((order) =>
      order.orderId === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));

    if (selectedOrder?.orderId === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="spinner" />
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <button className="back-button" onClick={() => navigate("/")}>
        ← Back to Home
      </button>

      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <div className="user-type-toggle">
            <button
              className={`toggle-btn ${userType === "customer" ? "active" : ""}`}
              onClick={() => setUserType("customer")}
            >
              Customer View
            </button>
            <button
              className={`toggle-btn ${userType === "seller" ? "active" : ""}`}
              onClick={() => setUserType("seller")}
            >
              Seller Dashboard
            </button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📋</div>
            <h2>No orders yet</h2>
            <p>Start shopping to create your first order</p>
            <Button variant="primary" size="lg" onClick={() => navigate("/")}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="orders-content">
            {/* Orders List */}
            <div className="orders-list">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className={`order-card ${selectedOrder?.orderId === order.orderId ? "active" : ""}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="order-card-header">
                    <div className="order-id">
                      <span className="label">Order ID:</span>
                      <span className="value">{order.orderId}</span>
                    </div>
                    <div className={`order-status ${getStatusColor(order.status)}`}>
                      <span>{getStatusIcon(order.status)}</span>
                      <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                    </div>
                  </div>

                  <div className="order-card-body">
                    <div className="order-summary">
                      <p>
                        <strong>{order.items.length}</strong> item(s) • ₹
                        {order.totalAmount.toLocaleString("en-IN")}
                      </p>
                      <p className="order-date">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="order-items-preview">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <img key={idx} src={item.images[0]} alt={item.name} />
                      ))}
                      {order.items.length > 2 && (
                        <div className="more-items">+{order.items.length - 2}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Details */}
            {selectedOrder && (
              <div className="order-details-section">
                <div className="details-header">
                  <h2>Order Details</h2>
                  <button
                    className="close-btn"
                    onClick={() => setSelectedOrder(null)}
                  >
                    ✕
                  </button>
                </div>

                <div className="details-content">
                  {/* Header */}
                  <div className="details-block">
                    <h3>Order Information</h3>
                    <div className="detail-row">
                      <span>Order ID:</span>
                      <strong>{selectedOrder.orderId}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Date:</span>
                      <strong>
                        {new Date(selectedOrder.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </strong>
                    </div>
                    <div className="detail-row">
                      <span>Status:</span>
                      <strong className={getStatusColor(selectedOrder.status)}>
                        {getStatusIcon(selectedOrder.status)}{" "}
                        {selectedOrder.status.toUpperCase()}
                      </strong>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="details-block">
                    <h3>Items ({selectedOrder.items.length})</h3>
                    <div className="items-list">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="item-detail">
                          <img src={item.images[0]} alt={item.name} />
                          <div className="item-info">
                            <p className="item-name">{item.name}</p>
                            <p className="item-seller">{item.seller}</p>
                            <p className="item-category">{item.category}</p>
                          </div>
                          <div className="item-purchase-info">
                            <p className="qty">x{item.quantity}</p>
                            <p className="price">
                              ₹{item.price.toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="details-block">
                    <h3>Delivery Address</h3>
                    <div className="address-box">
                      <p>{selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</p>
                      <p>{selectedOrder.deliveryAddress}</p>
                      <p>{selectedOrder.customer.phone}</p>
                      <p>{selectedOrder.customer.email}</p>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="details-block">
                    <h3>Price Summary</h3>
                    <div className="price-summary">
                      <div className="summary-row">
                        <span>Subtotal</span>
                        <span>
                          ₹
                          {(selectedOrder.totalAmount - selectedOrder.tax).toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="summary-row discount">
                          <span>Discount</span>
                          <span>
                            -₹{Math.round(selectedOrder.discount).toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}
                      <div className="summary-row">
                        <span>Tax (5%)</span>
                        <span>₹{selectedOrder.tax.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="summary-row">
                        <span>Shipping</span>
                        <span>Free</span>
                      </div>
                      <div className="summary-divider"></div>
                      <div className="summary-row total">
                        <span>Total</span>
                        <span>₹{selectedOrder.totalAmount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="details-block actions">
                    {userType === "customer" ? (
                      <>
                        {selectedOrder.status !== "cancelled" &&
                          selectedOrder.status !== "delivered" && (
                            <Button
                              variant="danger"
                              fullWidth
                              onClick={() => handleCancelOrder(selectedOrder.orderId)}
                            >
                              Cancel Order
                            </Button>
                          )}
                        <Button
                          variant="secondary"
                          fullWidth
                          onClick={() =>
                            navigate("/contact-seller/seller1", {
                              state: {
                                product: selectedOrder.items[0],
                              },
                            })
                          }
                        >
                          Contact Seller
                        </Button>
                      </>
                    ) : (
                      <>
                        {selectedOrder.status === "pending" && (
                          <Button
                            variant="primary"
                            fullWidth
                            onClick={() =>
                              handleUpdateStatus(selectedOrder.orderId, "processing")
                            }
                          >
                            Mark as Processing
                          </Button>
                        )}
                        {selectedOrder.status === "processing" && (
                          <Button
                            variant="primary"
                            fullWidth
                            onClick={() =>
                              handleUpdateStatus(selectedOrder.orderId, "shipped")
                            }
                          >
                            Mark as Shipped
                          </Button>
                        )}
                        {selectedOrder.status === "shipped" && (
                          <Button
                            variant="primary"
                            fullWidth
                            onClick={() =>
                              handleUpdateStatus(selectedOrder.orderId, "delivered")
                            }
                          >
                            Mark as Delivered
                          </Button>
                        )}
                      </>
                    )}
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