/**
 * useCompetitionFeed Hook
 * Optimized hook handling infinite pagination, request deduplication, memory caching, and URL synchronization.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import competitionApi from '../services/competitionApi';
import { DEFAULT_FILTERS } from '../constants/competitionConstants';

// Client-side cache for paginated competition feeds
const feedCache = new Map();

export const useCompetitionFeed = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [competitions, setCompetitions] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const observerTargetRef = useRef(null);
  const requestIdRef = useRef(0);
  const debounceTimerRef = useRef(null);

  // Parse active filters from URL search params
  const activeFilters = useMemo(() => {
    const filters = { ...DEFAULT_FILTERS };
    searchParams.forEach((value, key) => {
      if (key in filters) {
        if (value === 'true') filters[key] = true;
        else if (value === 'false') filters[key] = false;
        else filters[key] = value;
      }
    });
    return filters;
  }, [searchParams]);

  const activeFiltersJson = JSON.stringify(activeFilters);
  const prevFiltersRef = useRef(activeFiltersJson);

  // Debounced update to URL search params to avoid firing rapid API calls on keystrokes
  const updateFilters = useCallback(
    (newFilterValues) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      const applyUpdate = () => {
        const merged = { ...activeFilters, ...newFilterValues };
        const newParams = new URLSearchParams();

        Object.entries(merged).forEach(([key, val]) => {
          if (
            val !== null && 
            val !== undefined && 
            val !== '' && 
            val !== DEFAULT_FILTERS[key]
          ) {
            newParams.set(key, String(val));
          }
        });

        setSearchParams(newParams, { replace: true });
      };

      // Debounce text search by 250ms, immediate for pill selects
      if ('searchTerm' in newFilterValues || 'title' in newFilterValues) {
        debounceTimerRef.current = setTimeout(applyUpdate, 250);
      } else {
        applyUpdate();
      }
    },
    [activeFilters, setSearchParams]
  );

  const resetFilters = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  // Reset page number when filters change
  useEffect(() => {
    if (prevFiltersRef.current !== activeFiltersJson) {
      prevFiltersRef.current = activeFiltersJson;
      setPageNumber(1);
    }
  }, [activeFiltersJson]);

  // Fetch paginated feed data with deduplication & caching
  useEffect(() => {
    let isCancelled = false;
    const currentRequestId = ++requestIdRef.current;
    const cacheKey = `${activeFiltersJson}_p${pageNumber}`;

    const loadData = async () => {
      // Return cached results if available
      if (feedCache.has(cacheKey)) {
        const cached = feedCache.get(cacheKey);
        setCompetitions((prev) => (pageNumber === 1 ? cached.items : [...prev, ...cached.items]));
        setHasMore(cached.hasMore);
        setLoadingInitial(false);
        setLoadingMore(false);
        setError(null);
        return;
      }

      if (pageNumber === 1) {
        setLoadingInitial(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      try {
        const res = await competitionApi.getAdvancedSearch(pageNumber, 50, activeFilters);

        if (isCancelled || currentRequestId !== requestIdRef.current) return;

        const items = res?.items || (Array.isArray(res) ? res : []);
        const hasNext = res?.hasNext !== undefined ? res.hasNext : items.length >= 50;

        // Store in memory cache
        feedCache.set(cacheKey, { items, hasMore: hasNext });

        setCompetitions((prev) => (pageNumber === 1 ? items : [...prev, ...items]));
        setHasMore(hasNext);
      } catch (err) {
        if (isCancelled || currentRequestId !== requestIdRef.current) return;

        // Fallback gracefully to offline dataset
        try {
          const fallbackModule = await import('../data/competitionData');
          const filterFn = fallbackModule.filterCompetitions || (() => fallbackModule.competitionData || []);
          const filtered = filterFn(activeFilters);
          const startIndex = (pageNumber - 1) * 50;
          const sliced = filtered.slice(startIndex, startIndex + 50);

          setCompetitions((prev) => (pageNumber === 1 ? sliced : [...prev, ...sliced]));
          setHasMore(startIndex + 50 < filtered.length);
        } catch {
          setError(err?.message || 'Unable to connect to Oppora competition server.');
        }
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
  }, [pageNumber, activeFiltersJson, activeFilters]);

  // Intersection Observer for Infinite Scroll
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
    if (currentTarget) observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
      observer.disconnect();
    };
  }, [hasMore, loadingMore, loadingInitial]);

  const retry = useCallback(() => {
    feedCache.clear();
    setPageNumber(1);
    requestIdRef.current++;
  }, []);

  return {
    competitions,
    filters: activeFilters,
    loadingInitial,
    loadingMore,
    hasMore,
    error,
    observerTargetRef,
    updateFilters,
    resetFilters,
    retry
  };
};

export default useCompetitionFeed;
