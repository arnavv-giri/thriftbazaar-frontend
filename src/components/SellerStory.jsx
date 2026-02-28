import { motion } from "framer-motion";
import "./SellerStory.css";

function SellerStory(){

  return(

    <section className="seller-story">

      <motion.div
        className="seller-content"
        initial={{opacity:0, x:-80}}
        whileInView={{opacity:1, x:0}}
        transition={{duration:.8}}
        viewport={{once:true}}
      >

        <div className="seller-label">
          FOR SELLERS
        </div>

        <h2>
          Turn Your Closet
          Into Income
        </h2>

        <p>

          Thousands of sellers earn monthly by listing
          unused fashion pieces.

          Join India's growing sustainable fashion economy.

        </p>

      </motion.div>


      <motion.img
        src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1400"
        alt="seller"
        initial={{opacity:0, x:80}}
        whileInView={{opacity:1, x:0}}
        transition={{duration:.8}}
        viewport={{once:true}}
      />

    </section>

  );

}

export default SellerStory;