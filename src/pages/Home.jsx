import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";
import ProductCard from "../components/ProductCard";
import Button from "../components/Button";
import "./Home.css";

// Enhanced sample products with variety
const sampleProducts = [
  {
    id: "s1",
    name: "Vintage Blue Denim Jeans",
    price: 1832,
    category: "JEANS",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop",
  },
  {
    id: "s2",
    name: "Classic Cotton Button-Up",
    price: 1842,
    category: "SHIRTS",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=500&fit=crop",
  },
  {
    id: "s3",
    name: "Premium Leather Jacket",
    price: 2685,
    category: "JACKETS",
    image: "https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=500&h=500&fit=crop",
  },
  {
    id: "s4",
    name: "Striped Casual Tee",
    price: 1214,
    category: "TSHIRTS",
    image: "https://images.unsplash.com/photo-1583743814966-8936f37f4c84?w=500&h=500&fit=crop",
  },
  {
    id: "s5",
    name: "Black Summer Dress",
    price: 2145,
    category: "DRESSES",
    image: "https://images.unsplash.com/photo-1572804419417-3346167ba528?w=500&h=500&fit=crop",
  },
  {
    id: "s6",
    name: "Elegant Trench Coat",
    price: 3299,
    category: "JACKETS",
    image: "https://images.unsplash.com/photo-1539533057440-7d8f3f76fbf5?w=500&h=500&fit=crop",
  },
  {
    id: "s7",
    name: "Floral Print Blouse",
    price: 1549,
    category: "SHIRTS",
    image: "https://images.unsplash.com/photo-1589537279146-0d3a19be2e07?w=500&h=500&fit=crop",
  },
  {
    id: "s8",
    name: "White Linen Pants",
    price: 1799,
    category: "JEANS",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop",
  },
];

const categories = [
  { name: "T-Shirts", icon: "👕", count: 328 },
  { name: "Jeans", icon: "👖", count: 215 },
  { name: "Dresses", icon: "👗", count: 456 },
  { name: "Jackets", icon: "🧥", count: 189 },
  { name: "Shoes", icon: "👞", count: 342 },
  { name: "Accessories", icon: "👜", count: 587 },
];

const testimonials = [
  {
    name: "Ayush Rana",
    role: "Fashion Enthusiast",
    text: "ThriftBazaar has completely changed how I shop! I find amazing vintage pieces at unbeatable prices.",
    rating: 5,
  },
  {
    name: "Arnav Giri",
    role: "Seller",
    text: "Selling on ThriftBazaar is so easy. Their platform is intuitive and I've made great sales.",
    rating: 5,
  },
  {
    name: "Vansh",
    role: "Sustainability Advocate",
    text: "Finally, a platform that makes sustainable fashion accessible and affordable for everyone!",
    rating: 5,
  },
];

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/products");
      
      if (res.data && res.data.length > 0) {
        // Mix backend products with sample for better showcase
        const combinedProducts = [
          ...res.data.slice(0, 4),
          ...sampleProducts.slice(0, 4),
        ];
        setProducts(combinedProducts);
      } else {
        setProducts(sampleProducts);
      }
    } catch (err) {
      console.error("Error loading products:", err);
      setProducts(sampleProducts);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  const scrollToProducts = () => {
    const element = document.getElementById("products");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="home">
      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        <div className="hero-text">
          <h1 className="animate-slide-in-left">
            Discover Your
            <br />
            <span>Perfect Piece</span>
          </h1>

          <p className="subtitle animate-slide-in-left">
            Explore India's finest collection of pre-loved, vintage, and sustainable fashion. 
            Find unique styles at prices that make you smile.
          </p>

          <div className="buttons">
            <Button
              variant="primary"
              size="lg"
              onClick={scrollToProducts}
            >
              Browse Products →
            </Button>
          </div>
        </div>

        <img
          className="hero-image"
          src="https://images.unsplash.com/photo-1520975916090-3105956dac38?w=600&h=600&fit=crop"
          alt="Fashion showcase"
        />
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="stats-showcase">
        <div className="stats-container">
          <div className="stat-item animate-fade-in-up stagger-1">
            <div className="stat-number">52K+</div>
            <div className="stat-label">Active Products</div>
          </div>
          <div className="stat-item animate-fade-in-up stagger-2">
            <div className="stat-number">18K+</div>
            <div className="stat-label">Happy Sellers</div>
          </div>
          <div className="stat-item animate-fade-in-up stagger-3">
            <div className="stat-number">145K+</div>
            <div className="stat-label">Community Members</div>
          </div>
          <div className="stat-item animate-fade-in-up stagger-4">
            <div className="stat-number">₹2.5Cr+</div>
            <div className="stat-label">Transactions</div>
          </div>
        </div>
      </section>

      {/* ===== FEATURED CATEGORIES ===== */}
      <section className="featured-categories">
        <div className="categories-container">
          <div className="section-header">
            <h2>What Are You Looking For?</h2>
          </div>

          <div className="categories-grid">
            {categories.map((category, index) => (
              <div
                key={category.name}
                className={`category-card stagger-${index + 1}`}
                onClick={() => {
                  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
                }}
              >
                <div className="category-icon">{category.icon}</div>
                <div className="category-name">{category.name}</div>
                <div className="category-count">{category.count} items</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRODUCTS SECTION ===== */}
      <section id="products" className="products">
        <div className="section-header">
          <h2>Trending Now</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading amazing fashion pieces...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>No products available at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product, index) => (
              <div
                key={product.id}
                className={`product-card-wrapper stagger-${(index % 8) + 1}`}
              >
                <ProductCard
                  product={product}
                  onClick={() => handleProductClick(product)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== TESTIMONIALS SECTION ===== */}
      <section className="testimonials">
        <div className="section-header">
          <h2>What Our Community Says</h2>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className={`testimonial-card stagger-${index + 1}`}
            >
              <div className="testimonial-stars">
                {"★".repeat(testimonial.rating)}
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-author">{testimonial.name}</div>
              <div className="testimonial-role">{testimonial.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SELLER CTA SECTION ===== */}
      <section className="seller-cta">
        <div className="seller-content">
          <h2>
            Turn Your Closet Into <span>Cash</span>
          </h2>
          <p>
            Sell your pre-loved fashion items to thousands of eager buyers.
            It's easy, secure, and rewarding. Join our seller community today!
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate("/register")}
          >
            Start Selling Today →
          </Button>
        </div>
      </section>
    </div>
  );
}

export default Home;