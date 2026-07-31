import { useState, useEffect, useCallback } from 'react';
import competitionApi from '../services/competitionApi';
import { getFeaturedCompetitions as getLocalFeatured } from '../data/competitionData';

/**
 * Custom Hook: useFeaturedCompetitions
 * Manages featured opportunities list with offline data fallback.
 */
export const useFeaturedCompetitions = () => {
  const [state, setState] = useState({
    featured: [],
    loading: true,
    error: null
  });

  const fetchFeatured = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const res = await competitionApi.getFeatured();
      const items = Array.isArray(res) ? res : res?.items || [];

      if (items.length > 0) {
        const unique = Array.from(new Map(items.map((item) => [item.id, item])).values());
        setState({ featured: unique.slice(0, 5), loading: false, error: null });
        return;
      }
    } catch (err) {
      // Degrade gracefully to local fallback
    }

    const fallback = getLocalFeatured();
    setState({ featured: fallback.slice(0, 5), loading: false, error: null });
  }, []);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  return {
    ...state,
    refetch: fetchFeatured
  };
};

export default useFeaturedCompetitions;
