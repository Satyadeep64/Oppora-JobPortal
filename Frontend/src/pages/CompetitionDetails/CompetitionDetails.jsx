import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import CompetitionHero from '../../components/Competition/Details/CompetitionHero';
import TabNavigation from '../../components/Competition/Details/TabNavigation';
import TimelineSection from '../../components/Competition/Details/TimelineSection';
import PrizeSection from '../../components/Competition/Details/PrizeSection';
import EligibilitySection from '../../components/Competition/Details/EligibilitySection';
import RulesSection from '../../components/Competition/Details/RulesSection';
import FaqSection from '../../components/Competition/Details/FaqSection';
import RegistrationCard from '../../components/Competition/Details/RegistrationCard';
import OrganizerCard from '../../components/Competition/Details/OrganizerCard';
import FeaturedSection from '../../components/Competition/FeaturedSection/FeaturedSection';
import CompetitionCard from '../../components/Competition/CompetitionCard/CompetitionCard';
import SkeletonCard from '../../components/common/SkeletonCard';
import { useCompetitionDetail } from '../../hooks/useCompetitionDetail';
import { copyToClipboard, sanitizeExternalUrl } from '../../utils/competitionUtils';
import { FiArrowLeft, FiAlertCircle, FiCheck } from 'react-icons/fi';
import './CompetitionDetails.css';

/**
 * CompetitionDetails — Detailed view page featuring scroll-spy sticky tab navigation.
 */
const CompetitionDetails = () => {
  const { id } = useParams();
  const { competition, relatedCompetitions, loading, error } = useCompetitionDetail(id);
  const [activeTab, setActiveTab] = useState('overview');
  const [showToast, setShowToast] = useState(false);
  const isClickingTabRef = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  const detailTabs = useMemo(() => {
    if (!competition) return [];
    const faqsList = competition.faqs || [];
    const roundsList = competition.rounds || competition.timeline || [];
    const prizesList = competition.prizes || [];
    const rulesList = competition.rules || [];

    return [
      { id: 'overview', label: 'Overview', show: Boolean(competition.overview || competition.description) },
      { id: 'timeline', label: 'Timeline', show: Array.isArray(roundsList) && roundsList.length > 0 },
      { id: 'prizes', label: 'Prizes', show: Array.isArray(prizesList) && prizesList.length > 0 },
      { id: 'eligibility', label: 'Eligibility', show: Boolean(competition.eligibility) },
      { id: 'rules', label: 'Rules', show: Array.isArray(rulesList) && rulesList.length > 0 },
      { id: 'faqs', label: 'FAQ', show: Array.isArray(faqsList) && faqsList.length > 0 },
      { id: 'organizer', label: 'Organizer', show: true }
    ];
  }, [competition]);

  // Scroll Spy: Automatically update active tab on scroll
  useEffect(() => {
    if (!competition || loading) return;

    const handleScroll = () => {
      if (isClickingTabRef.current) return;

      const visibleTabs = detailTabs.filter(t => t.show).map(t => t.id);
      const scrollPosition = window.scrollY + 140;

      for (let i = visibleTabs.length - 1; i >= 0; i--) {
        const sectionId = visibleTabs[i];
        const element = document.getElementById(sectionId);
        if (element) {
          const top = element.offsetTop;
          if (scrollPosition >= top) {
            setActiveTab(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [competition, loading, detailTabs]);

  const handleTabClick = (tabId) => {
    isClickingTabRef.current = true;
    setActiveTab(tabId);
    const element = document.getElementById(tabId);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setTimeout(() => {
      isClickingTabRef.current = false;
    }, 600);
  };

  const handleShareClick = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    if (!competition?.officialRegistrationUrl) return;
    const targetUrl = sanitizeExternalUrl(competition.officialRegistrationUrl);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="details-page-wrapper">
      {showToast && (
        <div className="toast-notification">
          <FiCheck className="toast-icon" />
          <span>Link copied to clipboard!</span>
        </div>
      )}

      <div className="details-main-layout">
        <main className="details-center-content">
          <div className="back-navigation-bar">
            <Link to="/competitions" className="back-btn">
              <FiArrowLeft className="back-icon" />
              <span>Back to Competitions</span>
            </Link>
          </div>

          {loading && (
            <div className="details-loading-box">
              <SkeletonCard />
            </div>
          )}

          {!loading && (error || !competition) && (
            <div className="not-found-state-box">
              <FiAlertCircle className="not-found-icon" />
              <h2 className="not-found-title">Opportunity Not Found</h2>
              <p className="not-found-message">
                {error || `The competition with ID #${id} does not exist.`}
              </p>
              <Link to="/competitions" className="back-to-home-btn">
                <FiArrowLeft /> <span>Back to Competitions</span>
              </Link>
            </div>
          )}

          {!loading && !error && competition && (
            <>
              <CompetitionHero competition={competition} onShare={handleShareClick} />

              <TabNavigation
                tabs={detailTabs}
                activeTab={activeTab}
                onTabClick={handleTabClick}
              />

              {(competition.overview || competition.description) && (
                <section id="overview" className="details-section-card">
                  <h2 className="section-title">About the Competition</h2>
                  <p className="section-text">{competition.overview || competition.description}</p>
                </section>
              )}

              <TimelineSection rounds={competition.rounds || competition.timeline} />
              <PrizeSection prizes={competition.prizes} prizesTotal={competition.prizesTotal} />
              <EligibilitySection 
                eligibility={competition.eligibility}
                teamSize={competition.teamSize}
                mode={competition.mode}
                location={competition.location}
                registrationFee={competition.registrationFee}
              />
              <RulesSection rules={competition.rules} />
              <FaqSection faqs={competition.faqs} />
              <OrganizerCard competition={competition} />

              {relatedCompetitions.length > 0 && (
                <section className="details-section-card">
                  <h2 className="section-title">Similar Opportunities</h2>
                  <div className="related-cards-stack">
                    {relatedCompetitions.map((item) => (
                      <CompetitionCard key={item.id} {...item} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>

        {!loading && !error && competition && (
          <aside className="details-right-column">
            <RegistrationCard
              competition={competition}
              onShare={handleShareClick}
              onRegister={handleRegisterClick}
            />
            <FeaturedSection />
          </aside>
        )}
      </div>
    </div>
  );
};

export default CompetitionDetails;
