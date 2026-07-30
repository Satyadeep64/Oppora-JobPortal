import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import FeaturedSection from '../../components/FeaturedSection/FeaturedSection';
import CompetitionCard from '../../components/CompetitionCard/CompetitionCard';
import SkeletonCard from '../../components/common/SkeletonCard';
import LazyImage from '../../components/common/LazyImage';
import CompanyLogo from '../../components/common/CompanyLogo';
import PrizeCard from '../../components/CompetitionDetails/PrizeCard';
import Timeline from '../../components/CompetitionDetails/Timeline';
import EligibilityCard from '../../components/CompetitionDetails/EligibilityCard';
import TabNavigation from '../../components/CompetitionDetails/TabNavigation';
import competitionService from '../../services/competitionService';
import { getCompetitionById as getLocalCompetitionById, getAllCompetitions as getLocalAllCompetitions } from '../../data/competitionData';




import { 
  FiArrowLeft, 
  FiBookmark, 
  FiShare2, 
  FiMapPin, 
  FiUsers, 
  FiClock, 
  FiAward, 
  FiBriefcase,
  FiGlobe,
  FiCalendar,
  FiCheckCircle,
  FiExternalLink,
  FiCheck,
  FiHelpCircle,
  FiChevronDown,
  FiMail,
  FiLayers,
  FiShield,
  FiAlertCircle
} from 'react-icons/fi';
import { HiBookmark, HiSparkles } from 'react-icons/hi2';
import { isValidHttpUrl } from '../../utils/urlUtils';
import './CompetitionDetails.css';

const CompetitionDetails = () => {
  const { id } = useParams();
  const [competition, setCompetition] = useState(null);
  const [relatedCompetitions, setRelatedCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [bookmarked, setBookmarked] = useState(() => competitionService.isBookmarked(id));
  const [activeFaq, setActiveFaq] = useState(null);
  const [showToast, setShowToast] = useState(false);

  // Sync bookmark state when global bookmark event fires
  useEffect(() => {
    setBookmarked(competitionService.isBookmarked(id));
    const handleBookmarkChange = (e) => {
      if (e?.detail && String(e.detail.id) === String(id)) {
        setBookmarked(e.detail.bookmarked);
      }
    };
    window.addEventListener('oppora:bookmark-change', handleBookmarkChange);
    return () => window.removeEventListener('oppora:bookmark-change', handleBookmarkChange);
  }, [id]);

  const handleBookmarkToggle = () => {
    const newStatus = competitionService.toggleBookmark(id);
    setBookmarked(newStatus);
  };


  const fetchCompetitionDetails = async () => {
    setLoading(true);
    setError(null);
    let loadedData = null;

    try {
      // 1. Try loading from backend REST API endpoint
      loadedData = await competitionService.getCompetitionById(id);
    } catch {
      // API offline or unreachable, fallback to local data source
      loadedData = null;
    }

    // 2. Fallback to local dataset if API returns null/undefined
    if (!loadedData) {
      loadedData = getLocalCompetitionById(id);
    }

    if (!loadedData) {
      setError(`Opportunity #${id} was not found.`);
      setCompetition(null);
      setRelatedCompetitions([]);
      setLoading(false);
      return;
    }

    setCompetition(loadedData);

    // 3. Load related recommendations
    try {
      let allCompetitions = [];
      try {
        const apiAll = await competitionService.getAllCompetitions();
        if (Array.isArray(apiAll) && apiAll.length > 0) {
          allCompetitions = apiAll;
        }
      } catch {
        allCompetitions = getLocalAllCompetitions();
      }

      if (!allCompetitions || allCompetitions.length === 0) {
        allCompetitions = getLocalAllCompetitions();
      }

      // Smart recommendation engine scoring candidates based on Category, Tags, Organization, Mode, and Difficulty
      const candidates = allCompetitions.filter(
        (item) => String(item.id) !== String(id) && item.slug !== loadedData.slug
      );

      const scoredCandidates = candidates.map((item) => {
        let score = 0;

        // 1. Category match (Weight: 5 points)
        if (item.category && loadedData.category && item.category.toLowerCase() === loadedData.category.toLowerCase()) {
          score += 5;
        }

        // 2. Organization match (Weight: 4 points)
        if (item.organization && loadedData.organization && item.organization.toLowerCase() === loadedData.organization.toLowerCase()) {
          score += 4;
        }

        // 3. Tags overlap (Weight: 2 points per matching tag)
        const currentTags = Array.isArray(loadedData.tags) ? loadedData.tags.map((t) => String(t).toLowerCase()) : [];
        const itemTags = Array.isArray(item.tags) ? item.tags.map((t) => String(t).toLowerCase()) : [];
        const sharedTags = itemTags.filter((t) => currentTags.includes(t));
        score += sharedTags.length * 2;

        // 4. Mode match (Weight: 2 points)
        if (item.mode && loadedData.mode && item.mode.toLowerCase() === loadedData.mode.toLowerCase()) {
          score += 2;
        }

        // 5. Difficulty match (Weight: 2 points)
        if (item.difficulty && loadedData.difficulty && item.difficulty.toLowerCase() === loadedData.difficulty.toLowerCase()) {
          score += 2;
        }

        return { item, score };
      });

      scoredCandidates.sort((a, b) => b.score - a.score);
      const top4Related = scoredCandidates.slice(0, 4).map((entry) => entry.item);
      setRelatedCompetitions(top4Related);
    } catch {
      setRelatedCompetitions([]);
    } finally {
      setLoading(false);
    }
  };

  const isClickingTab = useRef(false);

  const detailTabs = useMemo(() => {
    if (!competition) return [];
    return [
      { id: 'overview', label: 'Overview', show: Boolean(competition.overview || competition.description) },
      { id: 'dates', label: 'Important Dates', show: Array.isArray(competition.importantDates) && competition.importantDates.length > 0 },
      { id: 'details', label: 'Details', show: Boolean(competition.details) },
      { id: 'timeline', label: 'Timeline & Rounds', show: Array.isArray(competition.rounds || competition.timeline) && (competition.rounds || competition.timeline).length > 0 },
      { id: 'prizes', label: 'Prizes', show: Array.isArray(competition.prizes) && competition.prizes.length > 0 },
      { id: 'eligibility', label: 'Eligibility', show: Boolean(competition.eligibility) },
      { id: 'rules', label: 'Rules', show: Array.isArray(competition.rules) && competition.rules.length > 0 },
      { id: 'judging', label: 'Judging Criteria', show: Array.isArray(competition.judgingCriteria) && competition.judgingCriteria.length > 0 },
      { id: 'faqs', label: 'FAQs', show: Array.isArray(competition.faqs) && competition.faqs.length > 0 },
      { id: 'organizer', label: 'Organizer', show: true }
    ];
  }, [competition]);

  // IntersectionObserver 60fps Scroll Spy for Active Tab Tracking
  useEffect(() => {
    if (!competition || loading) return;

    const visibleTabIds = detailTabs.filter((t) => t.show).map((t) => t.id);
    const sectionElements = visibleTabIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickingTab.current) return;
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry && visibleEntry.target.id) {
          setActiveTab(visibleEntry.target.id);
        }
      },
      {
        rootMargin: '-80px 0px -65% 0px',
        threshold: 0.1
      }
    );

    sectionElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [competition, loading, detailTabs]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchCompetitionDetails();
  }, [id]);

  const handleTabClick = (tabId) => {
    isClickingTab.current = true;
    setActiveTab(tabId);
    const element = document.getElementById(tabId);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setTimeout(() => {
      isClickingTab.current = false;
    }, 600);
  };


  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleShareClick = async () => {
    const success = await competitionService.copyToClipboard(window.location.href);
    if (success) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };


  const [isRegistering, setIsRegistering] = useState(false);

  // Official Registration Redirection Handler with duplicate click prevention & URL validation
  const isRegisterUrlValid = isValidHttpUrl(competition?.officialRegistrationUrl);

  const handleRegisterClick = (e) => {
    e.preventDefault();
    if (isRegistering || !isRegisterUrlValid || !competition?.officialRegistrationUrl) return;

    setIsRegistering(true);

    try {
      const isClosed = competition.status === 'Closed' || competition.status === 'Registration Closed';
      const rawUrl = (isClosed ? competition.website || competition.officialRegistrationUrl : competition.officialRegistrationUrl).trim();
      const targetUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : `https://${rawUrl}`;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Failed to open official registration URL:', err);
    } finally {
      // Lock button for 1000ms to prevent duplicate rapid clicks
      setTimeout(() => {
        setIsRegistering(false);
      }, 1000);
    }
  };

  return (
    <div className="details-page-wrapper">
      {/* Toast Notification */}
      {showToast && (
        <div className="toast-notification">
          <FiCheck className="toast-icon" />
          <span>Link copied to clipboard!</span>
        </div>
      )}

      {/* Main Layout Container */}
      <div className="details-main-layout">
        {/* Center Details Column */}
        <main className="details-center-content">
          {/* Back Button Navigation */}
          <div className="back-navigation-bar">
            <Link to="/competitions" className="back-btn">
              <FiArrowLeft className="back-icon" />
              <span>Back to Competitions</span>
            </Link>
          </div>

          {/* Loading Skeletons */}
          {loading && (
            <div className="details-loading-box">
              <SkeletonCard />
            </div>
          )}

          {/* 404 Not Found State */}
          {!loading && (error || !competition) && (
            <div className="not-found-state-box">
              <FiAlertCircle className="not-found-icon" />
              <h2 className="not-found-title">Opportunity Not Found</h2>
              <p className="not-found-message">
                {error || `The competition with ID #${id} does not exist or may have been removed.`}
              </p>
              <Link to="/competitions" className="back-to-home-btn">
                <FiArrowLeft /> <span>Back to Competitions</span>
              </Link>
            </div>
          )}

          {/* Loaded Dynamic Details View */}
          {!loading && !error && competition && (
            <>
              {/* Hero Banner Header Card */}
              <div className="details-header-card">

                {/* ── Banner Zone ── */}
                <div
                  className="details-banner-zone"
                  style={{
                    background: (() => {
                      // Deterministic gradient seeded from org name chars
                      const seed = (competition.organization || 'OR').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
                      const h1 = seed % 360;
                      const h2 = (h1 + 40) % 360;
                      return `linear-gradient(135deg, hsl(${h1},60%,28%) 0%, hsl(${h2},70%,42%) 100%)`;
                    })()
                  }}
                >
                  {competition.banner && (
                    <LazyImage
                      src={competition.banner}
                      alt={`${competition.title} banner`}
                      className="details-banner-img"
                      wrapperStyle={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
                      objectFit="cover"
                      eager={true}
                    />
                  )}

                  {/* Deadline urgency badge — top right corner of banner */}
                  {(competition.daysLeft || competition.deadline) && (
                    <div className="banner-deadline-badge">
                      <FiClock className="banner-deadline-icon" />
                      <span>{competition.daysLeft || competition.deadline}</span>
                    </div>
                  )}

                  {/* Category badge — top left corner */}
                  {competition.category && (
                    <div className="banner-category-badge">
                      {competition.category}
                    </div>
                  )}
                </div>

                {/* ── Below-banner: logo + actions row ── */}
                <div className="header-below-banner">
                  <CompanyLogo
                    src={competition.logo}
                    organization={competition.organization}
                    size={80}
                    borderRadius="16px"
                    wrapperClassName="details-logo-wrapper"
                    className="details-logo"
                    eager={true}
                  />
                  <div className="details-header-actions">

                    <button
                      type="button"
                      className={`details-action-btn ${bookmarked ? 'bookmarked' : ''}`}
                      onClick={handleBookmarkToggle}
                      title={bookmarked ? 'Remove Bookmark' : 'Bookmark'}
                    >
                      {bookmarked ? <HiBookmark /> : <FiBookmark />}
                    </button>
                    <button
                      type="button"
                      className="details-action-btn"
                      onClick={handleShareClick}
                      title="Share Link"
                    >
                      <FiShare2 />
                    </button>
                  </div>
                </div>

                {/* ── Title & Org ── */}
                <h1 className="details-title">{competition.title}</h1>

                <div className="details-organization">
                  <FiBriefcase className="org-icon" />
                  <span>{competition.organization}</span>
                  <span className="verified-badge"><FiShield /> Verified Organizer</span>
                </div>

                {/* ── Key Meta Pills ── */}
                <div className="details-meta-grid">
                  <div className="meta-pill">
                    <FiGlobe className="meta-pill-icon" />
                    <div>
                      <span className="meta-pill-label">Mode</span>
                      <strong className="meta-pill-value">{competition.mode || competition.location}</strong>
                    </div>
                  </div>

                  <div className="meta-pill">
                    <FiMapPin className="meta-pill-icon" />
                    <div>
                      <span className="meta-pill-label">Location</span>
                      <strong className="meta-pill-value">{competition.location}</strong>
                    </div>
                  </div>

                  <div className="meta-pill">
                    <FiUsers className="meta-pill-icon" />
                    <div>
                      <span className="meta-pill-label">Team Size</span>
                      <strong className="meta-pill-value">{competition.members || competition.teamSize}</strong>
                    </div>
                  </div>

                  <div className="meta-pill highlight-pill">
                    <FiClock className="meta-pill-icon" />
                    <div>
                      <span className="meta-pill-label">Deadline</span>
                      <strong className="meta-pill-value">{competition.daysLeft || competition.deadline}</strong>
                    </div>
                  </div>
                </div>

                {/* ── Tags ── */}
                {(competition.categories || competition.tags) && (
                  <div className="details-chips-list">
                    {(competition.categories || competition.tags).map((chip, idx) => (
                      <span key={idx} className="details-category-chip">{chip}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Responsive Sticky Tab Navigation Bar */}
              <TabNavigation
                tabs={detailTabs}
                activeTab={activeTab}
                onTabClick={handleTabClick}
              />



              {/* Section 1: Overview */}
              {(competition.overview || competition.description) && (
                <section id="overview" className="details-section-card">
                  <h2 className="section-title">About the Competition</h2>
                  <p className="section-text">{competition.overview || competition.description}</p>
                </section>
              )}

              {/* Section 2: Important Dates */}
              {Array.isArray(competition.importantDates) && competition.importantDates.length > 0 && (
                <section id="dates" className="details-section-card">
                  <h2 className="section-title">
                    <FiCalendar className="title-icon" /> Important Dates
                  </h2>
                  <div className="important-dates-grid">
                    {competition.importantDates.map((item, idx) => (
                      <div key={idx} className={`date-card ${idx === 1 ? 'deadline-card' : idx === competition.importantDates.length - 1 ? 'winner-card' : ''}`}>
                        <span className="date-card-label">{item.title}</span>
                        <strong className="date-card-value">{item.date}</strong>
                        <span className="date-card-sub">{item.description}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Section 3: Key Details Grid */}
              {competition.details && (
                <section id="details" className="details-section-card">
                  <h2 className="section-title">Key Information</h2>
                  <div className="details-key-grid">
                    {Object.entries(competition.details).map(([key, val], idx) => (
                      <div key={idx} className="key-detail-box">
                        <span className="key-detail-label">{key}</span>
                        <span className="key-detail-val">{val}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Section 4: Competition Rounds & Timeline */}
              {Array.isArray(competition.rounds || competition.timeline) && (competition.rounds || competition.timeline).length > 0 && (
                <section id="timeline" className="details-section-card">
                  <h2 className="section-title">Rounds & Timeline</h2>
                  <Timeline rounds={competition.rounds || competition.timeline} />
                </section>
              )}

              {/* Section 5: Prizes & Rewards */}
              {Array.isArray(competition.prizes) && competition.prizes.length > 0 && (
                <section id="prizes" className="details-section-card">
                  <h2 className="section-title">Prizes & Rewards</h2>
                  {competition.prizesTotal && (
                    <div className="prize-pool-banner">
                      <HiSparkles className="banner-sparkle" />
                      <div>
                        <span>Total Prize Pool Value:</span>
                        <strong>{competition.prizesTotal}</strong>
                      </div>
                    </div>
                  )}
                  <div className="prizes-grid">
                    {competition.prizes.map((prize, idx) => (
                      <PrizeCard key={idx} prize={prize} rank={idx + 1} />
                    ))}
                  </div>
                </section>
              )}

              {/* Section 6: Structured Eligibility */}
              {competition.eligibility && (
                <section id="eligibility" className="details-section-card">
                  <h2 className="section-title">Eligibility Criteria</h2>
                  <EligibilityCard 
                    eligibility={competition.eligibility} 
                    teamSize={competition.teamSize || competition.members} 
                    mode={competition.mode} 
                    location={competition.location} 
                    registrationFee={competition.registrationFee} 
                  />
                </section>
              )}


              {/* Section 6: Rules & Guidelines */}
              {Array.isArray(competition.rules) && competition.rules.length > 0 && (
                <section id="rules" className="details-section-card">
                  <h2 className="section-title">Rules & Guidelines</h2>
                  <ul className="rules-list">
                    {competition.rules.map((rule, idx) => (
                      <li key={idx} className="rule-item">
                        <FiCheckCircle className="rule-icon" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Section 6.5: Judging Criteria */}
              {Array.isArray(competition.judgingCriteria) && competition.judgingCriteria.length > 0 && (
                <section id="judging" className="details-section-card">
                  <h2 className="section-title">
                    <FiAward className="title-icon" /> Judging & Evaluation Criteria
                  </h2>
                  <div className="judging-criteria-grid">
                    {competition.judgingCriteria.map((item, idx) => (
                      <div key={idx} className="judging-card">
                        <div className="judging-card-header">
                          <h4 className="judging-title">{item.title}</h4>
                          {item.weight && <span className="judging-weight-badge">{item.weight}</span>}
                        </div>
                        <p className="judging-description">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Section 7: FAQs */}
              {Array.isArray(competition.faqs) && competition.faqs.length > 0 && (
                <section id="faqs" className="details-section-card">
                  <h2 className="section-title">Frequently Asked Questions</h2>
                  <div className="faqs-accordion">
                    {competition.faqs.map((faq, idx) => (
                      <div 
                        key={idx} 
                        className={`faq-item ${activeFaq === idx ? 'open' : ''}`}
                        onClick={() => toggleFaq(idx)}
                      >
                        <div className="faq-question-row">
                          <div className="faq-question-text">
                            <FiHelpCircle className="faq-icon" />
                            <span>{faq.question}</span>
                          </div>
                          <FiChevronDown className={`faq-chevron ${activeFaq === idx ? 'rotate' : ''}`} />
                        </div>
                        {activeFaq === idx && (
                          <div className="faq-answer-body">
                            <p>{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Section 8: Contact Organizer */}
              <section id="organizer" className="details-section-card">
                <h2 className="section-title">Contact Organizer</h2>
                <div className="organizer-contact-card">
                  <div className="organizer-left">
                    <CompanyLogo
                      src={competition.logo}
                      organization={competition.organization}
                      size={48}
                      borderRadius="12px"
                      className="organizer-avatar"
                      eager={true}
                    />
                    <div>

                      <h3 className="organizer-name">{competition.organization}</h3>
                      <p className="organizer-badge-text">Official Host & Opportunity Partner</p>
                    </div>
                  </div>

                  <div className="organizer-actions">
                    <a href={`mailto:${competition.contactEmail || 'support@oppora.com'}`} className="contact-action-btn email-btn">
                      <FiMail /> <span>Email Organizer</span>
                    </a>
                    <button type="button" className="contact-action-btn website-btn" onClick={handleShareClick}>
                      <FiExternalLink /> <span>Share Portal Link</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* Section 9: Related Competitions */}
              {relatedCompetitions.length > 0 && (
                <section id="related" className="details-section-card related-section">
                  <h2 className="section-title">More Opportunities You Might Like</h2>
                  <div className="related-cards-stack">
                    {relatedCompetitions.map((item) => (
                      <CompetitionCard
                        key={item.id}
                        id={item.id}
                        logo={item.logo}
                        title={item.title}
                        organization={item.organization}
                        members={item.members || item.teamSize}
                        location={item.location}
                        categories={item.categories || item.tags}
                        postedDate={item.postedDate}
                        daysLeft={item.daysLeft || item.deadline}
                        registeredCount={item.registeredCount}
                        isBookmarked={item.isBookmarked}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>

        {/* Right Sticky Registration & Featured Column */}
        <div className="details-right-column">
          {/* Sticky Register Card */}
          {competition && (
            <div className="sticky-register-card">
              <div className="register-card-header">
                <span className="free-badge">{competition.registrationFee || 'FREE'}</span>
                <span className="registered-stat">{competition.registeredCount}</span>
              </div>

              <button 
                type="button" 
                className="register-now-btn"
                onClick={handleRegisterClick}
                disabled={!isRegisterUrlValid || isRegistering}
                title={
                  !isRegisterUrlValid
                    ? 'Official registration link unavailable'
                    : isRegistering
                    ? 'Opening official registration page...'
                    : 'Register on Official Site'
                }
              >
                {isRegistering ? 'Redirecting...' : 'Register Now'}
              </button>

              <div className="register-deadline-row">
                <FiClock className="deadline-icon" />
                <span>Registration Closes in: <strong>{competition.daysLeft || competition.deadline}</strong></span>
              </div>

              <div className="register-actions-row">
                <button 
                  type="button" 
                  className={`secondary-action-btn ${bookmarked ? 'active-bookmark' : ''}`}
                  onClick={handleBookmarkToggle}
                >
                  {bookmarked ? <HiBookmark /> : <FiBookmark />}
                  <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                </button>
                <button 
                  type="button" 
                  className="secondary-action-btn"
                  onClick={handleShareClick}
                >
                  <FiShare2 />
                  <span>Share</span>
                </button>
              </div>
            </div>
          )}

          {/* Featured Competitions Sidebar Component */}
          <FeaturedSection />
        </div>
      </div>

      {/* Mobile Sticky Bottom CTA Bar */}
      {competition && (
        <div className="mobile-bottom-cta-bar">
          <div className="mobile-cta-info">
            <span className="mobile-cta-fee">{competition.registrationFee || 'FREE'}</span>
            <span className="mobile-cta-deadline">{competition.daysLeft || competition.deadline}</span>
          </div>
          <button 
            type="button" 
            className="mobile-cta-register-btn"
            onClick={handleRegisterClick}
            disabled={!isRegisterUrlValid || isRegistering}
            title={
              !isRegisterUrlValid
                ? 'Official registration link unavailable'
                : isRegistering
                ? 'Opening official registration page...'
                : 'Register on Official Site'
            }
          >
            {isRegistering ? 'Redirecting...' : 'Register Now'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CompetitionDetails;
