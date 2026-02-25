import { useState, useEffect } from "react";
import Button from "./Button";
import "./EditProductModal.css";

function EditProductModal({ product, onClose, onSave, loading }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "TSHIRTS",
    price: "",
    description: "",
    images: [],
    condition: "good",
    size: "M",
    color: "",
    material: "",
  });
  const [errors, setErrors] = useState({});
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with product data
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        category: product.category || "TSHIRTS",
        price: product.price || "",
        description: product.description || "",
        images: product.images || [],
        condition: product.condition || "good",
        size: product.size || "M",
        color: product.color || "",
        material: product.material || "",
      });
      setPreviewUrls(product.images || []);
    }
  }, [product]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.images || formData.images.length < 3)
      newErrors.images = "Product must have at least 3 photos";

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const fileList = Array.from(files || []);
      setFormData((prev) => ({ ...prev, images: fileList }));
      const urls = fileList.map((f) => URL.createObjectURL(f));
      setPreviewUrls(urls);
      if (errors.images) setErrors((prev) => ({ ...prev, images: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Construct update payload
      const updateData = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        description: formData.description,
        condition: formData.condition,
        size: formData.size,
        color: formData.color,
        material: formData.material,
      };

      // Handle images - only include if changed
      if (formData.images && formData.images.length > 0) {
        updateData.images = formData.images.map((f) =>
          f instanceof File ? URL.createObjectURL(f) : f
        );
      }

      await onSave(product.id, updateData);
      onClose();
    } catch (err) {
      console.error("Error updating product:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Product</h2>
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Product Photos * (min 3)</label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              multiple
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.images && (
              <span className="error-text">{errors.images}</span>
            )}

            {previewUrls && previewUrls.length > 0 && (
              <div className="image-previews">
                {previewUrls.map((src, idx) => (
                  <div key={idx} className="preview-thumb">
                    <img src={src} alt={`preview-${idx}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProductModal;
