import React, { memo } from 'react';
import { 
  FiInfo, 
  FiCalendar, 
  FiAward, 
  FiCheckCircle, 
  FiHelpCircle, 
  FiUser 
} from 'react-icons/fi';

/**
 * Icon resolver helper for detail tabs
 */
const getTabIcon = (id) => {
  switch (id) {
    case 'overview':
      return <FiInfo className="tab-icon" />;
    case 'timeline':
    case 'rounds':
      return <FiCalendar className="tab-icon" />;
    case 'prizes':
      return <FiAward className="tab-icon" />;
    case 'eligibility':
      return <FiCheckCircle className="tab-icon" />;
    case 'faqs':
      return <FiHelpCircle className="tab-icon" />;
    case 'organizer':
      return <FiUser className="tab-icon" />;
    default:
      return null;
  }
};

/**
 * TabNavigation — Single Responsibility: Renders sticky detail tabs navigation bar.
 */
const TabNavigation = memo(({ tabs = [], activeTab, onTabClick }) => {
  if (!tabs || tabs.length === 0) return null;

  return (
    <nav className="details-tabs-nav" aria-label="Competition details navigation">
      <div className="details-tabs-bar">
        {tabs.filter(t => t.show).map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`details-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabClick && onTabClick(tab.id)}
          >
            {getTabIcon(tab.id)}
            <span className="details-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
});

TabNavigation.displayName = 'TabNavigation';

export default TabNavigation;
