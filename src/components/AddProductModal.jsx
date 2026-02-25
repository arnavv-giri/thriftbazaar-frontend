import { useState } from "react";
import Button from "./Button";
import "./AddProductModal.css";

function AddProductModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "TSHIRTS",
    price: "",
    description: "",
    image: null,
    condition: "good",
    size: "M",
    color: "",
    material: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.image && !formData.imageUrl)
      newErrors.image = "Product image is required";

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => (
      {
        ...prev,
        [name]: type === "file" ? files[0] : value,
      }
    ));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const product = {
        id: `p${Date.now()}`,
        ...formData,
        price: parseFloat(formData.price),
        imageUrl:
          formData.image instanceof File
            ? URL.createObjectURL(formData.image)
            : "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop",
      };

      onAdd(product);
    } catch (err) {
      console.error("Error adding product:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Product</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Vintage Blue Jeans"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.name && (
                <span className="error-text">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="price">Price (₹) *</label>
              <input
                id="price"
                name="price"
                type="number"
                placeholder="1500"
                value={formData.price}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.price && (
                <span className="error-text">{errors.price}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="TSHIRTS">T-Shirts</option>
                <option value="JEANS">Jeans</option>
                <option value="SHIRTS">Shirts</option>
                <option value="JACKETS">Jackets</option>
                <option value="DRESSES">Dresses</option>
                <option value="SHOES">Shoes</option>
                <option value="ACCESSORIES">Accessories</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="condition">Condition</label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="size">Size</label>
              <select
                id="size"
                name="size"
                value={formData.size}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="color">Color</label>
              <input
                id="color"
                name="color"
                type="text"
                placeholder="Blue"
                value={formData.color}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="material">Material</label>
            <input
              id="material"
              name="material"
              type="text"
              placeholder="Cotton, Polyester, etc."
              value={formData.material}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe your product in detail..."
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Product Image *</label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleChange}
              disabled={loading}
            />
            {errors.image && (
              <span className="error-text">{errors.image}</span>
            )}
          </div>

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