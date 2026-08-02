import React, { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiBookmark, 
  FiShare2, 
  FiUsers, 
  FiMapPin, 
  FiClock, 
  FiBriefcase 
} from 'react-icons/fi';
import { HiBookmark, HiSparkles } from 'react-icons/hi2';
import CompanyLogo from '../../common/CompanyLogo';
import LazyImage from '../../common/LazyImage';
import { useBookmarks } from '../../../context/BookmarkContext';
import { 
  getCompetitionStatusBadge, 
  formatRegisteredCount, 
  copyToClipboard 
} from '../../../utils/competitionUtils';
import './CompetitionCard.css';

/**
 * CompetitionCard — Single Responsibility: Renders a clean individual competition card in feed lists.
 */
const CompetitionCard = memo(({
  id,
  logo = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
  banner = null,
  title = 'National Hackathon',
  organization = 'Oppora Organization',
  members = '1 - 4 Members',
  location = 'Online',
  categories = ['Engineering'],
  postedDate = 'Posted recently',
  daysLeft = 'Closing Soon',
  registeredCount = 1200,
  status = 'Open',
  difficulty = 'Intermediate',
  popularityBadge = null,
}) => {
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(id);
  const [copied, setCopied] = useState(false);

  const statusBadge = getCompetitionStatusBadge({ status, daysLeft, deadline: daysLeft });
  const regCountText = formatRegisteredCount(registeredCount);

  const handleCardClick = useCallback(() => {
    if (id) {
      navigate(`/competitions/${id}`);
    }
  }, [id, navigate]);

  const handleBookmarkClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (id) {
        toggleBookmark(id);
      }
    },
    [id, toggleBookmark]
  );

  const handleShareClick = useCallback(
    async (e) => {
      e.stopPropagation();
      const shareUrl = `${window.location.origin}/competitions/${id}`;
      const success = await copyToClipboard(shareUrl);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
    [id]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardClick();
      }
    },
    [handleCardClick]
  );

  return (
    <article 
      className="competition-card" 
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${title}`}
    >
      {banner && (
        <div className="card-banner-wrapper">
          <LazyImage
            src={banner}
            alt={`${title} banner`}
            className="card-banner-img"
            wrapperStyle={{ width: '100%', height: '84px', borderRadius: '12px 12px 0 0', overflow: 'hidden' }}
            objectFit="cover"
            eager={false}
          />
        </div>
      )}

      <div className="card-header">
        <div className="card-header-left">
          <CompanyLogo 
            src={logo} 
            organization={organization} 
            size={52} 
            wrapperClassName="card-logo-wrapper"
            className="card-logo"
            eager={false}
          />

          <div className="card-top-badges">
            {popularityBadge && (
              <span className={`pop-badge pop-${popularityBadge.toLowerCase().replace(/[^a-z]/g, '')}`}>
                <HiSparkles className="pop-icon" /> {popularityBadge}
              </span>
            )}
            <span className={`status-pill ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
          </div>
        </div>

        <div className="card-actions">
          <button 
            type="button" 
            className={`action-btn bookmark-btn ${bookmarked ? 'bookmarked' : ''}`}
            onClick={handleBookmarkClick}
            title={bookmarked ? 'Remove Bookmark' : 'Bookmark Competition'}
            aria-label="Bookmark competition"
          >
            {bookmarked ? <HiBookmark /> : <FiBookmark />}
          </button>
          <button 
            type="button" 
            className="action-btn share-btn"
            onClick={handleShareClick}
            title={copied ? 'Link Copied!' : 'Share Competition'}
            aria-label="Share competition"
          >
            <FiShare2 />
          </button>
        </div>
      </div>

      <div className="card-body">
        <h3 className="card-title">{title}</h3>
        
        <div className="card-organization">
          <FiBriefcase className="meta-icon" />
          <span>{organization}</span>
        </div>

        <div className="card-meta-list">
          <div className="meta-item">
            <FiUsers className="meta-icon" />
            <span>{members}</span>
          </div>
          <div className="meta-item">
            <FiMapPin className="meta-icon" />
            <span>{location}</span>
          </div>
          {difficulty && (
            <div className="meta-item difficulty-meta-item">
              <span className={`diff-dot diff-${difficulty.toLowerCase()}`} />
              <span>{difficulty}</span>
            </div>
          )}
          <div className="meta-item days-left-badge">
            <FiClock className="meta-icon" />
            <span>{daysLeft}</span>
          </div>
        </div>

        {categories && categories.length > 0 && (
          <div className="card-chips">
            {categories.map((chip, index) => (
              <span key={index} className="category-chip">
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="card-footer">
        <span className="posted-date">{postedDate}</span>
        <span className="registered-badge">{regCountText}</span>
      </div>
    </article>
  );
});

CompetitionCard.displayName = 'CompetitionCard';

export default CompetitionCard;
