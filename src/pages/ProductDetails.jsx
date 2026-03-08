import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axios";
import { isLoggedIn, getUserEmail } from "../utils/auth";
import Button from "../components/Button";
import ProductReviews from "../components/ProductReviews";
import "./ProductDetails.css";

function ProductDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`);
      const p = res.data;

      const images =
        Array.isArray(p.images) && p.images.length > 0
          ? p.images
          : ["https://via.placeholder.com/700"];

      setProduct({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        size: p.size,
        condition: p.condition,
        stock: p.stock,
        seller: p.storeName,
        vendorId: p.vendorId,
        vendorUserId: p.vendorUserId,   // User ID of the vendor, needed for messaging
        images,
      });
    } catch (err) {
      console.error("Failed to load product:", err);
    } finally {
      setLoading(false);
    }
  };

  // ADD TO CART — uses consistent "cart" key in localStorage
  const handleAddToCart = () => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    const email = getUserEmail();
    const cartKey = `cart_${email}`;

    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity = Math.min(
        existing.quantity + quantity,
        product.stock
      );
    } else {
      cart.push({ ...product, quantity });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // CONTACT SELLER
  const handleContactSeller = () => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    navigate(`/contact-seller/${product.vendorUserId}`, {
      state: {
        productId:   product.id,
        sellerEmail: product.seller,   // store name used as display label
        product,
      },
    });
  };

  if (loading) {
    return <div className="pd-loading">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="pd-loading">
        <p>Product not found or unavailable.</p>
        <Button onClick={() => navigate("/shop")}>Back to Shop</Button>
      </div>
    );
  }

  return (
    <div className="pd">
      <button className="pd-back" onClick={() => navigate("/shop")}>
        ← Back to Shop
      </button>

      <div className="pd-container">
        {/* LEFT — Images */}
        <div className="pd-left">
          <div className="pd-main">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
            />
            <div className="pd-condition">{product.condition}</div>
          </div>

          {product.images.length > 1 && (
            <div className="pd-thumbs">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className={selectedImage === i ? "active" : ""}
                  onClick={() => setSelectedImage(i)}
                  alt={`View ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Details */}
        <div className="pd-right">
          <div className="pd-category">{product.category}</div>

          <h1>{product.name}</h1>

          <div className="pd-price">₹{product.price.toLocaleString("en-IN")}</div>

          <div className="pd-quantity">
            <label>Quantity</label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            >
              {Array.from(
                { length: Math.min(5, product.stock) },
                (_, i) => i + 1
              ).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {product.stock === 0 && (
            <p style={{ color: "red", fontWeight: 600 }}>Out of Stock</p>
          )}

          <Button
            variant="primary"
            className="pd-full-btn"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {addedToCart ? "✓ ADDED TO CART" : "ADD TO CART"}
          </Button>

          <Button
            variant="secondary"
            className="pd-full-btn"
            onClick={handleContactSeller}
          >
            CONTACT {product.seller?.toUpperCase()}
          </Button>

          <div className="pd-meta pd-meta-right">
            <div>
              <span>Seller</span>
              <strong>{product.seller}</strong>
            </div>
            <div>
              <span>Size</span>
              <strong>{product.size}</strong>
            </div>
            <div>
              <span>Condition</span>
              <strong>{product.condition}</strong>
            </div>
            <div>
              <span>Stock</span>
              <strong>{product.stock} left</strong>
            </div>
          </div>

          <div className="pd-seller-card">
            <div className="avatar">👤</div>
            <div>
              <strong>{product.seller}</strong>
              <div>Verified ThriftBazaar Seller</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── REVIEWS ───────────────────────────────────────────────────── */}
      <ProductReviews productId={Number(id)} />
    </div>
  );
}

export default ProductDetails;
