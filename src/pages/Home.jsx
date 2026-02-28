import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";
import ProductCard from "../components/ProductCard";
import Button from "../components/Button";
import { getUserRole } from "../utils/auth"; // ✅ added
import "./Home.css";

// Sample products
const sampleProducts = [
  {
    id: "s1",
    name: "Vintage Blue Denim Jeans",
    price: 1832,
    category: "JEANS",
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop",
  },
  {
    id: "s2",
    name: "Classic Cotton Button-Up",
    price: 1842,
    category: "SHIRTS",
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=500&fit=crop",
  },
  {
    id: "s3",
    name: "Premium Leather Jacket",
    price: 2685,
    category: "JACKETS",
    image:
      "https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=500&h=500&fit=crop",
  },
  {
    id: "s4",
    name: "Striped Casual Tee",
    price: 1214,
    category: "TSHIRTS",
    image:
      "https://images.unsplash.com/photo-1583743814966-8936f37f4c84?w=500&h=500&fit=crop",
  },
  {
    id: "s5",
    name: "Black Summer Dress",
    price: 2145,
    category: "DRESSES",
    image:
      "https://images.unsplash.com/photo-1572804419417-3346167ba528?w=500&h=500&fit=crop",
  },
  {
    id: "s6",
    name: "Elegant Trench Coat",
    price: 3299,
    category: "JACKETS",
    image:
      "https://images.unsplash.com/photo-1539533057440-7d8f3f76fbf5?w=500&h=500&fit=crop",
  },
  {
    id: "s7",
    name: "Floral Print Blouse",
    price: 1549,
    category: "SHIRTS",
    image:
      "https://images.unsplash.com/photo-1589537279146-0d3a19be2e07?w=500&h=500&fit=crop",
  },
  {
    id: "s8",
    name: "White Linen Pants",
    price: 1799,
    category: "JEANS",
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop",
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
    text: "ThriftBazaar has completely changed how I shop!",
    rating: 5,
  },
  {
    name: "Arnav Giri",
    role: "Seller",
    text: "Selling on ThriftBazaar is so easy.",
    rating: 5,
  },
  {
    name: "Vansh",
    role: "Sustainability Advocate",
    text: "Amazing sustainable fashion platform.",
    rating: 5,
  },
];

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const role = getUserRole(); // ✅ detect role

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get("/products");

      if (res.data?.length) {
        setProducts([
          ...res.data.slice(0, 4),
          ...sampleProducts.slice(0, 4),
        ]);
      } else {
        setProducts(sampleProducts);
      }
    } catch (err) {
      console.error(err);
      setProducts(sampleProducts);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  const scrollToProducts = () => {
    document
      .getElementById("products")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="home">

      {/* HERO */}
      <section className="hero">
        <div className="hero-text">

          <h1>
            Discover Your <span>Perfect Piece</span>
          </h1>

          <p className="subtitle">
            Buy and sell pre-loved fashion easily.
          </p>

          <Button
            variant="primary"
            size="lg"
            onClick={scrollToProducts}
          >
            Browse Products →
          </Button>

        </div>

        <img
          className="hero-image"
          src="https://images.unsplash.com/photo-1520975916090-3105956dac38?w=600"
          alt="Fashion"
        />

      </section>


      {/* PRODUCTS */}
      <section id="products" className="products">

        <h2>Trending Now</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="product-grid">

            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() =>
                  handleProductClick(product)
                }
              />
            ))}

          </div>
        )}

      </section>


      {/* SELLER CTA */}
      <section className="seller-cta">

        <h2>
          Turn Your Closet Into Cash
        </h2>

        <p>
          Join ThriftBazaar and sell your fashion items.
        </p>

        {/* ✅ role-based button */}
        <Button
          variant="primary"
          size="lg"
          onClick={() =>
            role === "VENDOR"
              ? navigate("/dashboard")
              : navigate("/register")
          }
        >
          {role === "VENDOR"
            ? "Go to Vendor Dashboard →"
            : "Start Selling Today →"}
        </Button>

      </section>


      {/* TESTIMONIALS */}
      <section className="testimonials">

        <h2>
          What Our Community Says
        </h2>

        <div className="testimonials-grid">

          {testimonials.map((t) => (
            <div key={t.name}>

              <p>"{t.text}"</p>

              <strong>{t.name}</strong>

              <div>{t.role}</div>

            </div>
          ))}

        </div>

      </section>

    </div>
  );
}

export default Home;