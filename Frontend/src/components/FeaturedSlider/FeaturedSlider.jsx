import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import Airtel from "../../images/Featured/Airtel.webp";
import Woman from "../../images/Featured/6a45015a0ef2d_23._unstop_ad_448_x_676_pxl_final-05.webp";
import asian from "../../images/Featured/asian-paints-alchemy-2026.webp";
import accenture from "../../images/Featured/Accenture.webp";
import adobe from "../../images/Featured/Adobe.webp";
import unstop from "../../images/Featured/6a4f61ac05926_quizverse_featured_banner.webp";
import { Sparkles, Trophy, Calendar, ArrowRight, CheckCircle2, X } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const features = [
  {
    id: 1,
    title: "Airtel ICreate 2026",
    category: "Case Competition",
    image: Airtel,
    description: "Compete against India's best minds and solve real-world telecom business challenges.",
    prize: "🏆 ₹10,00,000 & PPIs",
    deadline: "15 Aug 2026",
    organizer: "Airtel India"
  },
  {
    id: 2,
    title: "Asian Paints Alchemy 2026",
    category: "Innovation Challenge",
    image: asian,
    description: "Join exclusive webinars, interactive design sessions, and pitch your innovative ideas.",
    prize: "🏆 ₹5,00,000 + Internship",
    deadline: "20 Aug 2026",
    organizer: "Asian Paints"
  },
  {
    id: 3,
    title: "Women Who Master 2026",
    category: "Diversity & Leadership",
    image: Woman,
    description: "Empowering female tech innovators with mentorship, coding challenges, and grants.",
    prize: "🏆 Mentorship & Laptops",
    deadline: "25 Aug 2026",
    organizer: "Logitech"
  },
  {
    id: 4,
    title: "Accenture B-School Challenge",
    category: "B-School Challenge",
    image: accenture,
    description: "Upskill with industry-relevant strategy cases and gain direct PPI interview offers.",
    prize: "🏆 Direct PPI Offers",
    deadline: "30 Aug 2026",
    organizer: "Accenture"
  },
  {
    id: 5,
    title: "Adobe University Hackathon",
    category: "Hackathon",
    image: adobe,
    description: "Build cutting-edge AI & Creative tools in a 48-hour high-impact university hackathon.",
    prize: "🏆 ₹8,00,000 + Adobe Swag",
    deadline: "05 Sep 2026",
    organizer: "Adobe"
  },
  {
    id: 6,
    title: "Oppora Quizverse 2026",
    category: "Daily Quiz Series",
    image: unstop,
    description: "Test your computer science fundamentals, aptitude, and reasoning to win daily rewards.",
    prize: "🏆 Cash Rewards & Badges",
    deadline: "Rolling",
    organizer: "Oppora Team"
  }
];

export default function ExploreSlider() {
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [registeredItems, setRegisteredItems] = useState([]);

  const handleRegisterClick = (item) => {
    setActiveModalItem(item);
  };

  const handleConfirmRegistration = (id) => {
    if (!registeredItems.includes(id)) {
      setRegisteredItems([...registeredItems, id]);
    }
  };

  return (
    <section className="explore-slider-section">
      <div className="section-header">
        <div>
          <div className="slider-badge">
            <Sparkles size={16} />
            <span>Featured Spotlight</span>
          </div>
          <h2>
            Featured <span>Oppora Events</span>
          </h2>
          <p className="slider-subtitle">
            Compete in elite corporate hackathons, case challenges, and win direct hiring offers.
          </p>
        </div>
      </div>

      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={5}
        loop={true}
        speed={600}
        grabCursor={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false
        }}
        breakpoints={{
          320: { slidesPerView: 1.1, spaceBetween: 12 },
          640: { slidesPerView: 2, spaceBetween: 16 },
          900: { slidesPerView: 3, spaceBetween: 18 },
          1200: { slidesPerView: 4.5, spaceBetween: 20 }
        }}
        className="featured-swiper"
      >
        {features.map((item) => {
          const isRegistered = registeredItems.includes(item.id);
          return (
            <SwiperSlide key={item.id}>
              <div className="feature-wrapper-card">
                <div className="image-card">
                  <img src={item.image} alt={item.title} />
                  <span className="category-pill">{item.category}</span>
                  <div className="prize-chip">
                    <Trophy size={13} />
                    <span>{item.prize}</span>
                  </div>
                </div>

                <div className="feature-content">
                  <div className="organizer-row">
                    <Calendar size={13} />
                    <span>Deadline: {item.deadline}</span>
                  </div>

                  <h3>{item.title}</h3>

                  <p>{item.description}</p>

                  <button
                    className={`register-btn ${isRegistered ? "registered" : ""}`}
                    onClick={() => handleRegisterClick(item)}
                  >
                    {isRegistered ? (
                      <>
                        <CheckCircle2 size={15} /> Registered
                      </>
                    ) : (
                      <>
                        Register Now <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Interactive Registration Pop-up Modal */}
      {activeModalItem && (
        <div className="slider-modal-overlay" onClick={() => setActiveModalItem(null)}>
          <div className="slider-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setActiveModalItem(null)}>
              <X size={20} />
            </button>

            <div className="modal-header-img">
              <img src={activeModalItem.image} alt={activeModalItem.title} />
              <span className="modal-category-badge">{activeModalItem.category}</span>
            </div>

            <div className="modal-body">
              <h2>{activeModalItem.title}</h2>
              <p className="modal-organizer">Organized by <strong>{activeModalItem.organizer}</strong></p>

              <p className="modal-desc">{activeModalItem.description}</p>

              <div className="modal-perks">
                <div className="perk-box">
                  <Trophy size={18} className="perk-icon" />
                  <div>
                    <strong>Prizes & Perks</strong>
                    <span>{activeModalItem.prize}</span>
                  </div>
                </div>

                <div className="perk-box">
                  <Calendar size={18} className="perk-icon" />
                  <div>
                    <strong>Registration Closes</strong>
                    <span>{activeModalItem.deadline}</span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                {registeredItems.includes(activeModalItem.id) ? (
                  <div className="registered-success-msg">
                    <CheckCircle2 size={20} /> You are successfully registered for this event!
                  </div>
                ) : (
                  <button
                    className="modal-confirm-btn"
                    onClick={() => handleConfirmRegistration(activeModalItem.id)}
                  >
                    Confirm Free Registration <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}