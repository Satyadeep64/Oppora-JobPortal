import React, { useState, useEffect, useRef, useCallback } from 'react';
import CompetitionGrid from './CompetitionGrid';
import competitionService from '../../services/competitionService';
import './CompetitionList.css';

const CompetitionList = ({ filters = {}, onResetFilters }) => {
  const [competitions, setCompetitions] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const observerTargetRef = useRef(null);
  const isFirstRender = useRef(true);
  const requestIdRef = useRef(0);

  // Fetch page chunk with sequence check to prevent out-of-order response state corruption
  const fetchPage = async (pageToFetch, activeFilters = filters) => {
    const currentRequestId = ++requestIdRef.current;

    if (pageToFetch === 1) {
      setLoadingInitial(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const res = await competitionService.getCompetitionsPaged(pageToFetch, 10, activeFilters);
      
      if (currentRequestId !== requestIdRef.current) return;

      const newItems = res?.items || (Array.isArray(res) ? res : []);
      const hasNext = res?.hasNext !== undefined ? res.hasNext : newItems.length >= 10;

      setCompetitions((prev) => (pageToFetch === 1 ? newItems : [...prev, ...newItems]));
      setHasMore(hasNext);
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      setError(err.message || 'Unable to connect to Oppora server. Please verify API status.');
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoadingInitial(false);
        setLoadingMore(false);
      }
    }
  };

  // Reset to page 1 and fetch whenever filters change
  useEffect(() => {
    setPageNumber(1);
    fetchPage(1, filters);
  }, [JSON.stringify(filters)]);

  // Fetch subsequent pages when pageNumber increments
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (pageNumber > 1) {
      fetchPage(pageNumber, filters);
    }
  }, [pageNumber]);

  // Intersection Observer for Infinite Scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loadingInitial) {
          setPageNumber((prev) => prev + 1);
        }
      },
      { rootMargin: '200px' }
    );

    const currentTarget = observerTargetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
      observer.disconnect();
    };
  }, [hasMore, loadingMore, loadingInitial]);

  const handleRetry = useCallback(() => {
    setPageNumber(1);
    fetchPage(1);
  }, []);

  return (
    <CompetitionGrid
      competitions={competitions}
      loadingInitial={loadingInitial}
      loadingMore={loadingMore}
      hasMore={hasMore}
      error={error}
      filters={filters}
      onRetry={handleRetry}
      onResetFilters={onResetFilters}
      observerTargetRef={observerTargetRef}
    />
  );
};

export default CompetitionList;

