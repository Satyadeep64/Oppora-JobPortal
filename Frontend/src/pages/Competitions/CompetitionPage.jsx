import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/PageHeader/PageHeader';
import CategorySection from '../../components/CategorySection/CategorySection';
import FilterBar from '../../components/FilterBar/FilterBar';
import CompetitionList from '../../components/CompetitionList/CompetitionList';
import FeaturedSection from '../../components/FeaturedSection/FeaturedSection';
import './CompetitionPage.css';

const initialFilters = {
  searchTerm: '',
  title: '',
  organization: '',
  category: 'Competitions',
  minPrizeAmount: '',
  maxPrizeAmount: '',
  deadlineFrom: '',
  deadlineTo: '',
  activeOnly: false,
  location: '',
  mode: '',
  teamSize: '',
  minTeamSize: '',
  maxTeamSize: '',
  degree: '',
  batch: '',
  domain: '',
  isFree: null,
  payment: '',
  sortBy: 'popularity',
  sortOrder: 'desc'
};

const CompetitionPage = () => {
  const [filters, setFilters] = useState(initialFilters);

  // Restore scroll position when navigating back to feed page
  useEffect(() => {
    const savedScrollY = sessionStorage.getItem('oppora_competition_feed_scroll');
    if (savedScrollY) {
      window.scrollTo(0, parseInt(savedScrollY, 10));
    }

    const handleScroll = () => {
      sessionStorage.setItem('oppora_competition_feed_scroll', String(window.scrollY));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFilterChange = useCallback((newFilterValues) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilterValues
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  return (
    <div className="competition-page-wrapper">
      {/* Main Responsive Layout */}
      <div className="portal-main-layout">
        {/* Center Main Feed Content */}
        <main className="portal-center-content">
          <PageHeader />
          <CategorySection 
            selectedCategory={filters.category}
            onCategorySelect={(catTitle) => handleFilterChange({ category: catTitle })}
          />
          <FilterBar 
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />
          <CompetitionList 
            filters={filters}
            onResetFilters={handleResetFilters}
          />
        </main>

        {/* Right Sticky Featured Sidebar (Desktop Only) */}
        <FeaturedSection />
      </div>
    </div>
  );
};

export default CompetitionPage;

