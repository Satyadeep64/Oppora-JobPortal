import React, { useState, useEffect, useRef, memo } from 'react';
import './LazyImage.css';

/**
 * Helper to resolve relative backend image URLs (e.g. /uploads/filename.jpg -> http://localhost:5024/uploads/filename.jpg)
 */
export const resolveImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  if (trimmed.startsWith('/') || trimmed.startsWith('uploads/') || trimmed.startsWith('images/') || trimmed.startsWith('logos/')) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5024/api';
    const origin = apiBase.replace(/\/api\/?$/, '');
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${origin}${cleanPath}`;
  }

  return trimmed;
};

/**
 * Helper to compress and optimize image URLs dynamically (e.g. Unsplash WebP auto-formatting, HiDPI sizing)
 */
export const compressImageUrl = (url, width = 800) => {
  if (!url || typeof url !== 'string') return url;
  const resolved = resolveImageUrl(url);
  if (!resolved) return url;

  // Unsplash dynamic compression and auto-format
  if (resolved.includes('images.unsplash.com')) {
    try {
      const parsedUrl = new URL(resolved);
      parsedUrl.searchParams.set('auto', 'format');
      parsedUrl.searchParams.set('fit', 'crop');
      parsedUrl.searchParams.set('q', '80');
      if (!parsedUrl.searchParams.has('w') || parseInt(parsedUrl.searchParams.get('w'), 10) > width) {
        parsedUrl.searchParams.set('w', String(width));
      }
      return parsedUrl.toString();
    } catch {
      return resolved;
    }
  }

  // Clearbit logo resolution optimization
  if (resolved.includes('logo.clearbit.com')) {
    try {
      const parsedUrl = new URL(resolved);
      parsedUrl.searchParams.set('size', '160');
      return parsedUrl.toString();
    } catch {
      return resolved;
    }
  }

  return resolved;
};

/**
 * LazyImage — Production-grade image component with strict size boundaries, shimmer skeleton, and zero overflow
 */
const LazyImage = memo(({
  src,
  alt = '',
  className = '',
  fallbackSrc = null,
  onFallback = null,
  aspectRatio = null,
  objectFit = 'contain',
  objectPosition = 'center',
  borderRadius = null,
  wrapperClassName = '',
  wrapperStyle = {},
  eager = true,
  targetWidth = 800,
  ...rest
}) => {
  const optimizedPrimarySrc = compressImageUrl(src, targetWidth);
  const optimizedFallbackSrc = compressImageUrl(fallbackSrc, targetWidth);

  const [currentSrc, setCurrentSrc] = useState(() => optimizedPrimarySrc || optimizedFallbackSrc || '');
  const [status, setStatus] = useState('loading'); // loading | loaded | error
  const imgRef = useRef(null);

  // Sync state if primary or fallback src props change
  useEffect(() => {
    const newSrc = optimizedPrimarySrc || optimizedFallbackSrc || '';
    setCurrentSrc(newSrc);
    setStatus('loading');
  }, [optimizedPrimarySrc, optimizedFallbackSrc]);

  // Handle cached images already complete in memory
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth > 0) {
        setStatus('loaded');
      }
    }
  }, [currentSrc]);

  const handleLoad = () => {
    setStatus('loaded');
  };

  const handleError = () => {
    if (optimizedFallbackSrc && currentSrc !== optimizedFallbackSrc) {
      setCurrentSrc(optimizedFallbackSrc);
      setStatus('loading');
    } else {
      if (onFallback) onFallback();
      setStatus('error');
    }
  };

  const wStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    ...(aspectRatio ? { aspectRatio } : {}),
    ...(borderRadius ? { borderRadius } : {}),
    ...wrapperStyle,
  };

  const getInitials = (text) => {
    if (!text) return 'OP';
    const words = text.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={`lazy-image-wrapper ${wrapperClassName}`}
      style={wStyle}
    >
      {/* Shimmer Skeleton Placeholder while loading */}
      {status === 'loading' && (
        <div
          className="lazy-image-skeleton"
          aria-hidden="true"
        />
      )}

      {/* Actual Image */}
      {status !== 'error' && currentSrc && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          className={`lazy-image-img ${status === 'loaded' ? 'lazy-image-loaded' : ''} ${className}`}
          style={{
            objectFit,
            objectPosition,
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            boxSizing: 'border-box',
            display: 'block',
          }}
          onLoad={handleLoad}
          onError={handleError}
          decoding="async"
          loading={eager ? 'eager' : 'lazy'}
          {...rest}
        />
      )}

      {/* Fallback Error State — crisp avatar initials if primary & fallback images fail */}
      {(status === 'error' || !currentSrc) && (
        <div className="lazy-image-error" aria-label={alt}>
          <svg className="lazy-image-fallback-svg" viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="#1c4980" rx="12" />
            <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#ffffff" fontSize="36" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">
              {getInitials(alt)}
            </text>
          </svg>
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;
