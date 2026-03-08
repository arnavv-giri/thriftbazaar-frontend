import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPendingVendors, approveVendor } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import "./AdminDashboard.css";

/**
 * Admin Dashboard — vendor approval panel.
 * Only accessible to users with role = ADMIN.
 */
function AdminDashboard() {
  const navigate = useNavigate();
  const { isLoggedIn, role } = useAuth();

  const [vendors, setVendors]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [approving, setApproving] = useState(null); // vendorId currently being approved

  // ── Auth gate ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (role !== "ADMIN") {
      navigate("/");
      return;
    }

    loadPending();
  }, [isLoggedIn, role, navigate]);

  // ── Data ──────────────────────────────────────────────────────────────
  const loadPending = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPendingVendors();
      setVendors(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load pending vendors.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId) => {
    setApproving(vendorId);
    try {
      await approveVendor(vendorId);
      // Remove from pending list immediately
      setVendors((prev) => prev.filter((v) => v.id !== vendorId));
    } catch (err) {
      alert(err.response?.data?.message || "Approval failed. Please try again.");
    } finally {
      setApproving(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Review and approve pending vendor applications</p>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-loading">
          <div className="spinner" />
          <p>Loading pending applications...</p>
        </div>
      ) : vendors.length === 0 ? (
        <div className="admin-empty">
          <p>✅ No pending vendor applications.</p>
        </div>
      ) : (
        <div className="vendor-table-wrapper">
          <table className="vendor-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Store Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td>{vendor.id}</td>
                  <td>{vendor.storeName}</td>
                  <td>{vendor.user?.email}</td>
                  <td>
                    <span className="badge badge--pending">Pending</span>
                  </td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      loading={approving === vendor.id}
                      onClick={() => handleApprove(vendor.id)}
                    >
                      Approve
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
