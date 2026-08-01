import { useState } from "react";
import CompanySlider from "../CompanySlider";
import {
  BriefcaseBusiness,
  GraduationCap,
  Trophy,
  Bot,
  BookOpen,
  UsersRound,
  FileText,
  UserCheck,
  BarChart3,
  PlusCircle,
  Sparkles,
  TrendingUp,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");
  const userName = localStorage.getItem("userName") || "Member";
  const isRecruiter = role === "Recruiter";

  const [heroSearch, setHeroSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");

  const filterTags = isRecruiter
    ? ["All", "Full Time", "Remote", "Engineering", "Design", "Internship"]
    : ["All", "Software Engineer", "Frontend", "Data Science", "UI/UX", "Product"];

  const candidateCards = [
    {
      title: "Jobs",
      subtitle: "10,000+ Active Roles",
      icon: <BriefcaseBusiness size={24} />,
      path: "/jobs",
      badge: "Hot",
      color: "from-blue-500 to-indigo-600",
      accent: "#3b82f6"
    },
    {
      title: "Internships",
      subtitle: "Paid & Remote Positions",
      icon: <GraduationCap size={24} />,
      path: "/internships",
      badge: "Trending",
      color: "from-emerald-500 to-teal-600",
      accent: "#10b981"
    },
    {
      title: "Competitions",
      subtitle: "Win Cash & Hiring Perks",
      icon: <Trophy size={24} />,
      path: "/competitions",
      badge: "₹50L+ Prizes",
      color: "from-amber-500 to-orange-600",
      accent: "#f59e0b"
    },
    {
      title: "AI Interview",
      subtitle: "Real-time Mock Practice",
      icon: <Bot size={24} />,
      path: "/ai-interview",
      badge: "AI Powered",
      color: "from-purple-500 to-indigo-600",
      accent: "#8b5cf6"
    },
    {
      title: "Courses",
      subtitle: "Upskill with Top Mentors",
      icon: <BookOpen size={24} />,
      path: "/courses",
      badge: "Certifications",
      color: "from-pink-500 to-rose-600",
      accent: "#ec4899"
    },
    {
      title: "Resume Analyzer",
      subtitle: "Instant ATS Score Check",
      icon: <FileText size={24} />,
      path: "/resume-analyzer",
      badge: "Free Check",
      color: "from-cyan-500 to-blue-600",
      accent: "#06b6d4"
    }
  ];

  const recruiterCards = [
    {
      title: "Post Jobs",
      subtitle: "Publish New Opportunity",
      icon: <PlusCircle size={24} />,
      path: "/post-opportunity",
      badge: "Fast Post",
      accent: "#2563eb"
    },
    {
      title: "Manage Jobs",
      subtitle: "Track & Edit Listings",
      icon: <BriefcaseBusiness size={24} />,
      path: "/manage-opportunities",
      badge: "Active",
      accent: "#10b981"
    },
    {
      title: "View Applicants",
      subtitle: "Review Incoming Resumes",
      icon: <UsersRound size={24} />,
      path: "/recruiter/applicants",
      badge: "New Resumes",
      accent: "#8b5cf6"
    },
    {
      title: "Shortlist Candidates",
      subtitle: "Filter Top Performers",
      icon: <UserCheck size={24} />,
      path: "/recruiter/applicants",
      badge: "Smart Filter",
      accent: "#f59e0b"
    },
    {
      title: "AI Candidate Matching",
      subtitle: "Automated Skill Match",
      icon: <Bot size={24} />,
      path: "/ai-matching",
      badge: "AI Powered",
      accent: "#ec4899"
    },
    {
      title: "Hiring Analytics",
      subtitle: "Insights & Conversion",
      icon: <BarChart3 size={24} />,
      path: "/hiring-analytics",
      badge: "Real-time",
      accent: "#06b6d4"
    }
  ];

  const cards = isRecruiter ? recruiterCards : candidateCards;

  const handleHeroSearchSubmit = (e) => {
    e.preventDefault();
    if (isRecruiter) {
      navigate("/recruiter/applicants");
    } else {
      navigate(`/jobs?search=${encodeURIComponent(heroSearch)}`);
    }
  };

  return (
    <div className="hero-master-wrapper">
      {/* Hero Header Banner */}
      <section className="hero-banner">
        <div className="hero-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>

        <div className="hero-content">
          <div className="hero-welcome-badge">
            <Sparkles size={16} className="badge-sparkle" />
            <span>Welcome back, {userName}!</span>
            <span className="live-dot-wrapper">
              <span className="live-dot"></span>
              Live Portal
            </span>
          </div>

          <h1 className="hero-title">
            {isRecruiter ? (
              <>
                Hire World-Class <span className="text-gradient">Talent Faster</span> 🚀
              </>
            ) : (
              <>
                Your Dream Career <span className="text-gradient">Starts Right Here</span> 🚀
              </>
            )}
          </h1>

          <p className="hero-subtitle">
            {isRecruiter
              ? "Publish job vacancies, leverage AI applicant matching, shortlist candidate portfolios, and streamline your recruitment pipeline."
              : "Discover verified jobs, top-tier internships, elite hackathons, AI mock interview tools, and industry expert courses."}
          </p>

          {/* Quick Hero Search & Filter Bar */}
          <form className="hero-search-box" onSubmit={handleHeroSearchSubmit}>
            <div className="search-input-wrapper">
              <Search className="hero-search-icon" size={20} />
              <input
                type="text"
                placeholder={
                  isRecruiter
                    ? "Search candidate profiles, skills, or job roles..."
                    : "Search roles, companies, skills e.g., React, Java, Product Manager..."
                }
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="hero-search-btn">
              <span>Search</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Tag Quick Filter Chips */}
          <div className="hero-tags-container">
            <span className="tags-label">Quick Search:</span>
            <div className="tags-list">
              {filterTags.map((tag) => (
                <button
                  key={tag}
                  className={`tag-pill ${selectedTag === tag ? "active" : ""}`}
                  onClick={() => {
                    setSelectedTag(tag);
                    if (tag !== "All") setHeroSearch(tag);
                  }}
                  type="button"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Hero Live Highlight Badges */}
          <div className="hero-highlights">
            <div className="highlight-item">
              <ShieldCheck size={18} className="highlight-icon" />
              <span>100% Verified Employers</span>
            </div>
            <div className="highlight-item">
              <Zap size={18} className="highlight-icon" />
              <span>AI Resume & Mock Tests</span>
            </div>
            <div className="highlight-item">
              <TrendingUp size={18} className="highlight-icon" />
              <span>98% Selection Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Grid Section */}
      <section className="explore-section">
        <div className="explore-section-header">
          <div>
            <h2 className="explore-title">
              {isRecruiter ? (
                <>
                  Manage <span className="highlight-word">Recruitment</span>
                </>
              ) : (
                <>
                  Explore <span className="highlight-word">Opportunities</span>
                </>
              )}
            </h2>
            <p className="explore-desc">
              {isRecruiter
                ? "Manage candidates, monitor hiring funnels, and use smart AI matching tools."
                : "Navigate through personalized career pathways tailored for your growth."}
            </p>
          </div>

          <div className="explore-status-pill">
            <Zap size={15} />
            <span>Interactive Hub</span>
          </div>
        </div>

        <div className="explore-grid">
          {cards.map((card, index) => (
            <div
              className={`explore-card card-${index}`}
              key={card.title}
              onClick={() => navigate(card.path)}
              style={{ "--card-accent": card.accent }}
            >
              {card.badge && <span className="card-badge">{card.badge}</span>}

              <div className="icon-box" style={{ color: card.accent }}>
                {card.icon}
              </div>

              <div className="card-info">
                <h4>{card.title}</h4>
                {card.subtitle && <p className="card-subtitle">{card.subtitle}</p>}
              </div>

              <div className="card-arrow">
                <ArrowRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Company Slider Marquee */}
      <CompanySlider />
    </div>
  );
};

export default Hero;