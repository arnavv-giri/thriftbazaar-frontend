import "./AboutSection.css";

function AboutSection() {

  return (

    <section className="about">

      {/* LEFT IMAGE */}
      <div className="about-image">

        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900"
          alt="fashion"
        />

      </div>


      {/* RIGHT CONTENT */}
      <div className="about-content">

        <div className="about-label">
          OUR STORY
        </div>

        <h2>
          Redefining Fashion.
          <br/>
          Responsibly.
        </h2>

        <p>

          ThriftBazaar is a curated marketplace for
          modern pre-loved fashion.

          We connect conscious buyers with trusted
          sellers, extending the life of quality pieces
          while reducing waste.

        </p>

        <p>

          Every item listed is part of a movement —
          toward sustainable, accessible, and timeless fashion.

        </p>

      </div>

    </section>

  );

}

export default AboutSection;