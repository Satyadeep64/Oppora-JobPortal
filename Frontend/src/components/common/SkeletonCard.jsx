import React, { memo } from 'react';
import './SkeletonCard.css';

const SkeletonCard = memo(() => {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-header">
        <div className="skeleton-box skeleton-logo"></div>
        <div className="skeleton-actions">
          <div className="skeleton-box skeleton-circle"></div>
          <div className="skeleton-box skeleton-circle"></div>
        </div>
      </div>
      <div className="skeleton-body">
        <div className="skeleton-box skeleton-title"></div>
        <div className="skeleton-box skeleton-subtitle"></div>
        <div className="skeleton-meta-row">
          <div className="skeleton-box skeleton-badge"></div>
          <div className="skeleton-box skeleton-badge"></div>
        </div>
        <div className="skeleton-chips-row">
          <div className="skeleton-box skeleton-chip"></div>
          <div className="skeleton-box skeleton-chip"></div>
          <div className="skeleton-box skeleton-chip"></div>
        </div>
      </div>
      <div className="skeleton-footer">
        <div className="skeleton-box skeleton-footer-line"></div>
      </div>
    </div>
  );
});

SkeletonCard.displayName = 'SkeletonCard';

export default SkeletonCard;

