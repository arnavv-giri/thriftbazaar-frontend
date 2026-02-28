import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";
import ProductCard from "../components/ProductCard";
import "./Shop.css";


const categories = [
  "ALL",
  "TSHIRTS",
  "SHIRTS",
  "JEANS",
  "JACKETS",
  "DRESSES",
  "ACCESSORIES"
];


function Shop() {

  const navigate = useNavigate();

  const [products,setProducts] = useState([]);

  const [loading,setLoading] = useState(true);

  const [selectedCategory,setSelectedCategory] =
    useState("ALL");

  const [minPrice,setMinPrice] = useState("");

  const [maxPrice,setMaxPrice] = useState("");


  useEffect(()=>{

    loadProducts();

  },[selectedCategory,minPrice,maxPrice]);


  const loadProducts = async ()=>{

    try{

      setLoading(true);

      const params = {};

      if(selectedCategory !== "ALL")
        params.category = selectedCategory;

      if(minPrice)
        params.minPrice = minPrice;

      if(maxPrice)
        params.maxPrice = maxPrice;


      const res =
        await api.get("/products",{params});


      setProducts(res.data);

    }
    catch(err){

      console.error(err);

    }
    finally{

      setLoading(false);

    }

  };


  return(

    <div className="shop">


      {/* SIDEBAR */}

      <aside className="shop-sidebar">

        <h3 className="filter-title">
          CATEGORY
        </h3>

        {categories.map(cat=>(

          <div
            key={cat}

            className={
              selectedCategory===cat
              ?
              "filter active"
              :
              "filter"
            }

            onClick={()=>
              setSelectedCategory(cat)
            }
          >

            {cat}

          </div>

        ))}


        <h3 className="filter-title">
          PRICE
        </h3>

        <input
          className="price-input"
          placeholder="Min ₹"
          type="number"
          value={minPrice}
          onChange={e=>
            setMinPrice(e.target.value)
          }
        />


        <input
          className="price-input"
          placeholder="Max ₹"
          type="number"
          value={maxPrice}
          onChange={e=>
            setMaxPrice(e.target.value)
          }
        />


        {(minPrice || maxPrice) && (

          <button
            className="clear-btn"
            onClick={()=>{
              setMinPrice("");
              setMaxPrice("");
            }}
          >

            CLEAR FILTER

          </button>

        )}

      </aside>



      {/* PRODUCTS */}

      <main className="shop-products">

        <div className="shop-header">

          <h1>
            SHOP
          </h1>

          <div className="product-count">

            {products.length}
            {" "}
            PRODUCTS

          </div>

        </div>



        {loading
          ?
          <div className="loading">

            Loading products...

          </div>
          :
          products.length === 0
          ?
          <div className="empty">

            No products found

          </div>
          :
          <div className="product-grid">

            {products.map(p=>(

              <ProductCard
                key={p.id}

                product={p}

                onClick={()=>
                  navigate(
                    `/product/${p.id}`
                  )
                }

              />

            ))}

          </div>
        }

      </main>


    </div>

  );

}

export default Shop;