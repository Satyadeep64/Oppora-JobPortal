import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiBriefcase, FiClock, FiTag, FiUsers } from 'react-icons/fi';
import CompanyLogo from '../../common/CompanyLogo';
import { getCompetitionStatusBadge } from '../../../utils/competitionUtils';

/**
 * FeaturedCard — Single Responsibility: Renders an individual featured competition row item.
 */
const FeaturedCard = memo(({ item }) => {
  if (!item) return null;

  const statusBadge = getCompetitionStatusBadge(item);

  return (
    <Link
      to={`/competitions/${item.id}`}
      className="featured-item-card"
    >
      <CompanyLogo
        src={item.logo}
        organization={item.organization || item.title}
        size={44}
        borderRadius="12px"
        wrapperClassName="featured-item-logo-wrapper"
        className="featured-item-logo"
      />

      <div className="featured-item-info">
        <div className="featured-item-content-body">
          <h4 className="featured-item-title">{item.title}</h4>

          <div className="featured-item-org">
            <FiBriefcase className="featured-mini-icon" />
            <span className="featured-org-name">{item.organization}</span>
          </div>

          <div className="featured-item-badges-row">
            <span className={`featured-status-badge ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
            {item.category && (
              <span className="featured-item-category">
                <FiTag className="featured-mini-icon" />
                <span>{item.category}</span>
              </span>
            )}
          </div>
        </div>

        <div className="featured-item-meta-row">
          {(item.daysLeft || item.deadline) && (
            <span className="featured-item-deadline">
              <FiClock className="featured-mini-icon" />
              <span>{item.daysLeft || item.deadline}</span>
            </span>
          )}
          {item.registeredCount && (
            <span className="featured-item-registered">
              <FiUsers className="featured-mini-icon" />
              <span>{item.registeredCount}</span>
            </span>
          )}
        </div>
      </div>

      <FiChevronRight className="featured-arrow-icon" />
    </Link>
  );
});

FeaturedCard.displayName = 'FeaturedCard';

export default FeaturedCard;
