import apiClient from './apiClient';

const detailCache = new Map();
const pagedCache = new Map();
const inFlightRequestsMap = new Map();
const CACHE_TTL_MS = 120000; // 2 Minutes TTL

export const competitionService = {
  /**
   * Get all active competitions from backend
   * @returns {Promise<Array>} List of competitions
   */
  async getAllCompetitions() {
    return await apiClient.get('/competitions');
  },

  /**
   * Get paged competitions for infinite scrolling & backend filtering with automatic offline fallback & in-flight request deduplication
   * @param {number} pageNumber - Current page number (1-indexed)
   * @param {number} pageSize - Number of items per page (default 10)
   * @param {Object} filters - Optional filter criteria
   * @returns {Promise<Object>} Paged result object { items, totalCount, currentPage, totalPages, hasNext, hasPrevious }
   */
  async getCompetitionsPaged(pageNumber = 1, pageSize = 50, filters = {}) {
    const params = {
      pageNumber,
      pageSize,
    };

    Object.keys(filters).forEach((key) => {
      const val = filters[key];
      if (val !== null && val !== undefined && val !== '') {
        params[key] = val;
      }
    });

    const cacheKey = JSON.stringify(params);

    // 1. Return cached result if fresh (< 2 minutes old)
    if (pagedCache.has(cacheKey)) {
      const cached = pagedCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
      }
      pagedCache.delete(cacheKey);
    }

    // 2. Deduplicate in-flight concurrent duplicate requests
    if (inFlightRequestsMap.has(cacheKey)) {
      return await inFlightRequestsMap.get(cacheKey);
    }

    const requestPromise = (async () => {
      try {
        const res = await apiClient.get('/competitions/advanced-search', { params });
        if (res && (res.items !== undefined || Array.isArray(res))) {
          const apiItems = res.items || (Array.isArray(res) ? res : []);
          apiItems.forEach((item) => {
            if (item && item.id) detailCache.set(String(item.id), item);
          });
          const currentP = res.currentPage ?? pageNumber;
          const pageS = res.pageSize ?? pageSize;
          const totalC = res.totalCount ?? apiItems.length;

          const resultObj = {
            items: apiItems,
            totalCount: totalC,
            currentPage: currentP,
            pageSize: pageS,
            hasNext: res.hasNext !== undefined ? res.hasNext : currentP * pageS < totalC,
            hasPrevious: res.hasPrevious !== undefined ? res.hasPrevious : currentP > 1
          };

          pagedCache.set(cacheKey, { timestamp: Date.now(), data: resultObj });
          return resultObj;
        }
      } catch (err) {
        console.warn('Backend API unreachable, using local fallback:', err?.message);
      } finally {
        inFlightRequestsMap.delete(cacheKey);
      }

      const fallbackModule = await import('../data/competitionData');
      const filterFn = fallbackModule.filterCompetitions || (() => fallbackModule.competitionData || []);
      const filteredData = filterFn(filters);
      const startIndex = (pageNumber - 1) * pageSize;
      const items = filteredData.slice(startIndex, startIndex + pageSize);

      items.forEach((item) => {
        if (item && item.id) detailCache.set(String(item.id), item);
      });

      const fallbackResultObj = {
        items,
        totalCount: filteredData.length,
        currentPage: pageNumber,
        pageSize,
        hasNext: startIndex + pageSize < filteredData.length,
        hasPrevious: pageNumber > 1
      };

      pagedCache.set(cacheKey, { timestamp: Date.now(), data: fallbackResultObj });
      return fallbackResultObj;
    })();

    inFlightRequestsMap.set(cacheKey, requestPromise);
    return await requestPromise;
  },

  /**
   * Get a single competition by ID with automatic offline fallback & in-memory caching
   * @param {number|string} id - Competition ID
   * @returns {Promise<Object>} Competition details object
   */
  async getCompetitionById(id) {
    if (!id) return null;
    const cacheKey = String(id);

    // Instant 0ms return if already in detailCache
    if (detailCache.has(cacheKey)) {
      const cached = detailCache.get(cacheKey);
      // Background revalidation (silent sync)
      apiClient.get(`/competitions/${id}`).then((res) => {
        if (res && res.id) detailCache.set(cacheKey, res);
      }).catch(() => {});
      return cached;
    }

    try {
      const res = await apiClient.get(`/competitions/${id}`);
      if (res && res.id) {
        detailCache.set(cacheKey, res);
        return res;
      }
    } catch {
      // Fallback to local dataset
    }

    const fallbackModule = await import('../data/competitionData');
    const fallbackData = fallbackModule.getCompetitionById ? fallbackModule.getCompetitionById(id) : null;
    if (fallbackData) {
      detailCache.set(cacheKey, fallbackData);
    }
    return fallbackData;
  },

  /**
   * Pre-fetch competition details into cache for instant navigation transitions
   * @param {number|string} id 
   */
  async prefetchCompetitionById(id) {
    if (!id || detailCache.has(String(id))) return;
    try {
      await this.getCompetitionById(id);
    } catch {
      // Silently ignore prefetch background errors
    }
  },

  /**
   * Search competitions by query string
   * @param {string} query - Keyword search term
   * @returns {Promise<Array>} Matching competitions list
   */
  async searchCompetitions(query) {
    return await apiClient.get(`/competitions/search`, {
      params: { q: query },
    });
  },

  /**
   * Filter competitions with parameters
   * @param {Object} params - Filter options (category, mode, status, teamSize)
   * @returns {Promise<Array>} Filtered competitions list
   */
  async filterCompetitions(params) {
    return await apiClient.get(`/competitions/filter`, {
      params,
    });
  },

  /**
   * Clear in-memory caches when user explicitly forces a reset
   */
  clearCaches() {
    pagedCache.clear();
    detailCache.clear();
    inFlightRequestsMap.clear();
  },

  /**
   * Get all bookmarked competition IDs from localStorage
   * @returns {Set<string|number>} Set of bookmarked IDs
   */
  getBookmarks() {
    try {
      const stored = localStorage.getItem('oppora_bookmarked_competitions');
      if (!stored) return new Set();
      const parsed = JSON.parse(stored);
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set();
    }
  },

  /**
   * Check if a competition ID is bookmarked
   * @param {number|string} id 
   * @returns {boolean}
   */
  isBookmarked(id) {
    if (id === null || id === undefined) return false;
    const bookmarks = this.getBookmarks();
    return bookmarks.has(String(id)) || bookmarks.has(Number(id));
  },

  /**
   * Toggle bookmark state for a competition ID and notify app listeners
   * @param {number|string} id 
   * @returns {boolean} New bookmarked status
   */
  toggleBookmark(id) {
    if (id === null || id === undefined) return false;
    const bookmarks = this.getBookmarks();
    const strId = String(id);
    let isNowBookmarked = false;

    if (bookmarks.has(strId) || bookmarks.has(Number(id))) {
      bookmarks.delete(strId);
      bookmarks.delete(Number(id));
      isNowBookmarked = false;
    } else {
      bookmarks.add(strId);
      isNowBookmarked = true;
    }

    try {
      localStorage.setItem('oppora_bookmarked_competitions', JSON.stringify(Array.from(bookmarks)));
    } catch (e) {
      console.warn('Failed to save bookmark to localStorage:', e);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('oppora:bookmark-change', {
          detail: { id, bookmarked: isNowBookmarked }
        })
      );
    }

    return isNowBookmarked;
  },

  /**
   * Clipboard copy helper with fallback for non-secure contexts
   * @param {string} text 
   * @returns {Promise<boolean>} Success boolean
   */
  async copyToClipboard(text) {
    if (!text) return false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fallback
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch {
      return false;
    }
  }
};

export default competitionService;
