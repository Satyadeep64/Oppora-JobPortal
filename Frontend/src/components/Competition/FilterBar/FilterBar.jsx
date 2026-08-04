import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FiSliders, 
  FiChevronDown, 
  FiUsers, 
  FiCreditCard, 
  FiGrid, 
  FiCheck 
} from 'react-icons/fi';
import { HiArrowsUpDown } from 'react-icons/hi2';
import FilterModal from './FilterModal';
import { 
  TEAM_SIZE_OPTIONS, 
  PAYMENT_OPTIONS, 
  CATEGORY_OPTIONS, 
  SORT_OPTIONS 
} from '../../../constants/competitionConstants';
import './FilterBar.css';

/**
 * FilterBar — Single Responsibility: Renders interactive filter pills, sort controls, and modal triggers.
 */
const FilterBar = ({ filters = {}, onFilterChange, onResetFilters }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
        setIsModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (filters.title) count++;
    if (filters.organization) count++;
    if (filters.category && filters.category !== 'Competitions' && filters.category !== 'All') count++;
    if (filters.minPrizeAmount || filters.maxPrizeAmount) count++;
    if (filters.deadlineFrom || filters.deadlineTo || filters.activeOnly) count++;
    if (filters.location) count++;
    if (filters.mode && filters.mode !== 'All') count++;
    if (filters.teamSize || filters.minTeamSize || filters.maxTeamSize) count++;
    if (filters.degree || filters.batch || filters.domain) count++;
    if (filters.payment || (filters.isFree !== null && filters.isFree !== undefined)) count++;
    return count;
  }, [filters]);

  const activeCount = getActiveFilterCount();

  const handleDropdownToggle = (menuName) => {
    setOpenDropdown((prev) => (prev === menuName ? null : menuName));
  };

  const updateSingleFilter = (key, value) => {
    if (onFilterChange) {
      onFilterChange({ [key]: value });
    }
    setOpenDropdown(null);
  };

  const currentSortObj = SORT_OPTIONS.find((s) => s.value === filters.sortBy) || SORT_OPTIONS[0];

  return (
    <div className="filter-bar" ref={containerRef}>
      <div className="filter-bar-container">
        {/* Main Filters Modal Trigger Button */}
        <button 
          type="button" 
          className={`filter-pill-btn main-filters-btn ${activeCount > 0 ? 'active' : ''}`}
          onClick={() => setIsModalOpen(true)}
        >
          <FiSliders className="pill-icon" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="filter-count-badge">{activeCount}</span>
          )}
        </button>

        {/* Team Size Quick Pill */}
        <div className="filter-pill-wrapper">
          <button 
            type="button" 
            className={`filter-pill-btn ${filters.teamSize ? 'active' : ''}`}
            onClick={() => handleDropdownToggle('teamSize')}
            aria-expanded={openDropdown === 'teamSize'}
          >
            <FiUsers className="pill-icon" />
            <span>{filters.teamSize ? `Team: ${filters.teamSize}` : 'Team Size'}</span>
            <FiChevronDown className="chevron-icon" />
          </button>
          {openDropdown === 'teamSize' && (
            <div className="filter-dropdown-menu">
              {TEAM_SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`dropdown-option-btn ${filters.teamSize === opt.value ? 'selected' : ''}`}
                  onClick={() => updateSingleFilter('teamSize', opt.value)}
                >
                  <span>{opt.label}</span>
                  {filters.teamSize === opt.value && <FiCheck />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Payment Quick Pill */}
        <div className="filter-pill-wrapper">
          <button 
            type="button" 
            className={`filter-pill-btn ${filters.payment ? 'active' : ''}`}
            onClick={() => handleDropdownToggle('payment')}
            aria-expanded={openDropdown === 'payment'}
          >
            <FiCreditCard className="pill-icon" />
            <span>{filters.payment ? `Fee: ${filters.payment}` : 'Payment'}</span>
            <FiChevronDown className="chevron-icon" />
          </button>
          {openDropdown === 'payment' && (
            <div className="filter-dropdown-menu">
              {PAYMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`dropdown-option-btn ${filters.payment === opt.value ? 'selected' : ''}`}
                  onClick={() => updateSingleFilter('payment', opt.value)}
                >
                  <span>{opt.label}</span>
                  {filters.payment === opt.value && <FiCheck />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Quick Pill */}
        <div className="filter-pill-wrapper">
          <button 
            type="button" 
            className={`filter-pill-btn ${filters.category && filters.category !== 'Competitions' ? 'active' : ''}`}
            onClick={() => handleDropdownToggle('category')}
            aria-expanded={openDropdown === 'category'}
          >
            <FiGrid className="pill-icon" />
            <span>{filters.category ? filters.category : 'Categories'}</span>
            <FiChevronDown className="chevron-icon" />
          </button>
          {openDropdown === 'category' && (
            <div className="filter-dropdown-menu">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`dropdown-option-btn ${filters.category === opt.title ? 'selected' : ''}`}
                  onClick={() => updateSingleFilter('category', opt.title)}
                >
                  <span>{opt.title}</span>
                  {filters.category === opt.title && <FiCheck />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort By Quick Pill */}
        <div className="filter-pill-wrapper">
          <button 
            type="button" 
            className="filter-pill-btn sort-pill-btn"
            onClick={() => handleDropdownToggle('sort')}
          >
            <HiArrowsUpDown className="pill-icon" />
            <span>Sort By: <strong className="sort-value">{currentSortObj.label}</strong></span>
            <FiChevronDown className="chevron-icon" />
          </button>
          {openDropdown === 'sort' && (
            <div className="filter-dropdown-menu right-aligned">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`dropdown-option-btn ${filters.sortBy === opt.value ? 'selected' : ''}`}
                  onClick={() => updateSingleFilter('sortBy', opt.value)}
                >
                  <span>{opt.label}</span>
                  {filters.sortBy === opt.value && <FiCheck />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <FilterModal
        isOpen={isModalOpen}
        filters={filters}
        onApply={(updated) => {
          onFilterChange(updated);
          setIsModalOpen(false);
        }}
        onReset={() => {
          onResetFilters();
          setIsModalOpen(false);
        }}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default FilterBar;
