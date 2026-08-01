import Hero from "./section1/Hero";
import Opportunities from "./Opportunities";
import FeaturedData from "./FeaturedSlider/FeaturedSlider";
import Stats from "./PlatformStats";
import Ai from "./AiTools/Aitool";
import "../styles/homeRedesign.css";

const Home = () => {
  return (
    <div className="home-container">
      <Hero />
      <FeaturedData />
      <Opportunities />
      <Ai />
      <Stats />
    </div>
  );
};

export default Home;