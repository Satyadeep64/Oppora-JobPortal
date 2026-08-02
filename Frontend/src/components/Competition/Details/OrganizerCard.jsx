import React, { memo } from 'react';
import OrganizerContactCardInner from '../../CompetitionDetails/OrganizerContactCard';

/**
 * OrganizerCard — Single Responsibility: Renders organizer contact info section.
 */
const OrganizerCard = memo(({ competition }) => {
  if (!competition) return null;

  return (
    <section id="organizer" className="details-section-card">
      <h2 className="section-title">Organizer Information</h2>
      <OrganizerContactCardInner competition={competition} />
    </section>
  );
});

OrganizerCard.displayName = 'OrganizerCard';

export default OrganizerCard;
