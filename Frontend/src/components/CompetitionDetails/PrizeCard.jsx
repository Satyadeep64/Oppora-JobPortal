import React, { memo } from 'react';
import { FiAward } from 'react-icons/fi';

/**
 * PrizeCard — Single-responsibility component for rendering competition rank rewards
 */
const PrizeCard = memo(({ prize, rank = 1 }) => {
  if (!prize) return null;

  return (
    <div className={`prize-card rank-${rank}`}>
      <FiAward className="prize-card-icon" />
      <div className="prize-card-info">
        <h4 className="prize-position">{prize.position || prize.rank || prize.positionName}</h4>
        <p className="prize-reward">{prize.reward || prize.rewardDescription}</p>
      </div>
    </div>
  );
});

PrizeCard.displayName = 'PrizeCard';

export default PrizeCard;
