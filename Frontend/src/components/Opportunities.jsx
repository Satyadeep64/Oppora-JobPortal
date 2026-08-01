import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  CalendarDays,
  Bookmark,
  Share2,
  Eye,
  CheckCircle,
  Filter,
  Search,
  Sparkles,
  Flame,
  X
} from "lucide-react";

const mockFallbackOpportunities = [
  {
    id: 101,
    title: "Senior Full Stack Software Engineer",
    companyName: "Google Cloud",
    companyLogo: "",
    type: "Job",
    employmentType: "Full Time",
    location: "Bengaluru (Hybrid)",
    experience: "1-3 Years",
    skills: "React, Node.js, TypeScript, PostgreSQL, Docker",
    salary: "₹18,00,000 - ₹24,00,000 / yr",
    deadline: "2026-08-30",
    description: "Build scalable cloud infrastructure, microservices, and modern frontend dashboards for enterprise Google Cloud products.",
    urgent: true
  },
  {
    id: 102,
    title: "AI Research & ML Engineer Intern",
    companyName: "Microsoft AI Lab",
    companyLogo: "",
    type: "Internship",
    employmentType: "Remote",
    location: "Remote / Hyderabad",
    experience: "Fresher / Student",
    skills: "Python, PyTorch, LLMs, NLP, Scikit-Learn",
    salary: "₹60,000 / month",
    deadline: "2026-08-25",
    description: "Work alongside Microsoft AI research teams to fine-tune generative AI models and optimize transformer architectures.",
    urgent: false
  },
  {
    id: 103,
    title: "Frontend Development Specialist",
    companyName: "Amazon Web Services",
    companyLogo: "",
    type: "Job",
    employmentType: "Full Time",
    location: "Hyderabad",
    experience: "0-2 Years",
    skills: "React, Next.js, Redux Toolkit, Tailwind CSS",
    salary: "₹15,00,000 - ₹20,00,000 / yr",
    deadline: "2026-08-28",
    description: "Design high-performance responsive customer interfaces with robust accessible component libraries.",
    urgent: true
  },
  {
    id: 104,
    title: "UI/UX Product Design Intern",
    companyName: "Meta",
    companyLogo: "",
    type: "Internship",
    employmentType: "Hybrid",
    location: "Gurugram",
    experience: "Fresher",
    skills: "Figma, Wireframing, User Research, Prototyping",
    salary: "₹45,00,000 / yr (PPO Eligible)",
    deadline: "2026-08-20",
    description: "Design intuitive user flows and high-fidelity prototypes for next-gen social platforms.",
    urgent: false
  },
  {
    id: 105,
    title: "Backend Java & Spring Engineer",
    companyName: "Oracle",
    companyLogo: "",
    type: "Job",
    employmentType: "Full Time",
    location: "Pune / Remote",
    experience: "2-4 Years",
    skills: "Java 17, Spring Boot, Microservices, Redis",
    salary: "₹16,00,000 / yr",
    deadline: "2026-09-05",
    description: "Develop high-throughput REST microservices with robust database transaction security.",
    urgent: false
  },
  {
    id: 106,
    title: "Data Analytics & Engineering Intern",
    companyName: "Deloitte Digital",
    companyLogo: "",
    type: "Internship",
    employmentType: "Full Time",
    location: "Mumbai",
    experience: "Fresher",
    skills: "SQL, Python, PowerBI, Tableau",
    salary: "₹35,000 / month",
    deadline: "2026-08-22",
    description: "Transform complex enterprise datasets into actionable business intelligence dashboards.",
    urgent: true
  }
];

const TrendingOpportunities = () => {
  const navigate = useNavigate();

  const [allOpportunities, setAllOpportunities] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [quickViewJob, setQuickViewJob] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const popularSkills = ["All", "React", "Python", "Node.js", "Java", "Figma", "SQL"];

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        const response = await axios.get("http://localhost:5024/api/Opportunities");
        if (response.data && response.data.length > 0) {
          setAllOpportunities(response.data);
        } else {
          setAllOpportunities(mockFallbackOpportunities);
        }
      } catch (error) {
        console.log("Using fallback opportunity dataset due to API:", error);
        setAllOpportunities(mockFallbackOpportunities);
      }
    };

    loadOpportunities();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const toggleBookmark = (e, id) => {
    e.stopPropagation();
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(bookmarkedIds.filter((bId) => bId !== id));
      triggerToast("Opportunity removed from saved items");
    } else {
      setBookmarkedIds([...bookmarkedIds, id]);
      triggerToast("Opportunity saved to your bookmarks! ⭐");
    }
  };

  const handleShare = (e, job) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(window.location.origin + `/opportunity/${job.id}`);
    triggerToast(`Link copied to clipboard! 📋`);
  };

  // Filtering
  const filteredData = allOpportunities.filter((item) => {
    const matchesTab =
      activeTab === "all"
        ? true
        : activeTab === "jobs"
        ? item.type === "Job"
        : activeTab === "internships"
        ? item.type === "Internship"
        : activeTab === "remote"
        ? item.employmentType?.toLowerCase().includes("remote") || item.location?.toLowerCase().includes("remote")
        : true;

    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSkill =
      selectedSkill === "All" ||
      (item.skills && item.skills.toLowerCase().includes(selectedSkill.toLowerCase()));

    return matchesTab && matchesSearch && matchesSkill;
  });

  const jobsList = filteredData.filter((i) => i.type === "Job");
  const internshipsList = filteredData.filter((i) => i.type === "Internship");

  const OpportunityCard = ({ job }) => {
    const isBookmarked = bookmarkedIds.includes(job.id);

    return (
      <div className="trend-card">
        {/* Top Meta Row with Badges & Save Button */}
        <div className="trend-card-top-row">
          <div className="trend-card-badges-group">
            {job.urgent && (
              <span className="urgent-badge">
                <Flame size={12} /> Urgent
              </span>
            )}
            <span className="badge-chip type-badge">{job.type}</span>
            <span className="badge-chip emp-badge">{job.employmentType}</span>
          </div>

          <button
            className={`bookmark-btn ${isBookmarked ? "active" : ""}`}
            onClick={(e) => toggleBookmark(e, job.id)}
            title={isBookmarked ? "Remove bookmark" : "Save opportunity"}
            type="button"
          >
            <Bookmark size={18} fill={isBookmarked ? "#f59e0b" : "none"} color={isBookmarked ? "#f59e0b" : "currentColor"} />
          </button>
        </div>

        {/* Company & Job Title Row */}
        <div className="trend-card-info-row">
          {job.companyLogo ? (
            <img
              src={`http://localhost:5024${job.companyLogo}`}
              alt="company logo"
              className="company-logo"
            />
          ) : (
            <div className="default-company-avatar">
              <Briefcase size={22} />
            </div>
          )}
          <div className="title-company-block">
            <h2 className="job-title-text" title={job.title}>{job.title}</h2>
            <h3 className="trend-company">{job.companyName}</h3>
          </div>
        </div>

        {/* Location & Experience Details */}
        <div className="trend-details">
          <p><MapPin size={15} /> {job.location}</p>
          <p><Clock size={15} /> {job.experience || "Fresher"}</p>
        </div>

        {/* Required Skills */}
        <div className="trend-skills">
          <span className="skills-label">Skills:</span>
          <div className="skills-pills-row">
            {job.skills ? (
              job.skills
                .split(",")
                .slice(0, 4)
                .map((skill, index) => (
                  <span key={index} className="skill-pill">
                    {skill.trim()}
                  </span>
                ))
            ) : (
              <span className="skill-pill">Not specified</span>
            )}
          </div>
        </div>

        {/* Salary & Deadline Footer */}
        <div className="trend-footer-info">
          <div className="trend-salary">
            <IndianRupee size={15} />
            <span>{job.salary || "Not disclosed"}</span>
          </div>

          <div className="trend-deadline">
            <CalendarDays size={14} />
            <span>Apply by: {new Date(job.deadline).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Card Actions */}
        <div className="trend-card-actions">
          <button
            className="action-quickview"
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewJob(job);
            }}
            type="button"
          >
            <Eye size={15} /> Quick View
          </button>

          <button
            className="action-details"
            onClick={() => navigate(`/opportunity/${job.id}`)}
            type="button"
          >
            View Details
          </button>

          <button
            className="action-share"
            onClick={(e) => handleShare(e, job)}
            title="Share Opportunity"
            type="button"
          >
            <Share2 size={15} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="trending-page">
      {/* Toast Notification popup */}
      {toastMessage && (
        <div className="floating-toast">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header & Interactive Filters */}
      <div className="trending-main-header">
        <div className="trending-title-block">
          <div className="spotlight-chip">
            <Sparkles size={15} />
            <span>Verified Postings</span>
          </div>
          <h1>
            Trending <span>Opportunities</span>
          </h1>
          <p>Apply directly to high-paying jobs and internships from verified companies.</p>
        </div>

        {/* Tab switcher */}
        <div className="trending-tabs">
          <button
            className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Postings ({allOpportunities.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "jobs" ? "active" : ""}`}
            onClick={() => setActiveTab("jobs")}
          >
            💼 Jobs
          </button>
          <button
            className={`tab-btn ${activeTab === "internships" ? "active" : ""}`}
            onClick={() => setActiveTab("internships")}
          >
            🎓 Internships
          </button>
          <button
            className={`tab-btn ${activeTab === "remote" ? "active" : ""}`}
            onClick={() => setActiveTab("remote")}
          >
            🌐 Remote Only
          </button>
        </div>

        {/* Search & Skill Chips Filter Bar */}
        <div className="opportunity-filter-bar">
          <div className="opp-search-input">
            <Search size={18} />
            <input
              type="text"
              placeholder="Filter by title, company or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery("")}>
                ✕
              </button>
            )}
          </div>

          <div className="skill-filter-chips">
            <Filter size={15} className="filter-icon" />
            <span>Skill:</span>
            {popularSkills.map((sk) => (
              <button
                key={sk}
                className={`skill-filter-btn ${selectedSkill === sk ? "active" : ""}`}
                onClick={() => setSelectedSkill(sk)}
              >
                {sk}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 1: Jobs */}
      {(activeTab === "all" || activeTab === "jobs" || activeTab === "remote") && (
        <section className="opp-section">
          <div className="trend-title">
            <h2>
              Trending <span>Jobs</span>
            </h2>
            <span className="count-pill">{jobsList.length} Active Positions</span>
          </div>

          {jobsList.length > 0 ? (
            <div className="trend-container">
              {jobsList.map((job) => (
                <OpportunityCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="no-opp-found">
              <p>No jobs found matching your current filter criteria.</p>
              <button onClick={() => { setSearchQuery(""); setSelectedSkill("All"); setActiveTab("all"); }}>
                Reset Filters
              </button>
            </div>
          )}
        </section>
      )}

      {/* Section 2: Internships */}
      {(activeTab === "all" || activeTab === "internships" || activeTab === "remote") && (
        <section className="opp-section">
          <div className="trend-title">
            <h2>
              Trending <span>Internships</span>
            </h2>
            <span className="count-pill">{internshipsList.length} Active Opportunities</span>
          </div>

          {internshipsList.length > 0 ? (
            <div className="trend-container">
              {internshipsList.map((job) => (
                <OpportunityCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="no-opp-found">
              <p>No internships found matching your current filter criteria.</p>
              <button onClick={() => { setSearchQuery(""); setSelectedSkill("All"); setActiveTab("all"); }}>
                Reset Filters
              </button>
            </div>
          )}
        </section>
      )}

      {/* Quick View Inline Drawer / Modal */}
      {quickViewJob && (
        <div className="quickview-modal-overlay" onClick={() => setQuickViewJob(null)}>
          <div className="quickview-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="quickview-close" onClick={() => setQuickViewJob(null)}>
              <X size={20} />
            </button>

            <div className="quickview-header">
              <div className="quickview-company-avatar">
                <Briefcase size={28} />
              </div>
              <div>
                <h2>{quickViewJob.title}</h2>
                <p className="quickview-company">{quickViewJob.companyName}</p>
                <div className="quickview-badges">
                  <span className="badge-chip">{quickViewJob.type}</span>
                  <span className="badge-chip">{quickViewJob.employmentType}</span>
                </div>
              </div>
            </div>

            <div className="quickview-body">
              <div className="quickview-grid-details">
                <div className="q-detail-box">
                  <MapPin size={16} />
                  <div>
                    <strong>Location</strong>
                    <p>{quickViewJob.location}</p>
                  </div>
                </div>

                <div className="q-detail-box">
                  <Clock size={16} />
                  <div>
                    <strong>Experience</strong>
                    <p>{quickViewJob.experience || "Fresher"}</p>
                  </div>
                </div>

                <div className="q-detail-box">
                  <IndianRupee size={16} />
                  <div>
                    <strong>Package / Stipend</strong>
                    <p>{quickViewJob.salary || "Not Disclosed"}</p>
                  </div>
                </div>

                <div className="q-detail-box">
                  <CalendarDays size={16} />
                  <div>
                    <strong>Deadline</strong>
                    <p>{new Date(quickViewJob.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {quickViewJob.description && (
                <div className="quickview-desc">
                  <h4>Role Overview</h4>
                  <p>{quickViewJob.description}</p>
                </div>
              )}

              <div className="quickview-skills">
                <h4>Required Skills</h4>
                <div className="skills-pills-row">
                  {quickViewJob.skills
                    ? quickViewJob.skills.split(",").map((s, idx) => (
                        <span key={idx} className="skill-pill">
                          <CheckCircle size={12} /> {s.trim()}
                        </span>
                      ))
                    : <span>Standard technical requirements apply.</span>}
                </div>
              </div>

              <div className="quickview-footer">
                <button
                  className="quickview-apply-btn"
                  onClick={() => {
                    setQuickViewJob(null);
                    navigate(`/opportunity/${quickViewJob.id}`);
                  }}
                >
                  Proceed to Application →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendingOpportunities;