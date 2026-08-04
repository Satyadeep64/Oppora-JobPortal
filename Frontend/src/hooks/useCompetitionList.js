import { useState, useEffect, useRef, useCallback } from 'react';
import competitionService, { normalizeCompetitionItem } from '../services/competitionService';

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

      let res = null;

      // 1. Fetch with automatic 1x retry
      for (let attempt = 1; attempt <= 2; attempt++) {
        if (isCancelled) break;
        try {
          res = await competitionService.getCompetitionsPaged(pageNumber, 50, filters);
          if (res && Array.isArray(res.items) && res.items.length > 0) {
            break;
          }
        } catch (err) {
          if (attempt === 1 && !isCancelled) {
            await new Promise((r) => setTimeout(r, 300));
          }
        }
      }

      if (isCancelled) return;

      const rawItems = res?.items || (Array.isArray(res) ? res : []);
      const normalizedItems = rawItems.map(normalizeCompetitionItem);
      const hasNext = res?.hasNext !== undefined ? res.hasNext : normalizedItems.length >= 50;

      if (!isCancelled && (currentRequestId === requestIdRef.current || pageNumber === 1)) {
        setCompetitions((prev) => (pageNumber === 1 ? normalizedItems : [...prev, ...normalizedItems]));
        setHasMore(hasNext);
        setError(null);
      }

      if (!isCancelled) {
        setLoadingInitial(false);
        setLoadingMore(false);
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
