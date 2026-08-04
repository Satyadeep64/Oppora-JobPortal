const HeaderImage = "/images/Header2.jpg";

const HeroSection = () => {
  return (
    <section className="course-hero">

      <div className="hero-content">
        <h1>
          Online Courses <span>with Certificates</span>
        </h1>

        <p>
          Learn from the best free resources including YouTube,
          GeeksforGeeks, freeCodeCamp, Microsoft Learn and more.
        </p>
      </div>

      <div className="hero-image">
        <img src={HeaderImage} alt="Learning" />
      </div>

    </section>
  );
};

export default HeroSection;