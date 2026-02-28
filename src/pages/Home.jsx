import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";
import ProductCard from "../components/ProductCard";
import Button from "../components/Button";
import { getUserRole } from "../utils/auth";
import "./Home.css";
import AboutSection from "../components/AboutSection";
import ReviewsSection from "../components/ReviewsSection";
import SellerStory from "../components/SellerStory";

function Home() {

  const navigate = useNavigate();

  const role = getUserRole();

  const [products,setProducts]=useState([]);
  const [loading,setLoading]=useState(true);


  useEffect(()=>{

    loadProducts();

  },[]);


  const loadProducts = async ()=>{

    try{

      const res =
        await api.get("/products");

      setProducts(res.data);

    }
    catch{

      setProducts([]);

    }
    finally{

      setLoading(false);

    }

  };


  const scrollToProducts = ()=>{

    document
      .getElementById("products")
      ?.scrollIntoView({
        behavior:"smooth"
      });

  };


  return (

    <div className="home">


      {/* HERO */}

      <section className="hero">


        {/* background image */}

        <img
          className="hero-bg"
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000"
        />


        {/* overlay */}

        <div className="hero-overlay"/>


        {/* center content */}

        <div className="hero-center">

          <h1 className="brand">

            THRIFTBAZAAR

          </h1>


          <p className="tagline">

            PRE-LOVED. REDEFINED.

          </p>


          <Button
            variant="primary"
            size="lg"
            onClick={scrollToProducts}
          >

            EXPLORE

          </Button>


        </div>


        {/* scroll indicator */}

        <div className="scroll-indicator">

          SCROLL

        </div>


      </section>



      {/* PRODUCTS */}

      <section
        id="products"
        className="products"
      >

        <h2 className="section-title">

          Latest Drops

        </h2>


        {loading ?

          <p>Loading...</p>

          :

          <div className="product-grid">

            {products.map(product=>(
              
              <ProductCard
                key={product.id}
                product={product}
                onClick={()=>
                  navigate(
                    `/product/${product.id}`,
                    {state:{product}}
                  )
                }
              />

            ))}

          </div>

        }

      </section>



      {/* SELL CTA */}

      <section className="sell-section">

        <h2>

          Turn Your Closet Into Cash

        </h2>

        <Button
          onClick={()=>

            role==="VENDOR"

              ?
              navigate("/vendor/dashboard")

              :
              navigate("/register")

          }
        >

          {role==="VENDOR"
            ?
            "Go to Dashboard"
            :
            "Start Selling"
          }

        </Button>

      </section>
      <AboutSection />
      <ReviewsSection />

<SellerStory />


    </div>
    

  );

}

export default Home;