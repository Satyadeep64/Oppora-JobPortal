import React, { memo } from 'react';
import LazyImage from '../../common/LazyImage';
import CompanyLogo from '../../common/CompanyLogo';
import { 
  FiClock, 
  FiBookmark, 
  FiShare2, 
  FiMapPin, 
  FiUsers, 
  FiAward, 
  FiBriefcase, 
  FiCheckCircle 
} from 'react-icons/fi';
import { HiBookmark } from 'react-icons/hi2';
import { useBookmarks } from '../../../context/BookmarkContext';

/**
 * CompetitionHero — Single Responsibility: Renders detail page header banner, host logo, title, and meta badges.
 */
const CompetitionHero = memo(({ competition, onShare }) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  if (!competition) return null;

  const bookmarked = isBookmarked(competition.id);

  return (
    <div className="details-header-card">
      <div
        className="details-banner-zone"
        style={{
          background: (() => {
            const seed = (competition.organization || 'OR').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
            const h1 = seed % 360;
            const h2 = (h1 + 40) % 360;
            return `linear-gradient(135deg, hsl(${h1},60%,28%) 0%, hsl(${h2},70%,42%) 100%)`;
          })()
        }}
      >
        {competition.banner && (
          <LazyImage
            src={competition.banner}
            alt={`${competition.title} banner`}
            className="details-banner-img"
            wrapperStyle={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
            objectFit="cover"
            eager={true}
          />
        )}

        {(competition.daysLeft || competition.deadline) && (
          <div className="banner-deadline-badge">
            <FiClock className="banner-deadline-icon" />
            <span>{competition.daysLeft || competition.deadline}</span>
          </div>
        )}

        <div className="banner-category-badge">
          {competition.category || 'Competitions'}
        </div>
      </div>

      <div className="header-below-banner">
        <div className="details-logo-wrapper">
          <CompanyLogo
            src={competition.logo}
            organization={competition.organization}
            size={84}
            borderRadius="16px"
            wrapperClassName="details-logo-lazy"
            className="details-logo"
            eager={true}
          />
        </div>

        <div className="details-header-actions">
          <button
            type="button"
            className={`details-action-btn ${bookmarked ? 'bookmarked' : ''}`}
            onClick={() => toggleBookmark(competition.id)}
            title={bookmarked ? 'Remove Bookmark' : 'Save Competition'}
            aria-label="Toggle bookmark"
          >
            {bookmarked ? <HiBookmark style={{ color: '#d97706' }} /> : <FiBookmark />}
          </button>

          <button
            type="button"
            className="details-action-btn"
            onClick={onShare}
            title="Share Opportunity"
            aria-label="Share Opportunity"
          >
            <FiShare2 />
          </button>
        </div>
      </div>

      <h1 className="details-title">{competition.title}</h1>
      <div className="details-organization">
        <span>{competition.organization}</span>
        <span className="verified-badge">
          <FiCheckCircle /> Verified Host
        </span>
      </div>

      <div className="details-meta-grid">
        <div className="meta-pill">
          <FiMapPin className="meta-pill-icon" />
          <div>
            <span className="meta-pill-label">Location / Mode</span>
            <span className="meta-pill-value">{competition.mode || 'Online'} ({competition.location || 'India'})</span>
          </div>
        </div>

        <div className="meta-pill">
          <FiUsers className="meta-pill-icon" />
          <div>
            <span className="meta-pill-label">Team Format</span>
            <span className="meta-pill-value">{competition.teamSize || '1 - 4 Members'}</span>
          </div>
        </div>

        <div className="meta-pill">
          <FiBriefcase className="meta-pill-icon" />
          <div>
            <span className="meta-pill-label">Entry Fee</span>
            <span className="meta-pill-value">{competition.registrationFee || 'Free Entry'}</span>
          </div>
        </div>

        <div className="meta-pill highlight-pill">
          <FiAward className="meta-pill-icon" />
          <div>
            <span className="meta-pill-label">Registered Coders</span>
            <span className="meta-pill-value">{(competition.registeredCount || 1200).toLocaleString()} Applied</span>
          </div>
        </div>
      </div>

      {competition.tags && competition.tags.length > 0 && (
        <div className="details-chips-list">
          {competition.tags.map((tag, idx) => (
            <span key={idx} className="details-category-chip">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
});

CompetitionHero.displayName = 'CompetitionHero';

export default CompetitionHero;
