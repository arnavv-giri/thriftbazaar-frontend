import AboutSection from "../components/AboutSection";
import "./About.css";

function About() {

  return (

    <div className="about-page">

      {/* HERO */}
      <section className="about-hero">

        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600"
          className="about-hero-bg"
        />

        <div className="about-hero-overlay"/>

        <div className="about-hero-center">

          <h1>
            ABOUT THRIFTBAZAAR
          </h1>

          <p>
            Where timeless fashion meets conscious living.
          </p>

        </div>

      </section>


      {/* STORY SECTION */}
      <AboutSection/>


      {/* VALUES */}
      <section className="about-values">

        <div className="value">

          <h3>Curated Quality</h3>

          <p>
            Every piece is carefully selected.
          </p>

        </div>


        <div className="value">

          <h3>Sustainable Future</h3>

          <p>
            Reducing waste through circular fashion.
          </p>

        </div>


        <div className="value">

          <h3>Trusted Sellers</h3>

          <p>
            Verified vendors ensure authenticity.
          </p>

        </div>

      </section>

    </div>

  );

}

export default About;