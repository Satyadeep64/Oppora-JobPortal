import React, { useEffect } from 'react';
import CompetitionHeroHeader from '../../components/Competition/Hero/CompetitionHeroHeader';
import CategoryBar from '../../components/Competition/CategoryBar/CategoryBar';
import FilterBar from '../../components/Competition/FilterBar/FilterBar';
import CompetitionGrid from '../../components/Competition/CompetitionGrid/CompetitionGrid';
import FeaturedSection from '../../components/Competition/FeaturedSection/FeaturedSection';
import { useCompetitionFeed } from '../../hooks/useCompetitionFeed';
import './CompetitionPage.css';

/**
 * CompetitionPage — Redesigned modern Competition Feed Page.
 */
const CompetitionPage = () => {
  const {
    competitions,
    filters,
    loadingInitial,
    loadingMore,
    hasMore,
    error,
    observerTargetRef,
    updateFilters,
    resetFilters,
    retry
  } = useCompetitionFeed();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="competition-page-wrapper">
      <div className="portal-main-layout">
        <main className="portal-center-content">
          <CompetitionHeroHeader 
            searchTerm={filters.searchTerm}
            onSearchChange={(term) => updateFilters({ searchTerm: term })}
          />

          <CategoryBar 
            selectedCategory={filters.category}
            onCategorySelect={(catTitle) => updateFilters({ category: catTitle })}
          />

          <FilterBar 
            filters={filters}
            onFilterChange={updateFilters}
            onResetFilters={resetFilters}
          />

          <CompetitionGrid 
            competitions={competitions}
            loadingInitial={loadingInitial}
            loadingMore={loadingMore}
            hasMore={hasMore}
            error={error}
            filters={filters}
            onRetry={retry}
            onResetFilters={resetFilters}
            observerTargetRef={observerTargetRef}
          />
        </main>

        <FeaturedSection />
      </div>
    </div>
  );
};

export default CompetitionPage;
