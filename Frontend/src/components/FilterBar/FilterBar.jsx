import React, { useState, useRef, useEffect } from 'react';
import { 
  FiSliders, 
  FiChevronDown, 
  FiUsers, 
  FiCreditCard, 
  FiGrid,
  FiX,
  FiCheck
} from 'react-icons/fi';
import { HiArrowsUpDown } from 'react-icons/hi2';
import FilterPanel from './FilterPanel';
import './FilterBar.css';


const FilterBar = ({ filters = {}, onFilterChange, onResetFilters }) => {
  const [openDropdown, setOpenDropdown] = useState(null); // 'teamSize', 'payment', 'category', 'sort', null
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState({ ...filters });

  const containerRef = useRef(null);

  // Sync draft filters when modal opens or external filters change
  useEffect(() => {
    setDraftFilters({ ...filters });
  }, [filters, isModalOpen]);

  const modalRef = useRef(null);

  // Close dropdowns on outside click and handle Escape key + Focus trap for modal accessibility
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

      // Tab Key Focus Trap inside Modal
      if (e.key === 'Tab' && isModalOpen && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);



  // Compute active filter count across all 10 parameters
  const getActiveFilterCount = () => {
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
    if (filters.payment || filters.isFree !== null && filters.isFree !== undefined) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  const handleDropdownToggle = (menuName) => {
    setOpenDropdown((prev) => (prev === menuName ? null : menuName));
  };

  const updateSingleFilter = (key, value) => {
    if (onFilterChange) {
      onFilterChange({ [key]: value });
    }
    setOpenDropdown(null);
  };

  const handleDraftChange = (key, value) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyModalFilters = () => {
    if (onFilterChange) {
      onFilterChange(draftFilters);
    }
    setIsModalOpen(false);
  };

  const handleResetModalFilters = () => {
    if (onResetFilters) {
      onResetFilters();
    }
    setIsModalOpen(false);
  };

  // Sort display label
  const sortLabels = {
    popularity: 'Popularity',
    deadline: 'Deadline',
    prize: 'Prize Amount',
    newest: 'Newest',
    title: 'Title A-Z'
  };
  const currentSortLabel = sortLabels[filters.sortBy] || 'Popularity';

  return (
    <div className="filter-bar" ref={containerRef}>
      <div className="filter-bar-container">
        {/* Main Filters Button with Blue Count Badge */}
        <button 
          type="button" 
          className={`filter-pill-btn main-filters-btn ${activeFilterCount > 0 ? 'active' : ''}`}
          onClick={() => setIsModalOpen(true)}
        >
          <FiSliders className="pill-icon" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="filter-count-badge">{activeFilterCount}</span>
          )}
        </button>

        {/* Team Size Filter Pill */}
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
              {[
                { label: 'All Team Sizes', value: '' },
                { label: 'Individual', value: 'Individual' },
                { label: 'Team of 2', value: 'Team of 2' },
                { label: 'Team of 3', value: 'Team of 3' },
                { label: 'Team of 4+', value: 'Team of 4+' }
              ].map((opt) => (
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

        {/* Payment Filter Pill */}
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
              {[
                { label: 'All Payments', value: '' },
                { label: 'Free', value: 'Free' },
                { label: 'Paid', value: 'Paid' },
                { label: 'Sponsored', value: 'Sponsored' },
                { label: 'Scholarship', value: 'Scholarship' }
              ].map((opt) => (
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

        {/* Categories Filter Pill */}
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
              {[
                { label: 'All Competitions', value: 'Competitions' },
                { label: 'Hackathons', value: 'Hackathons' },
                { label: 'Workshops', value: 'Workshops' },
                { label: 'Quizzes', value: 'Quizzes' },
                { label: 'Scholarships', value: 'Scholarships' },
                { label: 'Conferences', value: 'Conferences' },
                { label: 'Cultural Events', value: 'Cultural Events' },
                { label: 'Coding Contest', value: 'Coding Contest' },
                { label: 'Innovation Challenge', value: 'Innovation Challenge' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`dropdown-option-btn ${filters.category === opt.value ? 'selected' : ''}`}
                  onClick={() => updateSingleFilter('category', opt.value)}
                >
                  <span>{opt.label}</span>
                  {filters.category === opt.value && <FiCheck />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort By Filter Pill */}
        <div className="filter-pill-wrapper">
          <button 
            type="button" 
            className="filter-pill-btn sort-pill-btn"
            onClick={() => handleDropdownToggle('sort')}
          >
            <HiArrowsUpDown className="pill-icon" />
            <span>Sort By: <strong className="sort-value">{currentSortLabel}</strong></span>
            <FiChevronDown className="chevron-icon" />
          </button>
          {openDropdown === 'sort' && (
            <div className="filter-dropdown-menu right-aligned">
              {[
                { label: 'Popularity', value: 'popularity' },
                { label: 'Registration Deadline', value: 'deadline' },
                { label: 'Prize Amount', value: 'prize' },
                { label: 'Newest First', value: 'newest' },
                { label: 'Title (A-Z)', value: 'title' }
              ].map((opt) => (
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

      {/* Advanced Search & Filter Modal */}
      <FilterPanel
        isOpen={isModalOpen}
        modalRef={modalRef}
        draftFilters={draftFilters}
        onDraftChange={(updates) => setDraftFilters((prev) => ({ ...prev, ...updates }))}
        onReset={handleResetModalFilters}
        onApply={handleApplyModalFilters}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default FilterBar;

