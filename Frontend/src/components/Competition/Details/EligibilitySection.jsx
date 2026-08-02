import React, { memo } from 'react';
import EligibilityCard from '../../CompetitionDetails/EligibilityCard';

/**
 * EligibilitySection — Single Responsibility: Renders eligibility criteria section.
 */
const EligibilitySection = memo(({ eligibility, teamSize, mode, location, registrationFee }) => {
  if (!eligibility) return null;

  return (
    <section id="eligibility" className="details-section-card">
      <h2 className="section-title">Eligibility Criteria</h2>
      <EligibilityCard 
        eligibility={eligibility} 
        teamSize={teamSize} 
        mode={mode} 
        location={location} 
        registrationFee={registrationFee} 
      />
    </section>
  );
});

EligibilitySection.displayName = 'EligibilitySection';

export default EligibilitySection;
