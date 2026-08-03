import React from "react";
import Hero from "./sections/Hero";
import Preferences from "./sections/Preferences";
import TrendingTests from "./sections/TrendingTests";

const Home = () => {
    return (
        <>
            <Hero />
            <Preferences />
            <TrendingTests />
        </>
    );
};

export default Home;