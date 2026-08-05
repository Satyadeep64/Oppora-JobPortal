import "./Courses.css";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/api";

import HeroSection from "./components/HeroSection";
import SearchBar from "./components/SearchBar";
import CategorySection from "./components/CategorySection";
import CourseCarousel from "./components/CourseCarousel";
import { getAllCourses } from "./CourseServices";

const CoursesPage = () => {

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Stores all courses fetched from the database
  const [allCourses, setAllCourses] = useState([]);

  // Fetch all courses once when the page loads
  useEffect(() => {

    const loadCourses = async () => {

      try {

        const data = await getAllCourses();

        setAllCourses(data);

      } catch (error) {

        console.error("Error loading courses:", error);

      }

    };

    loadCourses();

  }, []);

  // Search & Category API
  useEffect(() => {

    if (search === "" && category === "") {
      setSearchResults([]);
      return;
    }

    const fetchCourses = async () => {

      try {

        setLoading(true);
const response = await fetch(
  `${API_BASE_URL}/api/courses?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`
);

        const data = await response.json();

        setSearchResults(data);

      } catch (error) {

        console.error("Error fetching courses:", error);

      } finally {

        setLoading(false);

      }

    };

    fetchCourses();

  }, [search, category]);

  // Separate homepage rows
  const trendingCourses = allCourses.filter(
    (course) => course.rowName === "Trending"
  );

  const unstopCourses = allCourses.filter(
    (course) => course.rowName === "Unstop"
  );

  const youtubeCourses = allCourses.filter(
    (course) => course.rowName === "YouTube"
  );

  const gfgCourses = allCourses.filter(
    (course) => course.rowName === "GFG"
  );

  return (
    <div className="courses-page">

      <HeroSection />

      <SearchBar
        search={search}
        setSearch={setSearch}
      />

      <CategorySection
        category={category}
        setCategory={setCategory}
        setSearch={setSearch}
      />

      {/* Loading */}

      {loading && (
        <h2 style={{ textAlign: "center", marginTop: "30px" }}>
          Searching...
        </h2>
      )}

      {(search !== "" || category !== "") && (
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <button
            className="clear-filter-btn"
            onClick={() => {
              setSearch("");
              setCategory("");
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Search Results */}

      {!loading && searchResults.length > 0 && (
        <CourseCarousel
          title="🔍 Search Results"
          subtitle={`${searchResults.length} course(s) found`}
          courses={searchResults}
        />
      )}

      {/* No Results */}

      {!loading &&
        (search !== "" || category !== "") &&
        searchResults.length === 0 && (
          <h2 style={{ textAlign: "center", marginTop: "30px" }}>
            No courses found.
          </h2>
        )}

      {/* Homepage */}

      {search === "" && category === "" && (
        <>
          <CourseCarousel
            title="🔥 Trending Courses"
            subtitle="Explore the most popular courses handpicked to boost your skills."
            courses={trendingCourses}
          />

          <CourseCarousel
            title="🏆 Unstop Courses"
            subtitle="Upskill with career-focused courses and industry-ready learning paths."
            courses={unstopCourses}
          />

          <CourseCarousel
            title="📺 YouTube Courses"
            subtitle="Learn from the best YouTube creators."
            courses={youtubeCourses}
          />

          <CourseCarousel
            title="💻 GeeksforGeeks Courses"
            subtitle="Master coding with GeeksforGeeks."
            courses={gfgCourses}
          />
        </>
      )}

    </div>
  );
};

export default CoursesPage;