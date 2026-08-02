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
import './CategorySection.css';

const CategorySection = memo(({ selectedCategory, onCategorySelect }) => {
  const containerRef = useRef(null);
  const cardRefs = useRef({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const categories = [
    { id: 'competitions', title: 'Competitions', icon: <HiOutlineTrophy /> },
    { id: 'hackathons', title: 'Hackathons', icon: <HiCodeBracket /> },
    { id: 'workshops', title: 'Workshops', icon: <HiWrenchScrewdriver /> },
    { id: 'quizzes', title: 'Quizzes', icon: <HiQuestionMarkCircle /> },
    { id: 'scholarships', title: 'Scholarships', icon: <HiAcademicCap /> },
    { id: 'conferences', title: 'Conferences', icon: <HiUserGroup /> },
    { id: 'cultural-events', title: 'Cultural Events', icon: <HiSparkles /> },
    { id: 'coding-contest', title: 'Coding Contest', icon: <HiCommandLine /> },
    { id: 'innovation-challenge', title: 'Innovation Challenge', icon: <HiLightBulb /> },
  ];

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

  // Smoothly scroll active category card into center view automatically on click/selection
  useEffect(() => {
    const activeCatObj = categories.find(
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

  const handleCardClick = (catTitle) => {
    if (onCategorySelect) {
      onCategorySelect(catTitle);
    }
  };

  return (
    <section className="category-section" aria-label="Opportunity categories">
      <div className="category-wrapper">
        {/* Desktop Left Scroll Navigation Button */}
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

        {/* 100% Horizontal Scrollable Track */}
        <div ref={containerRef} className="category-container">
          {categories.map((cat) => {
            const isActive = currentCat.toLowerCase() === cat.title.toLowerCase() || 
                             currentCat.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                ref={(el) => { cardRefs.current[cat.id] = el; }}
                type="button"
                className={`category-card ${isActive ? 'active' : ''}`}
                onClick={() => handleCardClick(cat.title)}
              >
                <div className="category-icon-wrapper">
                  {cat.icon}
                </div>
                <span className="category-title">{cat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Desktop Right Scroll Navigation Button */}
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

CategorySection.displayName = 'CategorySection';

export default CategorySection;
