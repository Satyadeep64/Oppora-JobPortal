import React, { memo } from 'react';
import Timeline from '../../CompetitionDetails/Timeline';

/**
 * TimelineSection — Single Responsibility: Renders rounds timeline section.
 */
const TimelineSection = memo(({ rounds = [] }) => {
  if (!Array.isArray(rounds) || rounds.length === 0) return null;

  return (
    <section id="timeline" className="details-section-card">
      <h2 className="section-title">Rounds & Timeline</h2>
      <Timeline rounds={rounds} />
    </section>
  );
});

TimelineSection.displayName = 'TimelineSection';

export default TimelineSection;
