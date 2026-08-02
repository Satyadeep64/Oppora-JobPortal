import React, { memo } from 'react';
import { FiX, FiRefreshCw, FiCheck, FiFilter } from 'react-icons/fi';

/**
 * FilterPanel — Single-responsibility component for rendering filter modal controls & inputs
 */
const FilterPanel = memo(({
  isOpen,
  modalRef,
  draftFilters,
  onDraftChange,
  onReset,
  onApply,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="filter-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="filter-modal-title">
      <div className="filter-modal-content" ref={modalRef}>
        {/* Modal Header */}
        <div className="filter-modal-header">
          <div className="filter-modal-title-box">
            <FiFilter className="filter-modal-icon" />
            <h3 id="filter-modal-title">All Filters</h3>
          </div>
          <button 
            type="button" 
            className="filter-modal-close-btn" 
            onClick={onClose}
            aria-label="Close filters modal"
          >
            <FiX />
          </button>
        </div>

        {/* Modal Body */}
        <div className="filter-modal-body">
          <div className="filter-group-grid">
            {/* Category Select */}
            <div className="filter-field-group">
              <label htmlFor="filter-category-select">Category</label>
              <select
                id="filter-category-select"
                value={draftFilters.category || ''}
                onChange={(e) => onDraftChange({ category: e.target.value })}
              >
                <option value="">All Categories</option>
                <option value="Competitions">Competitions</option>
                <option value="Hackathons">Hackathons</option>
                <option value="Workshops">Workshops</option>
                <option value="Quizzes">Quizzes</option>
                <option value="Scholarships">Scholarships</option>
                <option value="Conferences">Conferences</option>
                <option value="Cultural Events">Cultural Events</option>
                <option value="Coding Contest">Coding Contest</option>
                <option value="Innovation Challenge">Innovation Challenge</option>
              </select>
            </div>

            {/* Mode Select */}
            <div className="filter-field-group">
              <label htmlFor="filter-mode-select">Mode</label>
              <select
                id="filter-mode-select"
                value={draftFilters.mode || ''}
                onChange={(e) => onDraftChange({ mode: e.target.value })}
              >
                <option value="">All Modes</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            {/* Location Search */}
            <div className="filter-field-group">
              <label htmlFor="filter-location-input">Location / City</label>
              <input
                id="filter-location-input"
                type="text"
                placeholder="e.g. Mumbai, Bengaluru, Online"
                value={draftFilters.location || ''}
                onChange={(e) => onDraftChange({ location: e.target.value })}
              />
            </div>

            {/* Title / Organization Keyword */}
            <div className="filter-field-group">
              <label htmlFor="filter-title-input">Title / Host Organization</label>
              <input
                id="filter-title-input"
                type="text"
                placeholder="e.g. Google, IIT Bombay, AI"
                value={draftFilters.title || ''}
                onChange={(e) => onDraftChange({ title: e.target.value })}
              />
            </div>

            {/* Prize Range */}
            <div className="filter-field-group">
              <label htmlFor="filter-min-prize">Min Prize Pool (₹)</label>
              <input
                id="filter-min-prize"
                type="number"
                placeholder="e.g. 50000"
                value={draftFilters.minPrizeAmount || ''}
                onChange={(e) => onDraftChange({ minPrizeAmount: e.target.value })}
              />
            </div>

            <div className="filter-field-group">
              <label htmlFor="filter-max-prize">Max Prize Pool (₹)</label>
              <input
                id="filter-max-prize"
                type="number"
                placeholder="e.g. 500000"
                value={draftFilters.maxPrizeAmount || ''}
                onChange={(e) => onDraftChange({ maxPrizeAmount: e.target.value })}
              />
            </div>

            {/* Payment Filter */}
            <div className="filter-field-group">
              <label htmlFor="filter-payment-select">Registration Fee</label>
              <select
                id="filter-payment-select"
                value={draftFilters.payment || ''}
                onChange={(e) => onDraftChange({ payment: e.target.value, isFree: e.target.value === 'free' ? true : e.target.value === 'paid' ? false : null })}
              >
                <option value="">All (Free & Paid)</option>
                <option value="free">Free Only</option>
                <option value="paid">Paid Entry Only</option>
              </select>
            </div>

            {/* Sort Option */}
            <div className="filter-field-group">
              <label htmlFor="filter-sort-select">Sort By</label>
              <select
                id="filter-sort-select"
                value={draftFilters.sortBy || 'popularity'}
                onChange={(e) => onDraftChange({ sortBy: e.target.value })}
              >
                <option value="popularity">Most Popular / Trending</option>
                <option value="deadline">Expiring Soonest</option>
                <option value="prize">Highest Prize Pool</option>
                <option value="recent">Recently Added</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="filter-modal-footer">
          <button type="button" className="filter-reset-btn" onClick={onReset}>
            <FiRefreshCw /> <span>Reset All</span>
          </button>
          <button type="button" className="filter-apply-btn" onClick={onApply}>
            <FiCheck /> <span>Apply Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
});

FilterPanel.displayName = 'FilterPanel';

export default FilterPanel;
