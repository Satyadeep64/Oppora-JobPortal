import { useState, useEffect, useCallback } from 'react';
import competitionApi from '../services/competitionApi';
import { 
  getCompetitionById as getLocalCompetitionById, 
  getAllCompetitions as getLocalAllCompetitions 
} from '../data/competitionData';

/**
 * Custom Hook: useCompetitionDetail
 * Solves single competition detail queries with graceful offline fallback.
 */
export const useCompetitionDetail = (id) => {
  const [state, setState] = useState({
    competition: null,
    relatedCompetitions: [],
    loading: true,
    error: null
  });

  const fetchDetails = useCallback(async () => {
    if (!id) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    let detail = null;
    try {
      detail = await competitionApi.getById(id);
    } catch {
      detail = null;
    }

    if (!detail) {
      detail = getLocalCompetitionById(id);
    }

    if (!detail) {
      setState({
        competition: null,
        relatedCompetitions: [],
        loading: false,
        error: `Opportunity #${id} was not found.`
      });
      return;
    }

    let related = [];
    try {
      const pagedRes = await competitionApi.getAdvancedSearch(1, 10, { category: detail.category || '' });
      const items = pagedRes?.items || [];
      related = items.filter((item) => String(item.id) !== String(id)).slice(0, 3);
    } catch {
      // Ignore network error and fall back to local dataset
    }

    if (related.length === 0) {
      const localAll = getLocalAllCompetitions();
      related = localAll.filter((item) => String(item.id) !== String(id)).slice(0, 3);
    }

    setState({
      competition: detail,
      relatedCompetitions: related,
      loading: false,
      error: null
    });
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return {
    ...state,
    refetch: fetchDetails
  };
};

export default useCompetitionDetail;
