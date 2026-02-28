import { useState } from "react";
import api from "../utils/axios";
import Button from "./Button";

function AddProductModal({ onClose, onAdd }) {

  const [name,setName]=useState("");
  const [price,setPrice]=useState("");
  const [stock,setStock]=useState(1);
  const [category,setCategory]=useState("TSHIRTS");

  const [condition,setCondition]=useState("GOOD");
  const [size,setSize]=useState("M");

  const [file,setFile]=useState(null);

  const [loading,setLoading]=useState(false);


  const handleSubmit = async (e) => {

    e.preventDefault();

    try{

      setLoading(true);

      let imageUrl=null;

      if(file){

        const formData=new FormData();

        formData.append("file",file);

        const res=await api.post("/upload",formData);

        imageUrl=res.data.url;

      }


      await onAdd({

        name,
        price:Number(price),
        stock:Number(stock),
        category,

        condition,
        size,

        imageUrls:imageUrl?[imageUrl]:[]

      });

      onClose();

    }
    catch(err){

      console.error(err.response?.data||err);

      alert("Upload failed");

    }
    finally{

      setLoading(false);

    }

  };


  return(

    <div className="modal-overlay">

      <div className="modal-content">

        <h2>Add Product</h2>

        <form onSubmit={handleSubmit}>

          <input
            placeholder="Name"
            value={name}
            onChange={e=>setName(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={e=>setPrice(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={e=>setStock(e.target.value)}
          />


          <select
  value={category}
  onChange={e=>setCategory(e.target.value)}
>

  <option value="TSHIRTS">
    T-Shirts
  </option>

  <option value="SHIRTS">
    Shirts
  </option>

  <option value="JEANS">
    Jeans
  </option>

  <option value="JACKETS">
    Jackets
  </option>

  <option value="DRESSES">
    Dresses
  </option>

  <option value="ACCESSORIES">
    Accessories
  </option>

  <option value="SHOES">
    Shoes
  </option>

  <option value="HOODIES">
    Hoodies
  </option>

  <option value="SWEATERS">
    Sweaters
  </option>

</select>


          <select value={condition} onChange={e=>setCondition(e.target.value)}>
            <option value="EXCELLENT">Excellent</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
          </select>


          <select value={size} onChange={e=>setSize(e.target.value)}>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>


          <input
            type="file"
            accept="image/*"
            onChange={e=>setFile(e.target.files[0])}
          />


          <Button type="submit" loading={loading}>
            Add Product
          </Button>

          <Button type="button" onClick={onClose}>
            Cancel
          </Button>

        </form>

      </div>

    </div>

  );

}

export default AddProductModal;