import React, { memo } from 'react';
import RegistrationCardInner from '../../CompetitionDetails/RegistrationCard';
import { useBookmarks } from '../../../context/BookmarkContext';

/**
 * RegistrationCard — Single Responsibility: Renders registration sidebar widget with sticky CTA.
 */
const RegistrationCard = memo(({ competition, onShare, onRegister }) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  if (!competition) return null;

  const bookmarked = isBookmarked(competition.id);

  return (
    <RegistrationCardInner
      competition={competition}
      bookmarked={bookmarked}
      onBookmarkToggle={() => toggleBookmark(competition.id)}
      onShare={onShare}
      onRegister={onRegister}
    />
  );
});

RegistrationCard.displayName = 'RegistrationCard';

export default RegistrationCard;
