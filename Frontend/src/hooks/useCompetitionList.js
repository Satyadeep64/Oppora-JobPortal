import { useState, useEffect, useRef, useCallback } from 'react';
import competitionService from '../services/competitionService';

export const useCompetitionList = (filters = {}) => {
  const [competitions, setCompetitions] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const observerTargetRef = useRef(null);
  const requestIdRef = useRef(0);
  const activeFiltersJson = JSON.stringify(filters);
  const prevFiltersRef = useRef(activeFiltersJson);

  useEffect(() => {
    let isCancelled = false;
    const currentRequestId = ++requestIdRef.current;

    const loadData = async () => {
      if (pageNumber === 1) {
        setLoadingInitial(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      try {
        const res = await competitionService.getCompetitionsPaged(pageNumber, 50, filters);

        if (isCancelled || currentRequestId !== requestIdRef.current) return;

        const newItems = res?.items || (Array.isArray(res) ? res : []);
        const hasNext = res?.hasNext !== undefined ? res.hasNext : newItems.length >= 50;

        setCompetitions((prev) => (pageNumber === 1 ? newItems : [...prev, ...newItems]));
        setHasMore(hasNext);
      } catch (err) {
        if (isCancelled || currentRequestId !== requestIdRef.current) return;
        setError(err?.message || 'Unable to connect to Oppora server. Please verify API status.');
      } finally {
        if (!isCancelled && currentRequestId === requestIdRef.current) {
          setLoadingInitial(false);
          setLoadingMore(false);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [pageNumber, activeFiltersJson]);

  useEffect(() => {
    if (prevFiltersRef.current !== activeFiltersJson) {
      prevFiltersRef.current = activeFiltersJson;
      setPageNumber(1);
    }
  }, [activeFiltersJson]);

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

  const retry = useCallback(() => {
    setPageNumber(1);
    requestIdRef.current++;
  }, []);

  return {
    competitions,
    loadingInitial,
    loadingMore,
    hasMore,
    error,
    observerTargetRef,
    retry
  };
};

export default useCompetitionList;
