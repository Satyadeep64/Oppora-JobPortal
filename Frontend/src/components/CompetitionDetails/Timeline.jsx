import React, { memo } from 'react';
import { FiClock } from 'react-icons/fi';

/**
 * Timeline — Single-responsibility component for rendering competition rounds & schedule
 */
const Timeline = memo(({ rounds = [] }) => {
  if (!Array.isArray(rounds) || rounds.length === 0) return null;

  return (
    <div className="timeline-list">
      {rounds.map((item, idx) => (
        <div key={idx} className="timeline-item">
          <div className="timeline-number">{idx + 1}</div>
          <div className="timeline-content">
            <div className="timeline-header-row">
              <h3 className="timeline-round-title">{item.title || item.round || item.roundTitle}</h3>
              <span className="timeline-date-badge">
                <FiClock /> {item.startDate ? `${item.startDate} - ${item.endDate}` : item.date || item.roundDate}
              </span>
            </div>
            <p className="timeline-description">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
});

Timeline.displayName = 'Timeline';

export default Timeline;
