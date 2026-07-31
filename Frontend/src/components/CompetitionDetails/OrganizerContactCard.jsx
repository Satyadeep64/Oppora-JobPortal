import React, { memo } from 'react';
import { FiMail, FiGlobe } from 'react-icons/fi';
import { isValidHttpUrl } from '../../utils/urlUtils';

const OrganizerContactCard = memo(({ competition }) => {
  if (!competition) return null;

  const validWebUrl = isValidHttpUrl(competition.officialRegistrationUrl) ? competition.officialRegistrationUrl : null;

  return (
    <div className="organizer-contact-card">
      <div className="organizer-left">
        <img
          src={competition.logo || 'https://picsum.photos/200/200?random=1'}
          alt={competition.organization}
          className="organizer-avatar"
        />
        <div>
          <h4 className="organizer-name">{competition.organization}</h4>
          <p className="organizer-badge-text">Official Verified Host • Oppora Partner</p>
        </div>
      </div>

      <div className="organizer-actions">
        <a
          href={`mailto:support@${(competition.organization || 'oppora').toLowerCase().replace(/[^a-z]/g, '')}.org`}
          className="contact-action-btn email-btn"
        >
          <FiMail /> Contact Host
        </a>

        {validWebUrl && (
          <a
            href={validWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-action-btn website-btn"
          >
            <FiGlobe /> Official Site
          </a>
        )}
      </div>
    </div>
  );
});

OrganizerContactCard.displayName = 'OrganizerContactCard';

export default OrganizerContactCard;
