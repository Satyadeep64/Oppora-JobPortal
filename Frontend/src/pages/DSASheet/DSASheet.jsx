import "./DSASheet.css";
import { dsaSheet } from "../../data";
import PatternCard from "../../components/DSA/PatternCard";
import { useState } from "react";
import { Brain } from "lucide-react";

const DSASheet = () => {

    const [search, setSearch] = useState("");

    const filteredPatterns = dsaSheet.filter((pattern) => {

  const searchText = search.toLowerCase();

  const patternMatch = pattern.pattern
    .toLowerCase()
    .includes(searchText);

  const questionMatch = pattern.questions.some((question) =>
    question.title.toLowerCase().includes(searchText)
  );

  return patternMatch || questionMatch;

});

    return (

        <div className="dsa-page">

           <div className="dsa-hero">

    <div className="hero-content">

        <h1>DSA Sheet</h1>

        <p>
            Master coding interview patterns with carefully selected
            LeetCode and GeeksforGeeks problems.
        </p>

    </div>

    <div className="hero-icon">

      <Brain />

    </div>

</div>

            <div className="sheet-toolbar">

   <div className="sheet-header">

 <h2>
    <span>{dsaSheet.length}</span> Patterns Available
</h2>

  <div className="sheet-search">

    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>

    <input
  type="text"
  placeholder="Search patterns or questions..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>

  </div>

</div>

</div>

<div className="pattern-grid">

  {filteredPatterns.length > 0 ? (

    filteredPatterns.map((pattern) => (
      <PatternCard
        key={pattern.id}
        pattern={pattern}
      />
    ))

  ) : (

    <div className="empty-search">

      <div className="empty-icon">🔍</div>

      <h3>No matching patterns found</h3>

      <p>
        We couldn't find any pattern or interview question matching
        <strong> "{search}"</strong>.
      </p>

      <button
        className="clear-search-btn"
        onClick={() => setSearch("")}
      >
        Clear Search
      </button>

    </div>

  )}

</div>

        </div>

    );

};

export default DSASheet;