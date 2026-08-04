/**
 * useCompetitionFeed Hook
 * Optimized hook handling infinite pagination, request deduplication, memory caching, URL synchronization, and robust reload/retry handling.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import competitionApi from '../services/competitionApi';
import { normalizeCompetitionItem } from '../services/competitionService';
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

  // Fetch paginated feed data with automatic retry, normalization, and deduplication
  useEffect(() => {
    let isCancelled = false;
    const currentRequestId = ++requestIdRef.current;
    const cacheKey = `${activeFiltersJson}_p${pageNumber}`;

    const loadData = async () => {
      // Check client-side in-memory cache if available
      if (feedCache.has(cacheKey)) {
        const cached = feedCache.get(cacheKey);
        if (cached && Array.isArray(cached.items) && cached.items.length > 0) {
          setCompetitions((prev) => (pageNumber === 1 ? cached.items : [...prev, ...cached.items]));
          setHasMore(cached.hasMore);
          setLoadingInitial(false);
          setLoadingMore(false);
          setError(null);
          return;
        }
      }

      if (pageNumber === 1) {
        setLoadingInitial(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      let fetchedItems = null;
      let hasNextPage = false;
      let apiSuccess = false;

      // 1. Primary API Attempt & 1x Automatic Retry on Failure
      for (let attempt = 1; attempt <= 2; attempt++) {
        if (isCancelled) break;
        try {
          const res = await competitionApi.getAdvancedSearch(pageNumber, 50, activeFilters);
          if (isCancelled) break;

          const rawItems = res?.items || (Array.isArray(res) ? res : []);
          if (Array.isArray(rawItems)) {
            fetchedItems = rawItems.map(normalizeCompetitionItem);
            hasNextPage = res?.hasNext !== undefined ? res.hasNext : fetchedItems.length >= 50;
            apiSuccess = true;
            break; // Success on attempt
          }
        } catch (err) {
          if (attempt === 1 && !isCancelled) {
            // Short 300ms pause before automatic retry
            await new Promise((r) => setTimeout(r, 300));
          }
        }
      }

      if (isCancelled) return;

      // 2. Offline / Fallback Dataset if API failed twice or returned empty
      if (!apiSuccess || !fetchedItems || fetchedItems.length === 0) {
        try {
          const fallbackModule = await import('../data/competitionData');
          const filterFn = fallbackModule.filterCompetitions || (() => fallbackModule.competitionData || []);
          const filtered = filterFn(activeFilters);
          const startIndex = (pageNumber - 1) * 50;
          const sliced = filtered.slice(startIndex, startIndex + 50).map(normalizeCompetitionItem);

          fetchedItems = sliced;
          hasNextPage = startIndex + 50 < filtered.length;
        } catch {
          if (pageNumber === 1 && (!competitions || competitions.length === 0)) {
            setError('Unable to load opportunities. Please try again.');
          }
        }
      }

      // 3. Update State (Accept if active request OR if initializing page 1 with empty list)
      if (!isCancelled && (currentRequestId === requestIdRef.current || pageNumber === 1)) {
        if (fetchedItems && fetchedItems.length > 0) {
          // Cache successful results
          feedCache.set(cacheKey, { items: fetchedItems, hasMore: hasNextPage });

          setCompetitions((prev) => (pageNumber === 1 ? fetchedItems : [...prev, ...fetchedItems]));
          setHasMore(hasNextPage);
          setError(null);
        }
      }

      // Always reset loading indicators in finally block
      if (!isCancelled) {
        setLoadingInitial(false);
        setLoadingMore(false);
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
