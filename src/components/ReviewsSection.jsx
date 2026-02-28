import { motion } from "framer-motion";
import "./ReviewsSection.css";

const reviews = [

  {
    name: "Ayush Rana",
    role: "Buyer",
    text:
      "The quality exceeded expectations. It feels like shopping luxury, sustainably.",
  },

  {
    name: "Vansh Sharma",
    role: "Seller",
    text:
      "I made ₹18,000 selling clothes I never wore. The platform is incredibly smooth.",
  },

  {
    name: "Arnav Mehta",
    role: "Customer",
    text:
      "Clean interface, trusted sellers, and amazing pieces you won't find elsewhere.",
  },

];

function ReviewsSection() {

  return (

    <section className="reviews">

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >

        <div className="reviews-label">
          COMMUNITY
        </div>

        <h2>
          Trusted by Fashion Lovers
        </h2>

      </motion.div>


      <div className="reviews-grid">

        {reviews.map((review, index) => (

          <motion.div
            key={index}
            className="review-card"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            viewport={{ once: true }}
          >

            <p>
              "{review.text}"
            </p>

            <div className="review-user">

              <strong>
                {review.name}
              </strong>

              <span>
                {review.role}
              </span>

            </div>

          </motion.div>

        ))}

      </div>

    </section>

  );

}

export default ReviewsSection;