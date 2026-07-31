import React, { useState, memo } from 'react';
import { FiSearch, FiX, FiTrendingUp } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import './CompetitionHeroHeader.css';

/**
 * CompetitionHeroHeader — Single Responsibility: Renders hero banner, search bar, stats pill, and quick search tags.
 */
const CompetitionHeroHeader = memo(({ searchTerm = '', onSearchChange }) => {
  const [localSearch, setLocalSearch] = useState(searchTerm);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setLocalSearch(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const handleClear = () => {
    setLocalSearch('');
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  const handleTagClick = (tag) => {
    setLocalSearch(tag);
    if (onSearchChange) {
      onSearchChange(tag);
    }
  };

  const quickTags = ['Hackathons', 'AI / ML', 'Hiring Challenge', 'Coding Contest', 'Case Study'];

  return (
    <section className="competition-hero-banner">
      <div className="hero-content">
        <div className="hero-top-badge">
          <HiSparkles className="hero-sparkle-icon" />
          <span>21,341+ Active Opportunities for Students & Developers</span>
        </div>

        <h1 className="hero-main-title">
          Discover & Compete in <span className="title-gradient">Top Challenges</span>
        </h1>
        
        <p className="hero-subtitle">
          Online quizzes, hackathons, coding contests, and case studies with total prizes exceeding ₹50+ Lakhs.
        </p>

        {/* Hero Search Box */}
        <div className="hero-search-wrapper">
          <FiSearch className="hero-search-icon" />
          <input
            type="text"
            className="hero-search-input"
            placeholder="Search by title, skills, organization, or domain..."
            value={localSearch}
            onChange={handleInputChange}
            aria-label="Search competitions"
          />
          {localSearch && (
            <button type="button" className="clear-search-btn" onClick={handleClear} aria-label="Clear search">
              <FiX />
            </button>
          )}
        </div>

        {/* Quick Search Tags */}
        <div className="hero-quick-tags">
          <span className="tags-label">
            <FiTrendingUp className="tags-icon" /> Popular:
          </span>
          {quickTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="quick-tag-chip"
              onClick={() => handleTagClick(tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
});

CompetitionHeroHeader.displayName = 'CompetitionHeroHeader';

export default CompetitionHeroHeader;
