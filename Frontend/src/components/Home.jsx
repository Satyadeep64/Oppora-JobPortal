import Hero from "./section1/Hero";
import Opportunities from "./Opportunities";
import FeaturedData from "./FeaturedSlider/FeaturedSlider"
import Stats from "./PlatformStats"
import Ai from "./AiTools/Aitool"
const Home = () => {
  return(
    <>


    <div>
      <Hero />
      <FeaturedData />
      <Opportunities/>
      <Ai/>
      <Stats/>
      
      </div>
    </>
  )
}

export default Home;