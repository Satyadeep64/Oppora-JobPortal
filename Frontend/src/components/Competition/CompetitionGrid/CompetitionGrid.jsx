import React, { memo } from 'react';
import CompetitionCard from '../CompetitionCard/CompetitionCard';
import SkeletonCard from '../../common/SkeletonCard';
import { FiAlertCircle, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import './CompetitionGrid.css';

/**
 * CompetitionGrid — Single Responsibility: Renders feed items, skeletons, empty, and error states cleanly.
 */
const CompetitionGrid = memo(({
  competitions = [],
  loadingInitial = false,
  loadingMore = false,
  hasMore = true,
  error = null,
  filters = {},
  onRetry,
  onResetFilters,
  observerTargetRef
}) => {
  return (
    <div className="competition-list-container">
      {loadingInitial && (
        <div className="competition-list-grid">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      )}

      {!loadingInitial && error && competitions.length === 0 && (
        <div className="error-state-box">
          <FiAlertCircle className="error-state-icon" />
          <h3 className="error-state-title">Unable to Load Opportunities</h3>
          <p className="error-state-message">{error}</p>
          {onRetry && (
            <button type="button" className="retry-btn" onClick={onRetry}>
              <FiRefreshCw className="retry-btn-icon" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      )}

      {!loadingInitial && !error && competitions.length === 0 && (
        <div className="empty-state-box">
          <FiAlertCircle className="empty-state-icon" />
          <h3 className="empty-state-title">No Competitions Found</h3>
          <p className="empty-state-message">
            {filters.searchTerm ? (
              <>No opportunities match "<strong>{filters.searchTerm}</strong>". Try searching for different keywords.</>
            ) : (
              <>No opportunities match your selected criteria. Try resetting your filters.</>
            )}
          </p>
          {onResetFilters && (
            <button type="button" className="retry-btn" onClick={onResetFilters}>
              Clear Search & Filters
            </button>
          )}
        </div>
      )}

      {competitions.length > 0 && (
        <div className="competition-list-grid">
          {competitions.map((item, index) => (
            <CompetitionCard
              key={`${item.id}-${index}`}
              id={item.id}
              logo={item.logo}
              banner={item.banner}
              title={item.title}
              organization={item.organization}
              members={item.members || item.teamSize}
              location={item.location}
              categories={item.categories || item.tags}
              postedDate={item.postedDate || (item.createdAt ? 'Posted recently' : 'Posted recently')}
              daysLeft={item.daysLeft || item.deadline || 'Closing Soon'}
              registeredCount={item.registeredCount}
              status={item.status}
              difficulty={item.difficulty || 'Intermediate'}
              popularityBadge={item.popularityBadge || (item.isFeatured ? 'Featured' : null)}
            />
          ))}
        </div>
      )}

      {loadingMore && (
        <div className="lazy-loading-skeletons" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {observerTargetRef && <div ref={observerTargetRef} className="scroll-sentinel" />}

      {!hasMore && competitions.length > 0 && (
        <div className="end-of-feed-badge">
          <FiCheckCircle className="end-feed-icon" />
          <span>You've reached the end of all opportunities!</span>
        </div>
      )}
    </div>
  );
});

CompetitionGrid.displayName = 'CompetitionGrid';

export default CompetitionGrid;
