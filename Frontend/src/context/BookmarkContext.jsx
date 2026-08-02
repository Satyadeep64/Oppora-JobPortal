/**
 * Bookmark Context Provider
 * Declarative state provider for competition bookmarks across the application.
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import bookmarkService from '../services/bookmarkService';

const BookmarkContext = createContext({
  bookmarks: new Set(),
  isBookmarked: () => false,
  toggleBookmark: () => false
});

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState(() => bookmarkService.getBookmarks());

  const isBookmarked = useCallback(
    (id) => {
      if (id === null || id === undefined) return false;
      return bookmarks.has(String(id));
    },
    [bookmarks]
  );

  const toggleBookmark = useCallback((id) => {
    const { isBookmarked: newStatus, newBookmarks } = bookmarkService.toggleBookmark(id);
    setBookmarks(new Set(newBookmarks));
    return newStatus;
  }, []);

  const value = useMemo(
    () => ({ bookmarks, isBookmarked, toggleBookmark }),
    [bookmarks, isBookmarked, toggleBookmark]
  );

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};

export default BookmarkContext;
