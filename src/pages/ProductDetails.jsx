import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import "./ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [product, setProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        
        // Try to get from navigation state first (faster)
        if (location.state?.product) {
          let p = location.state.product;
          // Normalize images to ensure array and at least 3 entries
          const placeholder = "https://via.placeholder.com/800?text=No+Image";
          let imgs = Array.isArray(p.images) ? [...p.images] : [];
          if (imgs.length === 0) imgs = [p.image || p.imageUrl || placeholder];
          while (imgs.length < 3) { imgs.push(imgs[0]); }
          
          // Set default values for missing properties
          const normalizedProduct = {
            id: p.id,
            name: p.name || "Product",
            price: p.price || 0,
            category: p.category || "Uncategorized",
            description: p.description || "A great pre-loved item",
            images: imgs,
            condition: p.condition || "Good",
            seller: p.seller || "ThriftBazaar Seller",
            sellerId: p.sellerId || "default",
            rating: p.rating || 4.5,
            reviews: p.reviews || 0,
            year: p.year || "Vintage",
            size: p.size || "One Size",
            isVerified: p.isVerified !== undefined ? p.isVerified : true,
            specifications: Array.isArray(p.specifications) ? p.specifications : [
              { label: "Condition", value: p.condition || "Good" },
              { label: "Size", value: p.size || "One Size" },
              { label: "Material", value: p.material || "Mixed" }
            ]
          };
          
          setProduct(normalizedProduct);
          setLoading(false);
          return;
        }
        
        // Otherwise use sample product
        const sampleProduct = {
          id: id,
          name: "Sample Product",
          price: 1500,
          category: "Fashion",
          description: "A beautiful pre-loved item in great condition",
          condition: "Excellent",
          seller: "ThriftBazaar Seller",
          sellerId: "default",
          rating: 4.5,
          reviews: 45,
          year: "Vintage",
          size: "One Size",
          isVerified: true,
          images: [
            "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1603256245606-60aff6f1af6f?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1541099810657-40a3ad2f6f4b?w=800&h=800&fit=crop",
          ],
          specifications: [
            { label: "Condition", value: "Excellent" },
            { label: "Size", value: "One Size" },
            { label: "Material", value: "100% Cotton" }
          ]
        };
        setProduct(sampleProduct);
      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [id, location.state]);

  if (loading) {
    return (
      <div className="product-details-loading">
        <div className="spinner" />
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-error">
        <h2>Product Not Found</h2>
        <p>Sorry, we couldn't find the product you're looking for.</p>
        <Button variant="primary" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      setShowAuthPrompt(true);
      return;
    }

    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    
    // Check if product already exists in cart
    const existingItem = existingCart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      existingCart.push({
        ...product,
        quantity,
        cartItemId: Date.now(),
      });
    }
    
    localStorage.setItem("cart", JSON.stringify(existingCart));
    alert(`Added ${quantity} item(s) to cart!`);
    navigate("/cart");
  };

  const handleContactSeller = () => {
    navigate(`/contact-seller/${product.sellerId}`, { 
      state: { product, seller: product.seller } 
    });
  };

  // Auth Prompt Modal
  if (showAuthPrompt) {
    return (
      <div className="auth-prompt-overlay">
        <div className="auth-prompt-modal">
          <div className="auth-prompt-icon">🔐</div>
          <h2>Sign In Required</h2>
          <p>Please sign in or create an account to add items to your cart and place orders.</p>
          
          <div className="auth-prompt-buttons">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => navigate("/register")}
            >
              Create Account
            </Button>
          </div>

          <button
            className="auth-prompt-close"
            onClick={() => setShowAuthPrompt(false)}
          >
            ← Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details">
      <button className="back-button" onClick={() => navigate("/")}>
        ← Back to Home
      </button>

      <div className="product-details-container">
        {/* Image Gallery Section */}
        <div className="product-gallery-section">
          <div className="main-image-wrapper animate-fade-in-up">
            <img
              src={product.images[selectedImageIndex]}
              alt={product.name}
              className="main-image"
            />
            <div className="image-badge">{product.condition}</div>
          </div>

          {/* Thumbnail Gallery */}
          <div className="thumbnail-gallery">
            {product.images.map((image, index) => (
              <div
                key={index}
                className={`thumbnail ${selectedImageIndex === index ? "active" : ""}`}
                onMouseEnter={() => setSelectedImageIndex(index)}
                onClick={() => setSelectedImageIndex(index)}
                role="button"
                tabIndex={0}
              >
                <img src={image} alt={`${product.name} ${index + 1}`} />
              </div>
            ))}
          </div>

          {/* Info Cards */}
          <div className="gallery-info-cards">
            <div className="info-card">
              <span className="info-label">Seller</span>
              <span className="info-value">{product.seller}</span>
            </div>
            <div className="info-card">
              <span className="info-label">Year</span>
              <span className="info-value">{product.year}</span>
            </div>
            <div className="info-card">
              <span className="info-label">Size</span>
              <span className="info-value">{product.size}</span>
            </div>
          </div>
        </div>

        {/* Product Info Section */}
        <div className="product-info-section animate-fade-in-up">
          {/* Header */}
          <div className="product-header">
            <span className="category-badge">{product.category}</span>
            <h1>{product.name}</h1>
            <p className="product-description">{product.description}</p>
          </div>

          {/* Rating Section */}
          <div className="info-box rating-box">
            <div className="rating-header">Customer Reviews</div>
            <div className="rating-content">
              <div className="stars">
                {"★".repeat(Math.floor(product.rating || 0))}
              </div>
              <span className="rating-score">{(product.rating || 0).toFixed(1)}/5</span>
              <span className="review-count">({product.reviews || 0} reviews)</span>
            </div>
          </div>

          {/* Price Section */}
          <div className="info-box price-box">
            <div className="price-label">Price</div>
            <h2 className="price">₹{product.price.toLocaleString("en-IN")}</h2>
            <p className="stock-status">✓ In Stock • Pre-loved item</p>
          </div>

          {/* Specifications Section */}
          <div className="info-box specifications-box">
            <div className="box-header">Product Specifications</div>
            <div className="specifications-list">
              {Array.isArray(product.specifications) && product.specifications.map((spec, index) => (
                <div key={index} className="specification-row">
                  <span className="spec-label">{spec.label}</span>
                  <span className="spec-value">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity & Actions */}
          <div className="actions-section">
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <select
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleAddToCart}
            >
              🛒 Add to Cart
            </Button>

            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={handleContactSeller}
            >
              💬 Contact Seller
            </Button>
          </div>

          {/* Seller Info Card */}
          <div className="info-box seller-info-box">
            <div className="box-header">Seller Information</div>
            <div className="seller-card">
              <div className="seller-avatar">👤</div>
              <div className="seller-details">
                <p className="seller-name">{product.seller}</p>
                <p className="seller-meta">Trusted Seller • 98% Positive</p>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          {product.isVerified && (
            <div className="trust-badge-verified">
              <span className="verified-icon">✅</span>
              <span>Verified & Authentic Item</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;