import { useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const CARD_WIDTH = 260;
const CARD_GAP = 22;

// Number of FULL cards visible
const FULL_VISIBLE_CARDS = 3;

const SCROLL_AMOUNT =
    (CARD_WIDTH + CARD_GAP) * FULL_VISIBLE_CARDS;

const CourseCarousel = ({ title, subtitle, courses }) => {
    const sliderRef = useRef(null);

    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);

    const updateButtons = () => {
        const slider = sliderRef.current;

        if (!slider) return;

        setShowLeft(slider.scrollLeft > 10);

        setShowRight(
            slider.scrollLeft + slider.clientWidth <
            slider.scrollWidth - 10
        );
    };

    const scrollRight = () => {
        sliderRef.current.scrollBy({
            left: SCROLL_AMOUNT,
            behavior: "smooth",
        });

        setTimeout(updateButtons, 400);
    };

    const scrollLeft = () => {
        sliderRef.current.scrollBy({
            left: -SCROLL_AMOUNT,
            behavior: "smooth",
        });

        setTimeout(updateButtons, 400);
    };

    return (
        <section className="course-carousel-section">
            <div className="course-carousel-header">
                <h2>{title}</h2>

                <p>{subtitle}</p>
            </div>

            <div className="course-carousel-wrapper">
                <div className="arrow-space">
                    {showLeft && (
                        <button
                            className="slider-btn"
                            onClick={scrollLeft}
                        >
                            <FaChevronLeft />
                        </button>
                    )}
                </div>

                <div
                    className="course-carousel-slider"
                    ref={sliderRef}
                    onScroll={updateButtons}
                >
                    {courses.map((course) => (
                        <div
                            className="course-card"
                            key={course.id}
                        >
                            <img
                                src={course.image}
                                alt={course.title}
                                className="course-card-image"
                            />

                            <div className="course-card-body">
                                <h3>{course.title}</h3>

                                <p>{course.skills}</p>

                                <a
                                    href={course.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="view-course-btn"
                                >
                                    <span>View Course</span>

                                    <span>↗</span>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="arrow-space">
                    {showRight && (
                        <button
                            className="slider-btn"
                            onClick={scrollRight}
                        >
                            <FaChevronRight />
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CourseCarousel;