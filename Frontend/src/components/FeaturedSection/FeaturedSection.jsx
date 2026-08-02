import React, { memo } from 'react';
import { HiSparkles } from 'react-icons/hi2';
import { getFeaturedCompetitions } from '../../data/competitionData';
import FeaturedCompetition from './FeaturedCompetition';
import './FeaturedSection.css';

const FeaturedSection = memo(() => {
  const rawFeatured = getFeaturedCompetitions();

  // Deduplicate by unique competition ID to ensure only unique competitions are rendered
  const uniqueFeatured = Array.from(
    new Map(rawFeatured.map((item) => [item.id, item])).values()
  ).slice(0, 5);

  return (
    <aside className="featured-section">
      {/* Header */}
      <div className="featured-header">
        <div className="featured-title-wrapper">
          <HiSparkles className="featured-sparkle-icon" />
          <h2 className="featured-heading">Featured Opportunities</h2>
        </div>
        <span className="featured-count-pill">{uniqueFeatured.length}</span>
      </div>

      {/* Scrollable List of Unique Featured Items */}
      <div className="featured-list">
        {uniqueFeatured.map((item) => (
          <FeaturedCompetition key={item.id} item={item} />
        ))}
      </div>
    </aside>
  );
});

FeaturedSection.displayName = 'FeaturedSection';

export default FeaturedSection;


