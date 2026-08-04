import React from "react";
import heroImage from "../sections/CHead3.jpg";

const Hero = () => {

    const scrollToPreferences = () => {
        const section = document.getElementById("preferences-section");

        if (section) {
            section.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    return (
        <section className="mocktest-hero">

            <div className="hero-left">

                <span className="hero-tag">
                    AI Powered Mock Tests
                </span>

                <h1>
                    Practice Smarter with
                    <span> Personalized Mock Tests</span>
                </h1>

                <p>
                    Create customized mock tests based on your preferred topics,
                    difficulty level, duration, and question type. Receive
                    instant feedback, detailed explanations, and improve your
                    performance with AI-generated assessments.
                </p>

                <div className="hero-buttons">

                    <button
                        className="primary-btn"
                        onClick={scrollToPreferences}
                    >
                        Generate Test
                    </button>

                    <button
                        className="secondary-btn"
                        onClick={() =>
                            document
                                .getElementById("trending-tests")
                                ?.scrollIntoView({
                                    behavior: "smooth",
                                })
                        }
                    >
                        Explore Trending
                    </button>

                </div>

            </div>

            <div className="hero-right">

                <img
                    src={heroImage}
                    alt="Mock Test Hero"
                />
            </div>

        </section>
    );
};

export default Hero;