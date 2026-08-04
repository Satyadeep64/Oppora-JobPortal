import React, { memo } from 'react';
import { FiClock, FiBookmark, FiShare2 } from 'react-icons/fi';
import { HiBookmark } from 'react-icons/hi2';

const RegistrationCard = memo(({ 
  competition, 
  bookmarked, 
  onBookmarkToggle, 
  onShare, 
  onRegister 
}) => {
  if (!competition) return null;

  return (
    <>
      {/* Desktop Sticky Registration Sidebar */}
      <div className="sticky-register-card">
        <div className="register-card-header">
          <span className="free-badge">{competition.registrationFee || 'Free Entry'}</span>
          <span className="registered-stat">{(competition.registeredCount || 1200).toLocaleString()} Registered</span>
        </div>

        <button
          type="button"
          className="register-now-btn"
          onClick={onRegister}
        >
          Register Now
        </button>

        {(competition.deadline || competition.daysLeft) && (
          <div className="register-deadline-row">
            <FiClock className="deadline-icon" />
            <span>Deadline: {competition.deadline || '29 Aug 2026'} ({competition.daysLeft || '29 Days Left'})</span>
          </div>
        )}

        <div className="register-actions-row">
          <button
            type="button"
            className="secondary-action-btn"
            onClick={onBookmarkToggle}
          >
            {bookmarked ? <HiBookmark style={{ color: '#d97706' }} /> : <FiBookmark />}
            <span>{bookmarked ? 'Saved' : 'Bookmark'}</span>
          </button>

          <button
            type="button"
            className="secondary-action-btn"
            onClick={onShare}
          >
            <FiShare2 />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="mobile-bottom-cta-bar">
        <div className="mobile-cta-info">
          <span className="mobile-cta-fee">{competition.registrationFee || 'Free Entry'}</span>
          <span className="mobile-cta-deadline">{competition.daysLeft || competition.deadline || 'Closing Soon'}</span>
        </div>

        <button
          type="button"
          className="mobile-cta-register-btn"
          onClick={onRegister}
        >
          Register Now
        </button>
      </div>
    </>
  );
});

RegistrationCard.displayName = 'RegistrationCard';

export default RegistrationCard;
