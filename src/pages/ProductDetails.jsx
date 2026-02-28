import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axios";
import { isLoggedIn, getUserEmail } from "../utils/auth";
import Button from "../components/Button";
import "./ProductDetails.css";

function ProductDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [product,setProduct] = useState(null);
  const [selectedImage,setSelectedImage] = useState(0);
  const [quantity,setQuantity] = useState(1);
  const [loading,setLoading] = useState(true);


  useEffect(()=>{

    loadProduct();

  },[id]);


  const loadProduct = async ()=>{

    try{

      setLoading(true);

      const res =
        await api.get(`/products/${id}`);

      const p = res.data;

      const images =
        p.images?.length
        ? p.images
        : ["https://via.placeholder.com/700"];

      setProduct({

        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        size: p.size,
        condition: p.condition,
        seller: p.storeName,
        vendorId: p.vendorId,
        images

      });

    }
    catch(err){

      console.error(err);

    }
    finally{

      setLoading(false);

    }

  };


  /*
  ADD TO CART
  */

  const handleAddToCart = ()=>{

    if(!isLoggedIn()){

      navigate("/login");
      return;

    }

    const email =
      getUserEmail();

    const key =
      `cart_${email}`;

    const cart =
      JSON.parse(
        localStorage.getItem(key)
      ) || [];

    const existing =
      cart.find(
        item=>item.id===product.id
      );

    if(existing){

      existing.quantity += quantity;

    }
    else{

      cart.push({
        ...product,
        quantity
      });

    }

    localStorage.setItem(
      key,
      JSON.stringify(cart)
    );

    alert("Added to cart");

  };


  /*
  CONTACT SELLER
  */

  const handleContactSeller = ()=>{

    if(!isLoggedIn()){

      navigate("/login");
      return;

    }

    navigate(
      `/contact-seller/${product.vendorId}`,
      {
        state:{
          productId:product.id,
          seller:product.seller
        }
      }
    );

  };


  /*
  STATES
  */

  if(loading)
    return (
      <div className="pd-loading">
        Loading...
      </div>
    );


  if(!product)
    return (
      <div>
        Product not found
      </div>
    );


  /*
  UI
  */

  return (

    <div className="pd">


      <button
        className="pd-back"
        onClick={()=>navigate("/shop")}
      >
        ← Back to Shop
      </button>



      <div className="pd-container">


        {/* LEFT */}

        <div className="pd-left">


          <div className="pd-main">

            <img
              src={
                product.images[selectedImage]
              }
              alt={product.name}
            />

            <div className="pd-condition">
              {product.condition}
            </div>

          </div>


          <div className="pd-thumbs">

            {product.images.map((img,i)=>(
              <img
                key={i}
                src={img}
                className={
                  selectedImage===i
                  ? "active"
                  : ""
                }
                onClick={()=>
                  setSelectedImage(i)
                }
              />
            ))}

          </div>


        </div>



        {/* RIGHT */}

        <div className="pd-right">


          <div className="pd-category">
            {product.category}
          </div>


          <h1>
            {product.name}
          </h1>


          <div className="pd-price">
            ₹{product.price}
          </div>


          <div className="pd-quantity">

            <label>
              Quantity
            </label>

            <select
              value={quantity}
              onChange={(e)=>
                setQuantity(
                  Number(e.target.value)
                )
              }
            >

              {[1,2,3,4,5].map(n=>(
                <option key={n}>
                  {n}
                </option>
              ))}

            </select>

          </div>


          {/* FULL WIDTH BUTTONS */}

          <Button
            variant="primary"
            className="pd-full-btn"
            onClick={handleAddToCart}
          >
            ADD TO CART
          </Button>


          <Button
            variant="secondary"
            className="pd-full-btn"
            onClick={handleContactSeller}
          >
            CONTACT {product.seller}
          </Button>



          {/* PRODUCT META BELOW CONTACT SELLER */}

          <div className="pd-meta pd-meta-right">

            <div>
              <span>Seller</span>
              <strong>
                {product.seller}
              </strong>
            </div>

            <div>
              <span>Size</span>
              <strong>
                {product.size}
              </strong>
            </div>

            <div>
              <span>Condition</span>
              <strong>
                {product.condition}
              </strong>
            </div>

          </div>



          {/* SELLER CARD */}

          <div className="pd-seller-card">

            <div className="avatar">
              👤
            </div>

            <div>

              <strong>
                {product.seller}
              </strong>

              <div>
                Verified ThriftBazaar Seller
              </div>

            </div>

          </div>


        </div>


      </div>


    </div>

  );

}

export default ProductDetails;