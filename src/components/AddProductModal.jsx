import { useState } from "react";
import api from "../utils/axios";
import Button from "./Button";
import "./AddProductModal.css";

function AddProductModal({ onClose, onAdd }) {

  const [name,      setName]      = useState("");
  const [price,     setPrice]     = useState("");
  const [stock,     setStock]     = useState(1);
  const [category,  setCategory]  = useState("TSHIRTS");
  const [condition, setCondition] = useState("GOOD");
  const [size,      setSize]      = useState("M");
  const [file,      setFile]      = useState(null);
  const [loading,   setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      let imageUrl = null;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await api.post("/upload", formData);
        imageUrl = res.data.url;
      }

      await onAdd({
        name,
        price:     Number(price),
        stock:     Number(stock),
        category,
        condition,
        size,
        imageUrls: imageUrl ? [imageUrl] : [],
      });

      onClose();
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">

        {/* Header */}
        <div className="modal-header">
          <h2>Add New Product</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">

          {/* Product name — full width */}
          <div className="form-group">
            <label htmlFor="ap-name">Product Name *</label>
            <input
              id="ap-name"
              type="text"
              placeholder="e.g. Vintage Levi's Jacket"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Price + Stock — side by side */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ap-price">Price (₹) *</label>
              <input
                id="ap-price"
                type="number"
                placeholder="e.g. 499"
                min="1"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="ap-stock">Stock Quantity</label>
              <input
                id="ap-stock"
                type="number"
                placeholder="e.g. 5"
                min="0"
                value={stock}
                onChange={e => setStock(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Category + Condition — side by side */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ap-category">Category *</label>
              <select
                id="ap-category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                disabled={loading}
              >
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
            </div>

            <div className="form-group">
              <label htmlFor="ap-condition">Condition *</label>
              <select
                id="ap-condition"
                value={condition}
                onChange={e => setCondition(e.target.value)}
                disabled={loading}
              >
                <option value="EXCELLENT">Excellent</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
              </select>
            </div>
          </div>

          {/* Size — half width */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ap-size">Size *</label>
              <select
                id="ap-size"
                value={size}
                onChange={e => setSize(e.target.value)}
                disabled={loading}
              >
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
            </div>

            {/* Image upload */}
            <div className="form-group">
              <label htmlFor="ap-image">Product Photo</label>
              <input
                id="ap-image"
                type="file"
                accept="image/*"
                onChange={e => setFile(e.target.files[0])}
                disabled={loading}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              Add Product
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AddProductModal;
