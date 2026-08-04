import React, { useState, useEffect, useCallback, memo } from 'react';
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
import CompanyLogo from '../common/CompanyLogo';
import LazyImage from '../common/LazyImage';
import competitionService from '../../services/competitionService';
import './CompetitionCard.css';

const CompetitionCard = memo(({
  id = 1,
  logo = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
  banner = null,
  title = 'National AI & Innovation Hackathon 2026',
  organization = 'Google Cloud & IIT Bombay',
  members = '1 - 4 Members',
  location = 'Online',
  categories = ['Engineering', 'AI / ML', 'Hiring Challenge'],
  postedDate = 'Posted 2 days ago',
  daysLeft = '3 Days Left',
  registeredCount = '1,840 Registered',
  status = 'Open',
  difficulty = 'Intermediate',
  popularityBadge = 'Featured',
  isBookmarked: initialBookmarked = false,
  onBookmark,
  onShare,
}) => {
  const [bookmarked, setBookmarked] = useState(() => {
    return initialBookmarked || competitionService.isBookmarked(id);
  });
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);

  // Sync bookmark state when global event fires
  useEffect(() => {
    const handleBookmarkChange = (e) => {
      if (e?.detail && String(e.detail.id) === String(id)) {
        setBookmarked(e.detail.bookmarked);
      }
    };
    window.addEventListener('oppora:bookmark-change', handleBookmarkChange);
    return () => window.removeEventListener('oppora:bookmark-change', handleBookmarkChange);
  }, [id]);

  const handleMouseEnter = useCallback(() => {
    if (id) {
      import('../../pages/CompetitionDetails/CompetitionDetails');
      competitionService.prefetchCompetitionById(id);
    }
  }, [id]);

  const handleCardClick = useCallback(() => {
    if (id) {
      navigate(`/competitions/${id}`);
    }
  }, [id, navigate]);

  const handleBookmarkClick = useCallback((e) => {
    e.stopPropagation();
    const newStatus = competitionService.toggleBookmark(id);
    setBookmarked(newStatus);
    if (onBookmark) onBookmark(newStatus);
  }, [id, onBookmark]);

  const handleShareClick = useCallback(async (e) => {
    e.stopPropagation();
    if (onShare) {
      onShare();
    } else {
      const shareUrl = `${window.location.origin}/competitions/${id}`;
      const success = await competitionService.copyToClipboard(shareUrl);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  }, [id, onShare]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  }, [handleCardClick]);

  return (
    <article 
      className="competition-card" 
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onFocus={handleMouseEnter}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${title}`}
    >
      {/* Optional Top Card Banner */}
      {banner && (
        <div className="card-banner-wrapper">
          <LazyImage
            src={banner}
            alt={`${title} banner`}
            className="card-banner-img"
            wrapperStyle={{ width: '100%', height: '84px', borderRadius: '12px 12px 0 0', overflow: 'hidden' }}
            objectFit="cover"
            eager={false}
            fallbackSrc="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
          />
        </div>
      )}

      {/* Top Header Row: Logo + Badges + Actions */}
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
            {status && (
              <span className={`status-pill status-${status.toLowerCase().replace(/[^a-z]/g, '')}`}>
                {status === 'Closing Soon' ? 'Closing Soon' : status === 'Closed' || status === 'Registration Closed' ? 'Registration Closed' : 'Open'}
              </span>
            )}
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

      {/* Main Content Info */}
      <div className="card-body">
        <h3 className="card-title">{title}</h3>
        
        <div className="card-organization">
          <FiBriefcase className="meta-icon" />
          <span>{organization}</span>
        </div>

        {/* Details Meta Info */}
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

        {/* Category Chips */}
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

      {/* Card Footer */}
      <div className="card-footer">
        <span className="posted-date">{postedDate}</span>
        <span className="registered-badge">{registeredCount}</span>
      </div>
    </article>
  );
});

CompetitionCard.displayName = 'CompetitionCard';

export default CompetitionCard;
