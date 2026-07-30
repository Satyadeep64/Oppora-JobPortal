import apiClient from './apiClient';

const detailCache = new Map();

export const competitionService = {
  /**
   * Get all active competitions from backend
   * @returns {Promise<Array>} List of competitions
   */
  async getAllCompetitions() {
    return await apiClient.get('/competitions');
  },

  /**
   * Get paged competitions for infinite scrolling & backend filtering with automatic offline fallback
   * @param {number} pageNumber - Current page number (1-indexed)
   * @param {number} pageSize - Number of items per page (default 10)
   * @param {Object} filters - Optional filter criteria
   * @returns {Promise<Object>} Paged result object { items, totalCount, currentPage, totalPages, hasNext, hasPrevious }
   */
  async getCompetitionsPaged(pageNumber = 1, pageSize = 10, filters = {}) {
    const params = {
      pageNumber,
      pageSize,
    };

    // Include non-empty filter parameters
    Object.keys(filters).forEach((key) => {
      const val = filters[key];
      if (val !== null && val !== undefined && val !== '') {
        params[key] = val;
      }
    });

    try {
      const res = await apiClient.get('/competitions/advanced-search', { params });
      if (res && (res.items || Array.isArray(res))) {
        // Warm up detail cache with items returned in search feed
        if (Array.isArray(res.items)) {
          res.items.forEach((item) => {
            if (item && item.id) detailCache.set(String(item.id), item);
          });
        }
        return res;
      }
    } catch {
      // Fallback to local static dataset when API is offline or unreachable
    }

    const fallbackModule = await import('../data/competitionData');
    const filterFn = fallbackModule.filterCompetitions || (() => fallbackModule.competitionData || []);
    const filteredData = filterFn(filters);
    const startIndex = (pageNumber - 1) * pageSize;
    const items = filteredData.slice(startIndex, startIndex + pageSize);

    // Warm up cache
    items.forEach((item) => {
      if (item && item.id) detailCache.set(String(item.id), item);
    });

    return {
      items,
      totalCount: filteredData.length,
      currentPage: pageNumber,
      pageSize,
      hasNext: startIndex + pageSize < filteredData.length,
      hasPrevious: pageNumber > 1
    };
  },

  /**
   * Get a single competition by ID with automatic offline fallback & in-memory caching
   * @param {number|string} id - Competition ID
   * @returns {Promise<Object>} Competition details object
   */
  async getCompetitionById(id) {
    if (!id) return null;
    const cacheKey = String(id);

    if (detailCache.has(cacheKey)) {
      return detailCache.get(cacheKey);
    }

    try {
      const res = await apiClient.get(`/competitions/${id}`);
      if (res) {
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

    // Dispatch global custom event for instant multi-component reactivity
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
   * Robust cross-browser clipboard copy helper with fallback for non-secure HTTP / legacy browsers
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
      // Fallthrough to legacy method
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

