import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyProfile, updateMyProfile, getMyVendorProfile } from "../api/authApi";
import { getMyOrders, getVendorOrders, updateOrderStatus } from "../api/orderApi";
import Button from "../components/Button";
import "./Profile.css";

/**
 * Profile page — adapts its content based on the user's role.
 *
 * CUSTOMER view
 * ─────────────
 * • Profile card: name (editable), email, role
 * • My Orders tab: full order history with status + payment badges,
 *   expandable detail panel per order
 *
 * VENDOR view
 * ───────────
 * • Profile card: name (editable), email, store name, approval status
 * • Orders Received tab: all orders that contain the vendor's products,
 *   with buyer info, item details, and status management
 *
 * All data comes from real backend endpoints. No mocks.
 */
function Profile() {
  const navigate = useNavigate();
  const { isLoggedIn, role, loading: authLoading } = useAuth();

  // ── Profile state ─────────────────────────────────────────────────────
  const [profile,        setProfile]        = useState(null);
  const [vendorProfile,  setVendorProfile]  = useState(null);
  const [editingName,    setEditingName]    = useState(false);
  const [nameInput,      setNameInput]      = useState("");
  const [savingName,     setSavingName]     = useState(false);
  const [profileError,   setProfileError]   = useState("");

  // ── Orders state ──────────────────────────────────────────────────────
  const [orders,         setOrders]         = useState([]);
  const [vendorOrders,   setVendorOrders]   = useState([]);
  const [selectedOrder,  setSelectedOrder]  = useState(null);
  const [ordersLoading,  setOrdersLoading]  = useState(false);
  const [ordersError,    setOrdersError]    = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [actionError,    setActionError]    = useState("");

  // ── Page-level loading ────────────────────────────────────────────────
  const [pageLoading, setPageLoading] = useState(true);

  // ─────────────────────────────────────────────────────────────────────
  // Load everything on mount
  // ─────────────────────────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    try {
      const data = await getMyProfile();
      setProfile(data);
      setNameInput(data.name || "");
    } catch {
      setProfileError("Failed to load profile.");
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      if (role === "CUSTOMER") {
        const data = await getMyOrders();
        setOrders(data);
      } else if (role === "VENDOR") {
        const data = await getVendorOrders();
        setVendorOrders(data);
      }
    } catch (err) {
      setOrdersError(
        err.response?.data?.message || "Failed to load orders."
      );
    } finally {
      setOrdersLoading(false);
    }
  }, [role]);

  const loadVendorInfo = useCallback(async () => {
    if (role !== "VENDOR") return;
    try {
      const data = await getMyVendorProfile();
      setVendorProfile(data);
    } catch {
      // Non-fatal — vendor info is supplementary
    }
  }, [role]);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    Promise.all([loadProfile(), loadOrders(), loadVendorInfo()]).finally(() =>
      setPageLoading(false)
    );
  }, [isLoggedIn, authLoading, navigate, loadProfile, loadOrders, loadVendorInfo]);

  // ─────────────────────────────────────────────────────────────────────
  // Profile name update
  // ─────────────────────────────────────────────────────────────────────
  const handleSaveName = async () => {
    setSavingName(true);
    setProfileError("");
    try {
      const updated = await updateMyProfile({ name: nameInput });
      setProfile(updated);
      setEditingName(false);
    } catch {
      setProfileError("Failed to update name. Please try again.");
    } finally {
      setSavingName(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // Vendor: update order status
  // ─────────────────────────────────────────────────────────────────────
  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    setActionError("");
    try {
      await updateOrderStatus(orderId, newStatus);
      // Refresh vendor orders after status change
      const refreshed = await getVendorOrders();
      setVendorOrders(refreshed);
      // Update selected order inline
      setSelectedOrder((prev) => prev?.orderId === orderId
        ? { ...prev, orderStatus: newStatus }
        : prev
      );
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────
  const statusColor = (status = "") => ({
    PENDING:    { bg: "#fff3cd", color: "#856404" },
    PROCESSING: { bg: "#cfe2ff", color: "#084298" },
    SHIPPED:    { bg: "#d1ecf1", color: "#0c5460" },
    DELIVERED:  { bg: "#dcf5e3", color: "#2e7d32" },
    CANCELLED:  { bg: "#f8d7da", color: "#721c24" },
  }[status.toUpperCase()] ?? { bg: "#f0f0f0", color: "#333" });

  const statusIcon = (status = "") => ({
    PENDING:    "⏳",
    PROCESSING: "⚙️",
    SHIPPED:    "📦",
    DELIVERED:  "✅",
    CANCELLED:  "❌",
  }[status.toUpperCase()] ?? "📋");

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });

  const fmtMoney = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

  // ─────────────────────────────────────────────────────────────────────
  // Loading / auth guard
  // ─────────────────────────────────────────────────────────────────────
  if (authLoading || pageLoading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner" />
        <p>Loading profile…</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="profile-page">

      {/* ── Profile card ─────────────────────────────────────────────── */}
      <div className="profile-card">
        <div className="profile-avatar">
          {(profile?.name || profile?.email || "?")[0].toUpperCase()}
        </div>

        <div className="profile-info">
          {/* Name row */}
          <div className="profile-name-row">
            {editingName ? (
              <div className="profile-name-edit">
                <input
                  className="profile-name-input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your display name"
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  autoFocus
                />
                <div className="profile-name-actions">
                  <Button
                    variant="primary"
                    size="sm"
                    loading={savingName}
                    disabled={savingName}
                    onClick={handleSaveName}
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={savingName}
                    onClick={() => {
                      setEditingName(false);
                      setNameInput(profile?.name || "");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="profile-name-display">
                <h1 className="profile-display-name">
                  {profile?.name || profile?.email?.split("@")[0] || "User"}
                </h1>
                <button
                  className="profile-edit-btn"
                  onClick={() => setEditingName(true)}
                  title="Edit display name"
                >
                  ✏️
                </button>
              </div>
            )}
          </div>

          {profileError && (
            <p className="profile-error">{profileError}</p>
          )}

          <div className="profile-meta">
            <div className="profile-meta-item">
              <span className="profile-meta-label">Email</span>
              <span className="profile-meta-value">{profile?.email}</span>
            </div>
            <div className="profile-meta-item">
              <span className="profile-meta-label">Role</span>
              <span className={`profile-role-badge profile-role-${role?.toLowerCase()}`}>
                {role}
              </span>
            </div>
            {role === "VENDOR" && vendorProfile && (
              <>
                <div className="profile-meta-item">
                  <span className="profile-meta-label">Store</span>
                  <span className="profile-meta-value">{vendorProfile.storeName}</span>
                </div>
                <div className="profile-meta-item">
                  <span className="profile-meta-label">Approval</span>
                  <span
                    className="profile-approval-badge"
                    style={{
                      background: vendorProfile.approved ? "#dcf5e3" : "#fff3cd",
                      color:      vendorProfile.approved ? "#2e7d32" : "#856404",
                    }}
                  >
                    {vendorProfile.approved ? "✅ Approved" : "⏳ Pending"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Orders section ───────────────────────────────────────────── */}
      <div className="profile-orders-section">
        <h2 className="profile-section-title">
          {role === "VENDOR" ? "Orders Received" : "My Orders"}
        </h2>

        {ordersError && (
          <div className="profile-alert profile-alert--error">{ordersError}</div>
        )}

        {ordersLoading ? (
          <div className="profile-orders-loading">
            <div className="profile-spinner" />
            <p>Loading orders…</p>
          </div>
        ) : role === "CUSTOMER" ? (
          <CustomerOrders
            orders={orders}
            selectedOrder={selectedOrder}
            setSelectedOrder={setSelectedOrder}
            setActionError={setActionError}
            actionError={actionError}
            navigate={navigate}
            statusColor={statusColor}
            statusIcon={statusIcon}
            fmtDate={fmtDate}
            fmtMoney={fmtMoney}
          />
        ) : role === "VENDOR" ? (
          <VendorOrders
            orders={vendorOrders}
            selectedOrder={selectedOrder}
            setSelectedOrder={setSelectedOrder}
            actionError={actionError}
            setActionError={setActionError}
            updatingStatus={updatingStatus}
            handleStatusUpdate={handleStatusUpdate}
            statusColor={statusColor}
            statusIcon={statusIcon}
            fmtDate={fmtDate}
            fmtMoney={fmtMoney}
          />
        ) : null}
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER ORDERS SUB-COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function CustomerOrders({
  orders, selectedOrder, setSelectedOrder, setActionError, actionError,
  navigate, statusColor, statusIcon, fmtDate, fmtMoney,
}) {
  if (orders.length === 0) {
    return (
      <div className="profile-empty">
        <div className="profile-empty-icon">🛍️</div>
        <h3>No orders yet</h3>
        <p>Your order history will appear here after your first purchase.</p>
        <Button variant="primary" onClick={() => navigate("/shop")}>
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="profile-orders-grid">

      {/* Left: order list */}
      <div className="profile-orders-list">
        {orders.map((order) => {
          const sc = statusColor(order.status);
          return (
            <div
              key={order.id}
              className={`profile-order-card ${selectedOrder?.id === order.id ? "active" : ""}`}
              onClick={() => { setActionError(""); setSelectedOrder(order); }}
            >
              <div className="poc-header">
                <span className="poc-id">#{order.id}</span>
                <span className="poc-status" style={{ background: sc.bg, color: sc.color }}>
                  {statusIcon(order.status)} {order.status}
                </span>
              </div>
              <div className="poc-body">
                <div className="poc-meta">
                  <span>{order.items?.length ?? 0} item(s) • {fmtMoney(order.totalAmount)}</span>
                  <span className="poc-date">{fmtDate(order.createdAt)}</span>
                </div>
                <div className="poc-badges">
                  <span
                    className="poc-payment-badge"
                    style={{
                      background: order.paymentStatus === "PAID" ? "#dcf5e3" : "#fff3cd",
                      color:      order.paymentStatus === "PAID" ? "#2e7d32" : "#856404",
                    }}
                  >
                    {order.paymentStatus === "PAID" ? "✓ Paid" : "⏳ Unpaid"}
                  </span>
                </div>
              </div>
              {/* Thumbnail strip */}
              <div className="poc-thumbs">
                {order.items?.slice(0, 3).map((item) =>
                  item.imageUrl
                    ? <img key={item.id} src={item.imageUrl} alt={item.productName} />
                    : <div key={item.id} className="poc-thumb-placeholder">🛍️</div>
                )}
                {(order.items?.length ?? 0) > 3 && (
                  <div className="poc-thumb-placeholder">+{order.items.length - 3}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: detail panel */}
      {selectedOrder && (
        <div className="profile-detail-panel">
          <div className="pdp-header">
            <h3>Order #{selectedOrder.id}</h3>
            <button className="pdp-close" onClick={() => setSelectedOrder(null)}>✕</button>
          </div>

          {actionError && (
            <div className="profile-alert profile-alert--error" style={{ marginBottom: 12 }}>
              {actionError}
            </div>
          )}

          <div className="pdp-section">
            <h4>Details</h4>
            <div className="pdp-row"><span>Date</span><strong>{fmtDate(selectedOrder.createdAt)}</strong></div>
            <div className="pdp-row">
              <span>Order Status</span>
              <strong style={statusColor(selectedOrder.status)}>
                {statusIcon(selectedOrder.status)} {selectedOrder.status}
              </strong>
            </div>
            <div className="pdp-row">
              <span>Payment</span>
              <strong style={{ color: selectedOrder.paymentStatus === "PAID" ? "#2e7d32" : "#c62828" }}>
                {selectedOrder.paymentStatus === "PAID" ? "✓ PAID" : "⏳ UNPAID"}
              </strong>
            </div>
            <div className="pdp-row"><span>Total</span><strong>{fmtMoney(selectedOrder.totalAmount)}</strong></div>
          </div>

          <div className="pdp-section">
            <h4>Items ({selectedOrder.items?.length})</h4>
            {selectedOrder.items?.map((item) => (
              <div key={item.id} className="pdp-item">
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.productName} />
                  : <div className="pdp-item-placeholder">🛍️</div>
                }
                <div className="pdp-item-info">
                  <span className="pdp-item-name">{item.productName}</span>
                  <span className="pdp-item-price">{fmtMoney(item.priceAtPurchase)} × {item.quantity}</span>
                </div>
                <strong className="pdp-item-total">
                  {fmtMoney(item.priceAtPurchase * item.quantity)}
                </strong>
              </div>
            ))}
          </div>

          <div className="pdp-section">
            <h4>Delivery Address</h4>
            <p className="pdp-address">{selectedOrder.deliveryAddress}</p>
          </div>

          <div className="pdp-actions">
            {selectedOrder.paymentStatus === "UNPAID" && selectedOrder.status !== "CANCELLED" && (
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate("/payment", {
                  state: { orderId: selectedOrder.id, totalAmount: selectedOrder.totalAmount }
                })}
              >
                💳 Complete Payment
              </Button>
            )}
            {selectedOrder.items?.[0]?.productId && (
              <Button
                variant="secondary"
                fullWidth
                onClick={() => navigate(`/contact-seller/${selectedOrder.items[0].productId}`, {
                  state: {
                    productId:   selectedOrder.items[0].productId,
                    sellerEmail: "Seller",
                    product:     { name: selectedOrder.items[0].productName },
                  },
                })}
              >
                💬 Contact Seller
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR ORDERS SUB-COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const VENDOR_STATUS_OPTIONS = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

function VendorOrders({
  orders, selectedOrder, setSelectedOrder, actionError, setActionError,
  updatingStatus, handleStatusUpdate, statusColor, statusIcon, fmtDate, fmtMoney,
}) {
  if (orders.length === 0) {
    return (
      <div className="profile-empty">
        <div className="profile-empty-icon">📦</div>
        <h3>No orders received yet</h3>
        <p>When customers purchase your products, orders will appear here.</p>
      </div>
    );
  }

  return (
    <div className="profile-orders-grid">

      {/* Left: order list */}
      <div className="profile-orders-list">
        {orders.map((order) => {
          const sc = statusColor(order.orderStatus);
          const mySubtotal = order.items?.reduce(
            (s, i) => s + i.priceAtPurchase * i.quantity, 0
          ) ?? 0;

          return (
            <div
              key={order.orderId}
              className={`profile-order-card ${selectedOrder?.orderId === order.orderId ? "active" : ""}`}
              onClick={() => { setActionError(""); setSelectedOrder(order); }}
            >
              <div className="poc-header">
                <span className="poc-id">#{order.orderId}</span>
                <span className="poc-status" style={{ background: sc.bg, color: sc.color }}>
                  {statusIcon(order.orderStatus)} {order.orderStatus}
                </span>
              </div>
              <div className="poc-body">
                <div className="poc-meta">
                  <span>{order.items?.length ?? 0} item(s) • {fmtMoney(mySubtotal)}</span>
                  <span className="poc-date">{fmtDate(order.createdAt)}</span>
                </div>
                <div className="poc-badges">
                  <span
                    className="poc-payment-badge"
                    style={{
                      background: order.paymentStatus === "PAID" ? "#dcf5e3" : "#fff3cd",
                      color:      order.paymentStatus === "PAID" ? "#2e7d32" : "#856404",
                    }}
                  >
                    {order.paymentStatus === "PAID" ? "✓ Paid" : "⏳ Unpaid"}
                  </span>
                  <span className="poc-buyer">👤 {order.buyerEmail}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: detail panel */}
      {selectedOrder && (
        <div className="profile-detail-panel">
          <div className="pdp-header">
            <h3>Order #{selectedOrder.orderId}</h3>
            <button className="pdp-close" onClick={() => setSelectedOrder(null)}>✕</button>
          </div>

          {actionError && (
            <div className="profile-alert profile-alert--error" style={{ marginBottom: 12 }}>
              {actionError}
            </div>
          )}

          <div className="pdp-section">
            <h4>Details</h4>
            <div className="pdp-row"><span>Date</span><strong>{fmtDate(selectedOrder.createdAt)}</strong></div>
            <div className="pdp-row">
              <span>Order Status</span>
              <strong style={statusColor(selectedOrder.orderStatus)}>
                {statusIcon(selectedOrder.orderStatus)} {selectedOrder.orderStatus}
              </strong>
            </div>
            <div className="pdp-row">
              <span>Payment</span>
              <strong style={{ color: selectedOrder.paymentStatus === "PAID" ? "#2e7d32" : "#c62828" }}>
                {selectedOrder.paymentStatus === "PAID" ? "✓ PAID" : "⏳ UNPAID"}
              </strong>
            </div>
            <div className="pdp-row"><span>Buyer</span><strong>{selectedOrder.buyerEmail}</strong></div>
            <div className="pdp-row"><span>Delivery Address</span><strong style={{ fontSize: "0.85rem" }}>{selectedOrder.deliveryAddress}</strong></div>
          </div>

          <div className="pdp-section">
            <h4>Your Items ({selectedOrder.items?.length})</h4>
            {selectedOrder.items?.map((item) => (
              <div key={item.orderItemId} className="pdp-item">
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.productName} />
                  : <div className="pdp-item-placeholder">🛍️</div>
                }
                <div className="pdp-item-info">
                  <span className="pdp-item-name">{item.productName}</span>
                  <span className="pdp-item-price">{fmtMoney(item.priceAtPurchase)} × {item.quantity}</span>
                </div>
                <strong className="pdp-item-total">
                  {fmtMoney(item.priceAtPurchase * item.quantity)}
                </strong>
              </div>
            ))}
          </div>

          {/* Status management */}
          {selectedOrder.orderStatus !== "CANCELLED" && selectedOrder.orderStatus !== "DELIVERED" && (
            <div className="pdp-section pdp-status-mgmt">
              <h4>Update Order Status</h4>
              <div className="pdp-status-btns">
                {VENDOR_STATUS_OPTIONS
                  .filter((s) => s !== selectedOrder.orderStatus)
                  .map((s) => {
                    const sc = statusColor(s);
                    return (
                      <button
                        key={s}
                        className="pdp-status-btn"
                        style={{ background: sc.bg, color: sc.color, borderColor: sc.color }}
                        disabled={updatingStatus}
                        onClick={() => handleStatusUpdate(selectedOrder.orderId, s)}
                      >
                        {statusIcon(s)} Mark {s}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;
