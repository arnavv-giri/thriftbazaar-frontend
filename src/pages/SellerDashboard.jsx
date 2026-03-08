import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { getVendorOrders, updateOrderStatus } from "../api/orderApi";
import Button from "../components/Button";
import AddProductModal from "../components/AddProductModal";
import EditProductModal from "../components/EditProductModal";
import "./SellerDashboard.css";

/**
 * Seller Dashboard — two tabs: Products and Orders Received.
 *
 * Products tab  — existing CRUD interface (unchanged).
 * Orders tab    — all orders containing this vendor's products,
 *                 with status management.
 */
function SellerDashboard() {
  const navigate = useNavigate();
  const { isLoggedIn, role } = useAuth();

  // ── Tab state ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("products"); // "products" | "orders"

  // ── Products state ────────────────────────────────────────────────────
  const [products, setProducts]             = useState([]);
  const [loading,  setLoading]              = useState(true);
  const [showAddModal, setShowAddModal]     = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError]                   = useState("");

  const DASHBOARD_PAGE_SIZE = 10;
  const [dashPage, setDashPage] = useState(0);
  const totalDashPages = Math.ceil(products.length / DASHBOARD_PAGE_SIZE);
  const pagedProducts  = products.slice(
    dashPage * DASHBOARD_PAGE_SIZE,
    (dashPage + 1) * DASHBOARD_PAGE_SIZE
  );

  // ── Orders state ──────────────────────────────────────────────────────
  const [orders,         setOrders]         = useState([]);
  const [ordersLoading,  setOrdersLoading]  = useState(false);
  const [ordersError,    setOrdersError]    = useState("");
  const [selectedOrder,  setSelectedOrder]  = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError,    setStatusError]    = useState("");

  // ─────────────────────────────────────────────────────────────────────
  // Auth guard
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) { navigate("/login"); return; }
    if (role !== "VENDOR") { navigate("/"); return; }
    loadProducts();
  }, [isLoggedIn, role, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────────────
  // Load data
  // ─────────────────────────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/products/my");
      setProducts(Array.isArray(res.data) ? res.data : []);
      setDashPage(0);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Your vendor account is pending approval.");
      } else {
        setError("Failed to load products. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const data = await getVendorOrders();
      setOrders(data);
    } catch (err) {
      setOrdersError(
        err.response?.data?.message || "Failed to load orders."
      );
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // Load orders when tab is first activated
  useEffect(() => {
    if (activeTab === "orders" && orders.length === 0 && !ordersLoading) {
      loadOrders();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────────────
  // Product CRUD
  // ─────────────────────────────────────────────────────────────────────
  const handleAddProduct = async (productData) => {
    try {
      await api.post("/products", productData);
      await loadProducts();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add product");
    }
  };

  const handleEditProduct = async (productId, productData) => {
    try {
      await api.put(`/products/${productId}`, productData);
      await loadProducts();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update product");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${productId}`);
      await loadProducts();
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  const getProductImage = (product) =>
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : "https://via.placeholder.com/60";

  // ─────────────────────────────────────────────────────────────────────
  // Order status update
  // ─────────────────────────────────────────────────────────────────────
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    setStatusError("");
    try {
      await updateOrderStatus(orderId, newStatus);
      await loadOrders();
      setSelectedOrder((prev) =>
        prev?.orderId === orderId ? { ...prev, orderStatus: newStatus } : prev
      );
    } catch (err) {
      setStatusError(err.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────
  const statusStyle = (status = "") => ({
    PENDING:    { bg: "#fff3cd", color: "#856404" },
    PROCESSING: { bg: "#cfe2ff", color: "#084298" },
    SHIPPED:    { bg: "#d1ecf1", color: "#0c5460" },
    DELIVERED:  { bg: "#dcf5e3", color: "#2e7d32" },
    CANCELLED:  { bg: "#f8d7da", color: "#721c24" },
  }[status.toUpperCase()] ?? { bg: "#f0f0f0", color: "#333" });

  const statusIcon = (s = "") => ({ PENDING: "⏳", PROCESSING: "⚙️", SHIPPED: "📦", DELIVERED: "✅", CANCELLED: "❌" }[s.toUpperCase()] ?? "📋");
  const fmtMoney   = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
  const fmtDate    = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  // ─────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="seller-dashboard">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="dashboard-header">
        <div>
          <h1>Seller Dashboard</h1>
          <p>Manage your store</p>
        </div>
        {activeTab === "products" && (
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            + Add Product
          </Button>
        )}
        {activeTab === "orders" && (
          <Button variant="secondary" onClick={loadOrders} disabled={ordersLoading}>
            ↻ Refresh
          </Button>
        )}
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────── */}
      <div className="dashboard-tabs">
        <button
          className={`dashboard-tab ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          🛍️ Products ({products.length})
        </button>
        <button
          className={`dashboard-tab ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          📦 Orders Received {orders.length > 0 ? `(${orders.length})` : ""}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          PRODUCTS TAB
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "products" && (
        <>
          {error && <p className="dashboard-error">{error}</p>}

          {loading ? (
            <div className="dashboard-loading">
              <div className="spinner" />
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <h3>No products yet</h3>
              <p>Add your first product to start selling.</p>
              <Button onClick={() => setShowAddModal(true)}>Add First Product</Button>
            </div>
          ) : (
            <div>
              {totalDashPages > 1 && (
                <div className="dashboard-pagination">
                  <button
                    className="dash-page-btn"
                    onClick={() => setDashPage(p => Math.max(0, p - 1))}
                    disabled={dashPage === 0}
                  >‹</button>
                  <span className="dash-page-info">
                    Page {dashPage + 1} of {totalDashPages}
                    <span className="dash-page-total"> ({products.length} products)</span>
                  </span>
                  <button
                    className="dash-page-btn"
                    onClick={() => setDashPage(p => Math.min(totalDashPages - 1, p + 1))}
                    disabled={dashPage >= totalDashPages - 1}
                  >›</button>
                </div>
              )}

              <table className="product-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          width="60" height="60"
                          style={{ objectFit: "cover", borderRadius: "4px" }}
                        />
                      </td>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{fmtMoney(product.price)}</td>
                      <td>
                        <span className={product.stock === 0 ? "stock-out" : "stock-ok"}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="action-cell">
                        <Button variant="secondary" size="sm" onClick={() => setEditingProduct(product)}>Edit</Button>
                        <Button variant="danger"    size="sm" onClick={() => handleDeleteProduct(product.id)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════
          ORDERS TAB
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === "orders" && (
        <div className="orders-tab-content">
          {ordersError && (
            <div className="dashboard-error">{ordersError}</div>
          )}

          {ordersLoading ? (
            <div className="dashboard-loading">
              <div className="spinner" />
              <p>Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <h3>No orders yet</h3>
              <p>When customers purchase your products, orders will appear here.</p>
            </div>
          ) : (
            <div className="vendor-orders-grid">

              {/* Order list */}
              <div className="vendor-orders-list">
                {orders.map((order) => {
                  const ss = statusStyle(order.orderStatus);
                  const myTotal = order.items?.reduce(
                    (s, i) => s + i.priceAtPurchase * i.quantity, 0
                  ) ?? 0;
                  return (
                    <div
                      key={order.orderId}
                      className={`vendor-order-card ${selectedOrder?.orderId === order.orderId ? "active" : ""}`}
                      onClick={() => { setStatusError(""); setSelectedOrder(order); }}
                    >
                      <div className="voc-header">
                        <span className="voc-id">Order #{order.orderId}</span>
                        <span className="voc-status" style={{ background: ss.bg, color: ss.color }}>
                          {statusIcon(order.orderStatus)} {order.orderStatus}
                        </span>
                      </div>
                      <div className="voc-row">
                        <span className="voc-buyer">👤 {order.buyerEmail}</span>
                        <span className="voc-date">{fmtDate(order.createdAt)}</span>
                      </div>
                      <div className="voc-row">
                        <span>{order.items?.length ?? 0} item(s) • {fmtMoney(myTotal)}</span>
                        <span
                          className="voc-payment"
                          style={{
                            background: order.paymentStatus === "PAID" ? "#dcf5e3" : "#fff3cd",
                            color:      order.paymentStatus === "PAID" ? "#2e7d32" : "#856404",
                          }}
                        >
                          {order.paymentStatus === "PAID" ? "✓ Paid" : "⏳ Unpaid"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detail panel */}
              {selectedOrder && (
                <div className="vendor-order-detail">
                  <div className="vod-header">
                    <h3>Order #{selectedOrder.orderId}</h3>
                    <button className="vod-close" onClick={() => setSelectedOrder(null)}>✕</button>
                  </div>

                  {statusError && (
                    <div className="dashboard-error" style={{ margin: "0 0 12px 0" }}>{statusError}</div>
                  )}

                  {/* Info */}
                  <div className="vod-section">
                    <h4>Order Info</h4>
                    <div className="vod-row"><span>Date</span><strong>{fmtDate(selectedOrder.createdAt)}</strong></div>
                    <div className="vod-row">
                      <span>Status</span>
                      <strong style={{ color: statusStyle(selectedOrder.orderStatus).color }}>
                        {statusIcon(selectedOrder.orderStatus)} {selectedOrder.orderStatus}
                      </strong>
                    </div>
                    <div className="vod-row">
                      <span>Payment</span>
                      <strong style={{ color: selectedOrder.paymentStatus === "PAID" ? "#2e7d32" : "#c62828" }}>
                        {selectedOrder.paymentStatus === "PAID" ? "✓ PAID" : "⏳ UNPAID"}
                      </strong>
                    </div>
                    <div className="vod-row"><span>Buyer</span><strong>{selectedOrder.buyerEmail}</strong></div>
                    <div className="vod-row"><span>Delivery</span><strong style={{ fontSize: "0.82rem" }}>{selectedOrder.deliveryAddress}</strong></div>
                  </div>

                  {/* Items */}
                  <div className="vod-section">
                    <h4>Your Items</h4>
                    {selectedOrder.items?.map((item) => (
                      <div key={item.orderItemId} className="vod-item">
                        {item.imageUrl
                          ? <img src={item.imageUrl} alt={item.productName} />
                          : <div className="vod-item-ph">🛍️</div>
                        }
                        <div className="vod-item-info">
                          <span className="vod-item-name">{item.productName}</span>
                          <span className="vod-item-price">{fmtMoney(item.priceAtPurchase)} × {item.quantity}</span>
                        </div>
                        <strong className="vod-item-total">
                          {fmtMoney(item.priceAtPurchase * item.quantity)}
                        </strong>
                      </div>
                    ))}
                  </div>

                  {/* Status update */}
                  {selectedOrder.orderStatus !== "CANCELLED" &&
                   selectedOrder.orderStatus !== "DELIVERED" && (
                    <div className="vod-section vod-status-section">
                      <h4>Update Status</h4>
                      <div className="vod-status-btns">
                        {["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
                          .filter((s) => s !== selectedOrder.orderStatus)
                          .map((s) => {
                            const ss = statusStyle(s);
                            return (
                              <button
                                key={s}
                                className="vod-status-btn"
                                style={{ background: ss.bg, color: ss.color, borderColor: ss.color }}
                                disabled={updatingStatus}
                                onClick={() => handleStatusChange(selectedOrder.orderId, s)}
                              >
                                {statusIcon(s)} {s}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────── */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddProduct}
        />
      )}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleEditProduct}
        />
      )}
    </div>
  );
}

export default SellerDashboard;
