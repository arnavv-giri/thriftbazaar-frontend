import { useState } from "react";
import api from "../utils/axios";
import Button from "./Button";

function EditProductModal({ product, onClose, onSave }) {

  const [name, setName] = useState(product.name || "");
  const [price, setPrice] = useState(product.price || "");
  const [stock, setStock] = useState(product.stock ?? 0);
  const [category, setCategory] = useState(product.category || "TSHIRTS");
  const [condition, setCondition] = useState(product.condition || "GOOD");
  const [size, setSize] = useState(product.size || "M");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Product name is required");
      return;
    }
    if (Number(price) <= 0) {
      alert("Price must be positive");
      return;
    }

    try {
      setLoading(true);

      let imageUrls = product.images || [];

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await api.post("/upload", formData);
        imageUrls = [res.data.url];
      }

      await onSave(product.id, {
        name,
        price: Number(price),
        stock: Number(stock),
        category,
        condition,
        size,
        imageUrls,
      });

      onClose();
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.error || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Product</h2>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="1"
          />

          <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            min="0"
          />

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="TSHIRTS">T-Shirts</option>
            <option value="SHIRTS">Shirts</option>
            <option value="JEANS">Jeans</option>
            <option value="JACKETS">Jackets</option>
            <option value="DRESSES">Dresses</option>
            <option value="ACCESSORIES">Accessories</option>
            <option value="SHOES">Shoes</option>
            <option value="HOODIES">Hoodies</option>
            <option value="SWEATERS">Sweaters</option>
          </select>

          <select value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option value="EXCELLENT">Excellent</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
          </select>

          <select value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>

          <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "4px" }}>
            Replace image (optional):
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <Button type="submit" variant="primary" loading={loading}>
              Save Changes
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProductModal;
