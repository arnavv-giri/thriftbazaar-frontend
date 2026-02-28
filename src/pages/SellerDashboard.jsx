import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";
import { isLoggedIn } from "../utils/auth";
import Button from "../components/Button";
import AddProductModal from "../components/AddProductModal";
import "./SellerDashboard.css";

function SellerDashboard() {

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {

    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    loadProducts();

  }, []);


  const loadProducts = async () => {

    try {

      setLoading(true);

      const res = await api.get("/products/my");

      setProducts(res.data);

    }
    catch (err) {

      console.error(err);
      setError("Failed to load products");

    }
    finally {

      setLoading(false);

    }

  };


  /* CREATE PRODUCT */
  const handleAddProduct = async (productData) => {

    try {

      await api.post("/products", productData);

      await loadProducts();

    }
    catch (err) {

      console.error(err);
      alert("Failed to add product");

    }

  };


  /* DELETE PRODUCT */
  const handleDeleteProduct = async (productId) => {

    if (!window.confirm("Delete product?"))
      return;

    try {

      await api.delete(`/products/${productId}`);

      loadProducts();

    }
    catch (err) {

      console.error(err);
      alert("Delete failed");

    }

  };


  return (

    <div className="seller-dashboard">

      <div className="dashboard-header">

        <div>

          <h1>Seller Dashboard</h1>
          <p>Manage your products</p>

        </div>

        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
        >
          + Add Product
        </Button>

      </div>


      {error && <p style={{color:"red"}}>{error}</p>}


      {loading ? (

        <p>Loading...</p>

      ) : products.length === 0 ? (

        <div className="empty-state">

          <h3>No products yet</h3>

          <Button
            onClick={() => setShowAddModal(true)}
          >
            Add first product
          </Button>

        </div>

      ) : (

        <table className="product-table">

          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {products.map(product => (

              <tr key={product.id}>

                <td>

                  <img
                    src={
                      product.imageUrls?.[0]
                      || "https://via.placeholder.com/60"
                    }
                    width="60"
                  />

                </td>

                <td>{product.name}</td>

                <td>₹{product.price}</td>

                <td>{product.stock}</td>

                <td>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      handleDeleteProduct(product.id)
                    }
                  >
                    Delete
                  </Button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      )}


      {showAddModal && (

        <AddProductModal
          onClose={() =>
            setShowAddModal(false)
          }
          onAdd={handleAddProduct}
        />

      )}

    </div>

  );

}

export default SellerDashboard;