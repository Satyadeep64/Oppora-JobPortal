import { useState, useEffect, useCallback } from 'react';
import competitionService from '../services/competitionService';
import { getCompetitionById as getLocalCompetitionById, getAllCompetitions as getLocalAllCompetitions } from '../data/competitionData';

export const useCompetitionDetails = (id) => {
  const [competition, setCompetition] = useState(null);
  const [relatedCompetitions, setRelatedCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarked, setBookmarked] = useState(() => competitionService.isBookmarked(id));

  // Sync bookmark state when global bookmark event fires
  useEffect(() => {
    setBookmarked(competitionService.isBookmarked(id));
    const handleBookmarkChange = (e) => {
      if (e?.detail && String(e.detail.id) === String(id)) {
        setBookmarked(e.detail.bookmarked);
      }
    };
    window.addEventListener('oppora:bookmark-change', handleBookmarkChange);
    return () => window.removeEventListener('oppora:bookmark-change', handleBookmarkChange);
  }, [id]);

  const toggleBookmark = useCallback(() => {
    const newStatus = competitionService.toggleBookmark(id);
    setBookmarked(newStatus);
    return newStatus;
  }, [id]);

  const fetchCompetitionDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    let loadedData = null;

    try {
      loadedData = await competitionService.getCompetitionById(id);
    } catch {
      loadedData = null;
    }

    if (!loadedData) {
      loadedData = getLocalCompetitionById(id);
    }

    if (!loadedData) {
      setError(`Opportunity #${id} was not found.`);
      setCompetition(null);
      setRelatedCompetitions([]);
      setLoading(false);
      return;
    }

    setCompetition(loadedData);

    try {
      const pagedRes = await competitionService.getCompetitionsPaged(1, 10, {
        category: loadedData.category || ''
      });
      const allItems = pagedRes?.items || [];
      const related = allItems
        .filter((item) => String(item.id) !== String(id))
        .slice(0, 3);

      if (related.length > 0) {
        setRelatedCompetitions(related);
      } else {
        const localAll = getLocalAllCompetitions();
        setRelatedCompetitions(localAll.filter((item) => String(item.id) !== String(id)).slice(0, 3));
      }
    } catch {
      const localAll = getLocalAllCompetitions();
      setRelatedCompetitions(localAll.filter((item) => String(item.id) !== String(id)).slice(0, 3));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchCompetitionDetails();
    }
  }, [id, fetchCompetitionDetails]);

  return {
    competition,
    relatedCompetitions,
    loading,
    error,
    bookmarked,
    toggleBookmark,
    refetch: fetchCompetitionDetails
  };
};

export default useCompetitionDetails;
