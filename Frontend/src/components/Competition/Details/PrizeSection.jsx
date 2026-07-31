import React, { memo } from 'react';
import PrizeCard from '../../CompetitionDetails/PrizeCard';
import { HiSparkles } from 'react-icons/hi2';

/**
 * PrizeSection — Single Responsibility: Renders prizes and rewards section.
 */
const PrizeSection = memo(({ prizes = [], prizesTotal }) => {
  if (!Array.isArray(prizes) || prizes.length === 0) return null;

  return (
    <section id="prizes" className="details-section-card">
      <h2 className="section-title">Prizes & Rewards</h2>
      {prizesTotal && (
        <div className="prize-pool-banner">
          <HiSparkles className="banner-sparkle" />
          <div>
            <span>Total Prize Pool Value:</span>
            <strong>{prizesTotal}</strong>
          </div>
        </div>
      )}
      <div className="prizes-grid">
        {prizes.map((prize, idx) => (
          <PrizeCard key={idx} prize={prize} rank={idx + 1} />
        ))}
      </div>
    </section>
  );
});

PrizeSection.displayName = 'PrizeSection';

export default PrizeSection;
