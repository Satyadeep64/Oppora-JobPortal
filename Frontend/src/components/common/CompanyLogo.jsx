import React, { memo } from 'react';
import LazyImage from './LazyImage';

/**
 * CompanyLogo — Single-responsibility component for rendering organization logos with fallback UI avatars
 *  - Enforces object-fit: contain to prevent logo distortion
 *  - Maintains 1:1 square aspect ratio & fixed dimensions to prevent layout shifts (CLS)
 *  - Supports high-resolution HiDPI sizing & automatic fallback UI avatar generation
 */
const CompanyLogo = memo(({
  src,
  organization = 'Oppora',
  size = 44,
  borderRadius = '10px',
  className = '',
  wrapperClassName = '',
  eager = true
}) => {
  const cleanOrg = organization || 'Oppora';
  const avatarSize = typeof size === 'number' ? Math.max(120, size * 2) : 120;
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanOrg.substring(0, 2).toUpperCase())}&size=${avatarSize}&background=1c4980&color=fff&bold=true&format=png`;

  const finalSrc = src || fallbackUrl;
  const dimension = typeof size === 'number' ? `${size}px` : size;

  return (
    <div 
      className={`company-logo-container ${wrapperClassName}`}
      style={{
        width: dimension,
        height: dimension,
        maxWidth: dimension,
        maxHeight: dimension,
        borderRadius,
        flexShrink: 0,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}
    >
      <LazyImage
        src={finalSrc}
        alt={cleanOrg}
        className={className}
        objectFit="contain"
        objectPosition="center"
        aspectRatio="1/1"
        eager={eager}
        fallbackSrc={fallbackUrl}
        targetWidth={160}
      />
    </div>
  );
});

CompanyLogo.displayName = 'CompanyLogo';

export default CompanyLogo;
