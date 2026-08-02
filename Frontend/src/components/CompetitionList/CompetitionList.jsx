import React from 'react';
import CompetitionGrid from './CompetitionGrid';
import useCompetitionList from '../../hooks/useCompetitionList';
import './CompetitionList.css';

const CompetitionList = ({ filters = {}, onResetFilters }) => {
  const {
    competitions,
    loadingInitial,
    loadingMore,
    hasMore,
    error,
    observerTargetRef,
    retry
  } = useCompetitionList(filters);

  return (
    <CompetitionGrid
      competitions={competitions}
      loadingInitial={loadingInitial}
      loadingMore={loadingMore}
      hasMore={hasMore}
      error={error}
      filters={filters}
      onRetry={retry}
      onResetFilters={onResetFilters}
      observerTargetRef={observerTargetRef}
    />
  );
};

export default CompetitionList;
