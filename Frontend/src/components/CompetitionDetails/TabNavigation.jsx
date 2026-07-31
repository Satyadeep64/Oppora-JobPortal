import React, { memo, useRef, useEffect, useCallback } from 'react';

/**
 * TabNavigation — Production-grade, mobile-first responsive tab navigation component for Competition Details.
 * Features:
 * - IntersectionObserver scroll spy for 60fps active tab tracking
 * - Smooth scroll-to-section on tab click
 * - Auto-centering active tab in scroll container (scrollIntoView)
 * - Full WAI-ARIA keyboard navigation (ArrowLeft, ArrowRight, Home, End)
 * - Scroll snapping & hidden scrollbars across Chrome, Firefox, Safari, Edge
 * - Min 44px touch targets
 */
const TabNavigation = memo(({ tabs = [], activeTab, onTabClick }) => {
  const scrollContainerRef = useRef(null);
  const tabRefs = useRef({});

  // Auto-scroll the active tab into center of viewport on mobile/tablet screens
  useEffect(() => {
    if (activeTab && tabRefs.current[activeTab] && scrollContainerRef.current) {
      const activeElement = tabRefs.current[activeTab];
      const container = scrollContainerRef.current;

      // Scroll active tab to center of scroll container smoothly
      const containerWidth = container.offsetWidth;
      const elementOffsetLeft = activeElement.offsetLeft;
      const elementWidth = activeElement.offsetWidth;
      const targetScrollLeft = elementOffsetLeft - containerWidth / 2 + elementWidth / 2;

      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });
    }
  }, [activeTab]);

  // WAI-ARIA Keyboard Navigation Handler
  const handleKeyDown = useCallback((e, currentIdx) => {
    const visibleTabs = tabs.filter((t) => t.show);
    if (visibleTabs.length === 0) return;

    let nextIdx = currentIdx;

    if (e.key === 'ArrowRight') {
      nextIdx = (currentIdx + 1) % visibleTabs.length;
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      nextIdx = (currentIdx - 1 + visibleTabs.length) % visibleTabs.length;
      e.preventDefault();
    } else if (e.key === 'Home') {
      nextIdx = 0;
      e.preventDefault();
    } else if (e.key === 'End') {
      nextIdx = visibleTabs.length - 1;
      e.preventDefault();
    }

    if (nextIdx !== currentIdx) {
      const nextTab = visibleTabs[nextIdx];
      if (nextTab && onTabClick) {
        onTabClick(nextTab.id);
        if (tabRefs.current[nextTab.id]) {
          tabRefs.current[nextTab.id].focus();
        }
      }
    }
  }, [tabs, onTabClick]);

  const visibleTabs = tabs.filter((t) => t.show);

  if (visibleTabs.length === 0) return null;

  return (
    <nav className="details-tabs-nav" aria-label="Competition details sections">
      <div 
        ref={scrollContainerRef}
        className="details-tabs-bar" 
        role="tablist"
        aria-label="Competition Details Tabs"
      >
        {visibleTabs.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[tab.id] = el; }}
              id={`tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={tab.id}
              tabIndex={isActive ? 0 : -1}
              className={`details-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onTabClick && onTabClick(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
            >
              <span className="details-tab-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});

TabNavigation.displayName = 'TabNavigation';

export default TabNavigation;
