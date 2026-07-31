import React, { useState, useEffect, useRef, memo } from 'react';
import './LazyImage.css';

/**
 * Helper to compress and optimize image URLs dynamically (e.g. Unsplash WebP auto-formatting, HiDPI sizing)
 */
export const compressImageUrl = (url, width = 800) => {
  if (!url || typeof url !== 'string') return url;

  // Unsplash dynamic compression and auto-format (serves WebP/AVIF automatically with optimal quality)
  if (url.includes('images.unsplash.com')) {
    try {
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.set('auto', 'format');
      parsedUrl.searchParams.set('fit', 'crop');
      parsedUrl.searchParams.set('q', '80');
      if (!parsedUrl.searchParams.has('w') || parseInt(parsedUrl.searchParams.get('w'), 10) > width) {
        parsedUrl.searchParams.set('w', String(width));
      }
      return parsedUrl.toString();
    } catch {
      return url;
    }
  }

  // Clearbit logo resolution optimization
  if (url.includes('logo.clearbit.com')) {
    try {
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.set('size', '160');
      return parsedUrl.toString();
    } catch {
      return url;
    }
  }

  return url;
};

/**
 * LazyImage — Robust, production-grade image component that ensures logos and banners display cleanly:
 *  - Immediate initial rendering with native browser loading="lazy" or "eager"
 *  - Handles cached images instantly via complete & naturalWidth checks
 *  - Shimmer skeleton placeholder while loading
 *  - Smooth fade-in transition (opacity: 0 -> 1)
 *  - Reliable fallback handling for 404 or missing URLs
 *  - Enforces object-fit: contain (logos) / cover (banners)
 *  - Maintains 1:1 or custom aspect ratios to prevent Cumulative Layout Shift (CLS)
 */
const LazyImage = memo(({
  src,
  alt = '',
  className = '',
  fallbackSrc = null,
  onFallback = null,          // called when primary src fails
  aspectRatio = null,         // e.g. '1/1' for logos, '16/9' for banners
  objectFit = 'contain',      // default contain for logos
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

  const [currentSrc, setCurrentSrc] = useState(() => optimizedPrimarySrc || optimizedFallbackSrc);
  const [status, setStatus] = useState('loading'); // loading | loaded | error
  const imgRef = useRef(null);

  // Sync state if src or fallbackSrc props change
  useEffect(() => {
    const newSrc = optimizedPrimarySrc || optimizedFallbackSrc;
    if (newSrc !== currentSrc) {
      setCurrentSrc(newSrc);
      setStatus('loading');
    }
  }, [optimizedPrimarySrc, optimizedFallbackSrc]);

  // Check if image is already loaded from browser cache or fast load
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth > 0) {
        setStatus('loaded');
      } else if (imgRef.current.src && status === 'loading') {
        handleError();
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
    overflow: 'hidden',
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
      {/* Shimmer Skeleton Placeholder — shown while loading */}
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
          }}
          onLoad={handleLoad}
          onError={handleError}
          decoding="async"
          loading={eager ? 'eager' : 'lazy'}
          {...rest}
        />
      )}

      {/* Fallback Error State — crisp avatar initials if primary & fallback images fail */}
      {status === 'error' && (
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
