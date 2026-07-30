import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import './SearchBar.css';

const SearchBar = memo(({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search by Title, Organization, Category, or Tags...',
  className = '',
  debounceMs = 250
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const debounceTimerRef = useRef(null);

  // Sync internal input value when external value changes (e.g. reset button)
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleChange = useCallback((e) => {
    const val = e.target.value;
    setInternalValue(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (onChange) {
        onChange(val);
      }
    }, debounceMs);
  }, [onChange, debounceMs]);

  const handleClear = useCallback(() => {
    setInternalValue('');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange('');
    }
  }, [onClear, onChange]);

  return (
    <div className={`standalone-search-bar ${className}`}>
      <FiSearch className="search-bar-icon" />
      <input
        type="text"
        className="search-bar-input"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        aria-label="Search competitions"
      />
      {internalValue && (
        <button
          type="button"
          className="search-bar-clear-btn"
          onClick={handleClear}
          title="Clear Search"
          aria-label="Clear Search"
        >
          <FiX />
        </button>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;

