/**
 * Bookmark Storage Service
 * Handles persisting and reading bookmarked competition IDs from localStorage.
 */

import { BOOKMARK_STORAGE_KEY } from '../constants/competitionConstants';

export const bookmarkService = {
  /**
   * Read stored bookmarks as a Set of string IDs
   * @returns {Set<string>}
   */
  getBookmarks() {
    try {
      const stored = localStorage.getItem(BOOKMARK_STORAGE_KEY);
      if (!stored) return new Set();
      const parsed = JSON.parse(stored);
      return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
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
    return bookmarks.has(String(id));
  },

  /**
   * Save updated set of bookmarks
   * @param {Set<string>} bookmarkSet 
   */
  saveBookmarks(bookmarkSet) {
    try {
      localStorage.setItem(
        BOOKMARK_STORAGE_KEY,
        JSON.stringify(Array.from(bookmarkSet))
      );
    } catch (err) {
      console.warn('Failed to persist bookmarks to storage:', err);
    }
  },

  /**
   * Toggle bookmark state for an ID
   * @param {number|string} id 
   * @returns {{ isBookmarked: boolean, newBookmarks: Set<string> }}
   */
  toggleBookmark(id) {
    if (id === null || id === undefined) {
      return { isBookmarked: false, newBookmarks: this.getBookmarks() };
    }

    const strId = String(id);
    const bookmarks = this.getBookmarks();
    let isNowBookmarked = false;

    if (bookmarks.has(strId)) {
      bookmarks.delete(strId);
      isNowBookmarked = false;
    } else {
      bookmarks.add(strId);
      isNowBookmarked = true;
    }

    this.saveBookmarks(bookmarks);
    return { isBookmarked: isNowBookmarked, newBookmarks: bookmarks };
  }
};

export default bookmarkService;
