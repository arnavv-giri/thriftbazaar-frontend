import { useState } from "react";
import "./ProductCard.css";

function ProductCard({ product, onClick }) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => setIsLoading(false);
  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      onClick();
    }
  };

  // Get the main image - handle both array and string formats
  const mainImage = Array.isArray(product.images)
    ? product.images[0]
    : product.image || product.imageUrl;

  return (
    <div
      className="product-card"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="product-image-wrapper">
        {isLoading && <div className="image-skeleton" />}
        {!imageError ? (
          <img
            src={mainImage}
            alt={product.name}
            className="product-image"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="image-placeholder">
            <span>No Image</span>
          </div>
        )}
        <div className="product-overlay">
          <span className="view-details">View Details</span>
        </div>
      </div>

      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-footer">
          <p className="product-price">
            ₹{product.price?.toLocaleString("en-IN") || "N/A"}
          </p>
          <span className="product-badge">Pre-loved</span>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;