import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";
import Button from "../components/Button";
import AddProductModal from "../components/AddProductModal";
import "./SellerDashboard.css";

function SellerDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalEarnings: 0,
    rating: 4.8,
  });

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  const handleAddProduct = (newProduct) => {
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    setShowAddModal(false);
    setStats((prev) => ({
      ...prev,
      totalProducts: updatedProducts.length,
    }));
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const updatedProducts = products.filter((p) => p.id !== productId);
      setProducts(updatedProducts);
      setStats((prev) => ({
        ...prev,
        totalProducts: updatedProducts.length,
      }));
    }
  };

  return (
    <div className="seller-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Seller Dashboard</h1>
          <p>Manage your products and track sales</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => setShowAddModal(true)}
        >
          + Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Total Products</p>
          <p className="stat-value">{stats.totalProducts}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Sales</p>
          <p className="stat-value">{stats.totalSales}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Earnings</p>
          <p className="stat-value">₹{stats.totalEarnings.toLocaleString("en-IN")}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Rating</p>
          <p className="stat-value">★ {stats.rating}</p>
        </div>
      </div>

      {/* Products */}
      <div className="products-section">
        <h2>Your Products</h2>

        {products.length === 0 ? (
          <div className="empty-state">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <h3>You haven't added any products yet</h3>
            <p>Get started by adding your first product to your shop</p>
            <Button
              variant="primary"
              onClick={() => setShowAddModal(true)}
            >
              + Add Your First Product
            </Button>
          </div>
        ) : (
          <div className="product-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Date Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="product-name-cell">
                      <img
                        src={product.imageUrl || product.image || "https://via.placeholder.com/50"}
                        alt={product.name}
                        className="product-thumbnail"
                      />
                      <span>{product.name}</span>
                    </td>
                    <td>
                      ₹{product.price?.toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span className="status-badge active">
                        Active
                      </span>
                    </td>
                    <td>{new Date().toLocaleDateString("en-IN")}</td>
                    <td>
                      <div className="action-buttons">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            handleDeleteProduct(product.id)
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddProduct}
        />
      )}
    </div>
  );
}

export default SellerDashboard;