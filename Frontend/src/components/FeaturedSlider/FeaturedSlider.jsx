import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import Airtel from "../../images/Featured/Airtel.webp"
import Woman from "../../images/Featured/6a45015a0ef2d_23._unstop_ad_448_x_676_pxl_final-05.webp"
import asian from "../../images/Featured/asian-paints-alchemy-2026.webp"
import accenture from "../../images/Featured/Accenture.webp"
import adobe from "../../images/Featured/Adobe.webp"
import unstop from "../../images/Featured/6a4f61ac05926_quizverse_featured_banner.webp"


import "swiper/css";

const features = [
  {
    title: "Airtel ICreate",
    image: Airtel,
    description: "Compete and win exciting prizes.",
  },
  {
    title: "Asian Paints Alchemy 2026",
    image: asian,
    description: "Join webinars and workshops.",
  },
  {
    title: "Women Who Master by logitech",
    image:Woman ,
    description: "Practice with real coding challenges.",
  },
  {
    title: "Accenture B-School Challenge Season 10Accenture",
    image: accenture,
    description: "Upskill with industry-relevant courses.",
  },
  {
    title: "Adobe University Hackathon 2026",
    image: adobe,
    description: "Practice with real coding challenges.",
  },
  {
    title: "Unstop Quizverse 2026",
    image: unstop,
    description: "Improve your resume instantly.",
  },
];

export default function ExploreSlider() {
  return (
    <section className="explore-slider">

      <div className="section-header">
        <h2>
          Explore <span>Oppora</span>
        </h2>
      </div>

      <Swiper

    modules={[Autoplay]}

    spaceBetween={8}

    slidesPerView={5}

    loop={true}

    speed={500}

    grabCursor={true}

    autoplay={{
        delay:1500,
        disableOnInteraction:false,
    }}

    breakpoints={{

        320:{
            slidesPerView:1.2
        },

        640:{
            slidesPerView:2
        },

        900:{
            slidesPerView:3
        },

        1200:{
            slidesPerView:5
        }

    }}

>
        {features.map((item, index) => (
          <SwiperSlide key={index}>

    <div className="feature-wrapper">


        <div className="image-card">

            <img
                src={item.image}
                alt={item.title}
            />

        </div>



        <div className="feature-content">

            <h3>
                {item.title}
            </h3>


            <p>
                {item.description}
            </p>


            <button>
                Register Now →
            </button>

        </div>


    </div>

</SwiperSlide>
        ))}
      </Swiper>

    </section>
  );
}