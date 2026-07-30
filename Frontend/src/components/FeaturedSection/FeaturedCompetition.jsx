import React, { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiBriefcase, FiClock, FiTag, FiUsers } from 'react-icons/fi';
import CompanyLogo from '../common/CompanyLogo';
import competitionService from '../../services/competitionService';

const getStatusBadge = (item) => {
  const status = item.status;
  const days = item.daysLeft || item.deadline || '';

  if (status === 'Closing Soon' || days.toLowerCase().includes('closing') || days.toLowerCase().includes('3 days') || days.toLowerCase().includes('5 days')) {
    return { label: 'Closing Soon', className: 'status-closing' };
  }
  if (status === 'Closed' || days.toLowerCase().includes('closed')) {
    return { label: 'Closed', className: 'status-closed' };
  }
  return { label: 'Open', className: 'status-open' };
};

/**
 * FeaturedCompetition — Single-responsibility component for rendering an individual featured item
 */
const FeaturedCompetition = memo(({ item }) => {
  if (!item) return null;

  const statusObj = getStatusBadge(item);

  const handleHover = useCallback(() => {
    if (item.id) {
      import('../../pages/CompetitionDetails/CompetitionDetails');
      competitionService.prefetchCompetitionById(item.id);
    }
  }, [item.id]);

  return (
    <Link
      to={`/competitions/${item.id}`}
      className="featured-item-card"
      onMouseEnter={handleHover}
      onFocus={handleHover}
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
            <span className={`featured-status-badge ${statusObj.className}`}>
              {statusObj.label}
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

FeaturedCompetition.displayName = 'FeaturedCompetition';

export default FeaturedCompetition;
