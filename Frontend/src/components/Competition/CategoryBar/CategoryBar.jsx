import React, { memo, useRef, useEffect, useState, useCallback } from 'react';
import { 
  HiOutlineTrophy, 
  HiCodeBracket, 
  HiQuestionMarkCircle, 
  HiAcademicCap, 
  HiWrenchScrewdriver, 
  HiUserGroup, 
  HiSparkles,
  HiCommandLine,
  HiLightBulb
} from 'react-icons/hi2';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { CATEGORY_OPTIONS } from '../../../constants/competitionConstants';
import './CategoryBar.css';

const ICON_MAP = {
  competitions: <HiOutlineTrophy />,
  hackathons: <HiCodeBracket />,
  workshops: <HiWrenchScrewdriver />,
  quizzes: <HiQuestionMarkCircle />,
  scholarships: <HiAcademicCap />,
  conferences: <HiUserGroup />,
  'cultural-events': <HiSparkles />,
  'coding-contest': <HiCommandLine />,
  'innovation-challenge': <HiLightBulb />
};

/**
 * CategoryBar — Single Responsibility: Renders horizontally scrollable category selection bar.
 */
const CategoryBar = memo(({ selectedCategory, onCategorySelect }) => {
  const containerRef = useRef(null);
  const cardRefs = useRef({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const currentCat = selectedCategory || 'Competitions';

  const checkScrollState = useCallback(() => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    checkScrollState();
    container.addEventListener('scroll', checkScrollState, { passive: true });
    window.addEventListener('resize', checkScrollState);

    return () => {
      container.removeEventListener('scroll', checkScrollState);
      window.removeEventListener('resize', checkScrollState);
    };
  }, [checkScrollState]);

  useEffect(() => {
    const activeCatObj = CATEGORY_OPTIONS.find(
      (cat) => currentCat.toLowerCase() === cat.title.toLowerCase() || currentCat.toLowerCase() === cat.id.toLowerCase()
    );
    if (activeCatObj && cardRefs.current[activeCatObj.id] && containerRef.current) {
      const activeEl = cardRefs.current[activeCatObj.id];
      const container = containerRef.current;
      const targetLeft = activeEl.offsetLeft - container.offsetWidth / 2 + activeEl.offsetWidth / 2;
      container.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: 'smooth'
      });
    }
  }, [currentCat]);

  const handleScroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      containerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="category-section" aria-label="Opportunity categories">
      <div className="category-wrapper">
        {canScrollLeft && (
          <button 
            type="button" 
            className="category-scroll-btn scroll-btn-left" 
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
          >
            <FiChevronLeft />
          </button>
        )}

        <div ref={containerRef} className="category-container">
          {CATEGORY_OPTIONS.map((cat) => {
            const isActive = currentCat.toLowerCase() === cat.title.toLowerCase() || 
                             currentCat.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                ref={(el) => { cardRefs.current[cat.id] = el; }}
                type="button"
                className={`category-card ${isActive ? 'active' : ''}`}
                onClick={() => onCategorySelect && onCategorySelect(cat.title)}
              >
                <div className="category-icon-wrapper">
                  {ICON_MAP[cat.id] || <HiOutlineTrophy />}
                </div>
                <span className="category-title">{cat.title}</span>
              </button>
            );
          })}
        </div>

        {canScrollRight && (
          <button 
            type="button" 
            className="category-scroll-btn scroll-btn-right" 
            onClick={() => handleScroll('right')}
            aria-label="Scroll right"
          >
            <FiChevronRight />
          </button>
        )}
      </div>
    </section>
  );
});

CategoryBar.displayName = 'CategoryBar';

export default CategoryBar;
