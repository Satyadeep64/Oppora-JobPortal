import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiRotateCcw, FiCheck } from 'react-icons/fi';

/**
 * FilterModal — Single Responsibility: Renders full advanced search modal overlay for granular filtering.
 */
const FilterModal = ({
  isOpen = false,
  filters = {},
  onApply,
  onReset,
  onClose
}) => {
  const [draft, setDraft] = useState({ ...filters });
  const modalRef = useRef(null);

  useEffect(() => {
    setDraft({ ...filters });
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="filter-modal-overlay" onClick={onClose}>
      <div 
        className="filter-modal-container" 
        ref={modalRef} 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Advanced Search & Filters"
      >
        <div className="filter-modal-header">
          <h2>Advanced Filters</h2>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="filter-modal-body">
          {/* Keyword Search */}
          <div className="filter-group">
            <label>Search Keywords</label>
            <input 
              type="text" 
              placeholder="e.g. AI, Google, Hackathon" 
              value={draft.searchTerm || ''}
              onChange={(e) => handleChange('searchTerm', e.target.value)}
            />
          </div>

          {/* Location / Mode */}
          <div className="filter-row">
            <div className="filter-group">
              <label>Mode</label>
              <select value={draft.mode || ''} onChange={(e) => handleChange('mode', e.target.value)}>
                <option value="">All Modes</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Location</label>
              <input 
                type="text" 
                placeholder="e.g. Mumbai, Online" 
                value={draft.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>
          </div>

          {/* Prize Amount Range */}
          <div className="filter-row">
            <div className="filter-group">
              <label>Min Prize (₹)</label>
              <input 
                type="number" 
                placeholder="0" 
                value={draft.minPrizeAmount || ''}
                onChange={(e) => handleChange('minPrizeAmount', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Max Prize (₹)</label>
              <input 
                type="number" 
                placeholder="500000" 
                value={draft.maxPrizeAmount || ''}
                onChange={(e) => handleChange('maxPrizeAmount', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="filter-modal-footer">
          <button type="button" className="reset-modal-btn" onClick={onReset}>
            <FiRotateCcw /> Reset All
          </button>
          <button type="button" className="apply-modal-btn" onClick={() => onApply(draft)}>
            <FiCheck /> Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
