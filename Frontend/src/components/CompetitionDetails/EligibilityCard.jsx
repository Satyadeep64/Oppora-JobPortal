import React, { memo } from 'react';
import { FiAward, FiUsers, FiGlobe, FiCheckCircle } from 'react-icons/fi';

/**
 * EligibilityCard — Single-responsibility component for rendering eligibility requirements grid
 */
const EligibilityCard = memo(({ eligibility, teamSize, mode, location, registrationFee }) => {
  return (
    <div className="eligibility-cards-grid">
      {eligibility && (
        <div className="eligibility-card">
          <FiAward className="elig-card-icon" />
          <div>
            <h4 className="elig-card-title">Eligible Candidates & Batches</h4>
            <p className="elig-card-text">
              {Array.isArray(eligibility) ? eligibility.join(' • ') : typeof eligibility === 'object' ? `${eligibility.degreeRequirement || ''} ${eligibility.batchRequirement || ''} ${eligibility.domainSpecialization || ''}`.trim() : eligibility}
            </p>
          </div>
        </div>
      )}

      {teamSize && (
        <div className="eligibility-card">
          <FiUsers className="elig-card-icon" />
          <div>
            <h4 className="elig-card-title">Team Composition</h4>
            <p className="elig-card-text">{teamSize}</p>
          </div>
        </div>
      )}

      {(mode || location) && (
        <div className="eligibility-card">
          <FiGlobe className="elig-card-icon" />
          <div>
            <h4 className="elig-card-title">Mode & Location</h4>
            <p className="elig-card-text">{mode ? `${mode} — ${location || ''}` : location}</p>
          </div>
        </div>
      )}

      <div className="eligibility-card">
        <FiCheckCircle className="elig-card-icon" />
        <div>
          <h4 className="elig-card-title">Fee Requirement</h4>
          <p className="elig-card-text">{registrationFee || 'Free Entry'}</p>
        </div>
      </div>
    </div>
  );
});

EligibilityCard.displayName = 'EligibilityCard';

export default EligibilityCard;
