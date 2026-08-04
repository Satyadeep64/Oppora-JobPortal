import React, { memo } from 'react';
import { HiSparkles } from 'react-icons/hi2';
import { useFeaturedCompetitions } from '../../../hooks/useFeaturedCompetitions';
import FeaturedCard from './FeaturedCard';
import './FeaturedSection.css';

/**
 * FeaturedSection — Single Responsibility: Renders sticky right-sidebar of featured competitions sourced from API.
 */
const FeaturedSection = memo(() => {
  const { featured, loading } = useFeaturedCompetitions();

  return (
    <aside className="featured-section">
      <div className="featured-header">
        <div className="featured-title-wrapper">
          <HiSparkles className="featured-sparkle-icon" />
          <h2 className="featured-heading">Featured Opportunities</h2>
        </div>
        <span className="featured-count-pill">{featured.length}</span>
      </div>

      <div className="featured-list">
        {loading && <div style={{ padding: '16px', color: '#64748b' }}>Loading featured...</div>}

        {!loading && featured.length === 0 && (
          <div style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>
            No featured opportunities available right now.
          </div>
        )}

        {!loading && featured.map((item) => (
          <FeaturedCard key={item.id} item={item} />
        ))}
      </div>
    </aside>
  );
});

FeaturedSection.displayName = 'FeaturedSection';

export default FeaturedSection;
