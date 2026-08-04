import React, { useState, useMemo, useEffect } from "react";
import "./InterviewsPage.css";
import { useInterviews } from "../../hooks/useInterviews";
import { useToast } from "../../hooks/useToast";
import { interviewService } from "../../services/interviewService";
import CandidateCard from "../../components/Interviews/CandidateCard";
import InterviewCard from "../../components/Interviews/InterviewCard";
import InterviewTable from "../../components/Interviews/InterviewTable";
import InterviewCalendar from "../../components/Interviews/InterviewCalendar";
import KpiCard from "../../components/Interviews/KpiCard";
import InterviewHeatmap from "../../components/Interviews/InterviewHeatmap";
import ScheduleDialog from "../../components/Interviews/ScheduleDialog";
import ViewInterviewDialog from "../../components/Interviews/ViewInterviewDialog";
import EditInterviewDialog from "../../components/Interviews/EditInterviewDialog";
import FeedbackDialog from "../../components/Interviews/FeedbackDialog";
import RescheduleDialog from "../../components/Interviews/RescheduleDialog";
import AuditLogPanel from "../../components/Interviews/AuditLogPanel";
import InterviewErrorBoundary from "../../components/Interviews/InterviewErrorBoundary";
import ToastContainer from "../../components/common/ToastContainer";
import { exportToCSV, exportToPDF } from "../../utils/interviewUtils";

import {
  Clock, Zap, Search, Plus, RefreshCw, Table, Grid, CheckCircle2,
  FileSpreadsheet, XCircle, Download, Users, Calendar as CalendarIcon
} from "lucide-react";

const getIsDark = () => {
  if (typeof document === "undefined") return false;
  return (
    localStorage.getItem("theme") === "dark" ||
    document.documentElement.getAttribute("data-theme") === "dark" ||
    document.body.getAttribute("data-theme") === "dark" ||
    document.documentElement.classList.contains("dark") ||
    document.body.classList.contains("dark")
  );
};

const InterviewsPage = () => {
  const [isDark, setIsDark] = useState(getIsDark);

  useEffect(() => {
    const updateTheme = () => setIsDark(getIsDark());
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-theme", "class"] });
    window.addEventListener("storage", updateTheme);
    window.addEventListener("themeChange", updateTheme);
    return () => {
      observer.disconnect();
      window.removeEventListener("storage", updateTheme);
      window.removeEventListener("themeChange", updateTheme);
    };
  }, []);
  const {
    interviews = [],
    shortlistedCandidates = [],
    calendarEvents = [],
    loading,
    error,
    refreshData,
    addOptimisticInterview,
    deleteInterview,
    rescheduleInterview
  } = useInterviews();
  const { toasts, showToast, dismiss } = useToast(5000);

  const [activeView, setActiveView] = useState("table"); // "table" | "cards" | "queue" | "calendar"
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [invitationFilter, setInvitationFilter] = useState("All");
  const [selectedHeatmapDate, setSelectedHeatmapDate] = useState(null);

  // Sorting & Pagination State
  const [sortField, setSortField] = useState("date"); // "date" | "name" | "role" | "status"
  const [sortOrder, setSortOrder] = useState("asc");  // "asc" | "desc"
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Bulk Actions Selection State
  const [selectedInterviewIds, setSelectedInterviewIds] = useState([]);

  // Modal & Dialog States
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [selectedRound, setSelectedRound] = useState(null);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  // Auto-Refresh callback triggered after saving in ScheduleDialog
  const handleScheduleSubmit = (savedInterview) => {
    if (savedInterview) {
      addOptimisticInterview(savedInterview);
    }
    refreshData();
    
    showToast("Interview scheduled successfully.", "success");
    if (savedInterview?.invitationStatus === "Failed") {
      showToast("Email failed.", "error");
    } else {
      showToast("Email sent successfully.", "success");
    }
  };

  const handleResendInvitation = async (interviewId) => {
    try {
      showToast("Sending invitation email...", "info");
      await interviewService.sendInvitation(interviewId);
      refreshData();
      showToast("Email sent successfully.", "success");
    } catch (err) {
      showToast("Email failed.", "error");
    }
  };

  // Statistics KPI Calculations
  const stats = useMemo(() => {
    const safeList = Array.isArray(interviews) ? interviews.filter(Boolean) : [];
    const todayStr = new Date().toDateString();

    const todaysCount = safeList.filter((i) => {
      const startTime = i.rounds?.[0]?.scheduledTime || i.scheduledTime || i.interviewDate;
      return startTime && new Date(startTime).toDateString() === todayStr;
    }).length;

    const upcomingCount = safeList.filter((i) => (i.overallStatus || i.interviewStatus) === "Scheduled").length;
    const completedCount = safeList.filter((i) => (i.overallStatus || i.interviewStatus) === "Completed").length;
    const cancelledCount = safeList.filter((i) => (i.overallStatus || i.interviewStatus) === "Cancelled").length;

    const pendingInvitationsCount = safeList.filter((i) => {
      const status = i.invitationStatus || (i.rounds?.[0]?.isEmailSent ? "Sent" : "Pending");
      return status === "Pending" && (i.overallStatus || i.interviewStatus) !== "Cancelled";
    }).length;

    const invitationSentCount = safeList.filter((i) => {
      const status = i.invitationStatus || (i.rounds?.[0]?.isEmailSent ? "Sent" : "Pending");
      return status === "Sent";
    }).length;

    return {
      total: safeList.length,
      todays: todaysCount,
      upcoming: upcomingCount,
      completed: completedCount,
      cancelled: cancelledCount,
      pendingInvitations: pendingInvitationsCount,
      invitationSent: invitationSentCount
    };
  }, [interviews]);

  // Today's Priority Interviews List
  const todaysInterviews = useMemo(() => {
    const safeList = Array.isArray(interviews) ? interviews.filter(Boolean) : [];
    const todayStr = new Date().toDateString();
    return safeList.filter((i) => {
      const startTime = i.rounds?.[0]?.scheduledTime || i.scheduledTime || i.interviewDate;
      return startTime && new Date(startTime).toDateString() === todayStr;
    });
  }, [interviews]);

  // Filtered & Sorted Interviews List
  const processedInterviews = useMemo(() => {
    const safeList = Array.isArray(interviews) ? interviews.filter(Boolean) : [];

    // 1. Search & Filter
    let list = safeList.filter((i) => {
      const matchesSearch =
        (i.candidateName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.jobRole || i.opportunityTitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.candidateEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.companyName || "").toLowerCase().includes(searchQuery.toLowerCase());

      const currentStatus = i.overallStatus || i.interviewStatus || "Scheduled";
      const matchesStatus = statusFilter === "All" || currentStatus === statusFilter;

      const currentInvStatus = i.invitationStatus || (i.rounds?.[0]?.isEmailSent ? "Sent" : "Pending");
      const matchesInvitation = invitationFilter === "All" || currentInvStatus === invitationFilter;

      // Heatmap Date Filter
      let matchesHeatmapDate = true;
      if (selectedHeatmapDate) {
        const rawDate = i.interviewDate || i.scheduledStartTime || i.scheduledTime || i.createdAt || i.createdOn;
        if (rawDate) {
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            const dateKey = `${year}-${month}-${day}`;
            matchesHeatmapDate = dateKey === selectedHeatmapDate;
          } else {
            matchesHeatmapDate = false;
          }
        } else {
          matchesHeatmapDate = false;
        }
      }

      return matchesSearch && matchesStatus && matchesInvitation && matchesHeatmapDate;
    });

    // 2. Sorting
    list.sort((a, b) => {
      let valueA, valueB;

      if (sortField === "name") {
        valueA = (a.candidateName || "").toLowerCase();
        valueB = (b.candidateName || "").toLowerCase();
      } else if (sortField === "role") {
        valueA = (a.jobRole || a.opportunityTitle || "").toLowerCase();
        valueB = (b.jobRole || b.opportunityTitle || "").toLowerCase();
      } else if (sortField === "status") {
        valueA = (a.overallStatus || a.interviewStatus || "").toLowerCase();
        valueB = (b.overallStatus || b.interviewStatus || "").toLowerCase();
      } else {
        valueA = new Date(a.rounds?.[0]?.scheduledTime || a.scheduledTime || a.interviewDate || 0).getTime();
        valueB = new Date(b.rounds?.[0]?.scheduledTime || b.scheduledTime || b.interviewDate || 0).getTime();
      }

      if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [interviews, searchQuery, statusFilter, invitationFilter, selectedHeatmapDate, sortField, sortOrder]);

  // Paginated List
  const totalItems = processedInterviews.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const paginatedInterviews = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedInterviews.slice(startIndex, startIndex + pageSize);
  }, [processedInterviews, currentPage, pageSize]);

  // Handlers for Sort & Page
  const handleSortChange = (field, order) => {
    setSortField(field);
    setSortOrder(order);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedInterviewIds.length === processedInterviews.length) {
      setSelectedInterviewIds([]);
    } else {
      setSelectedInterviewIds(processedInterviews.map((i) => i.id));
    }
  };

  const handleBulkComplete = async () => {
    if (selectedInterviewIds.length === 0) return;
    if (window.confirm(`Mark ${selectedInterviewIds.length} selected interviews as Completed?`)) {
      await Promise.all(selectedInterviewIds.map((id) => interviewService.completeInterview(id)));
      setSelectedInterviewIds([]);
      refreshData();
    }
  };

  const handleBulkCancel = async () => {
    if (selectedInterviewIds.length === 0) return;
    if (window.confirm(`Cancel ${selectedInterviewIds.length} selected interviews?`)) {
      await Promise.all(selectedInterviewIds.map((id) => interviewService.cancelInterview(id, "Bulk cancelled by recruiter")));
      setSelectedInterviewIds([]);
      refreshData();
    }
  };

  const handleBulkExportCSV = () => {
    const selectedList = interviews.filter((i) => selectedInterviewIds.includes(i.id));
    exportToCSV(selectedList.length > 0 ? selectedList : processedInterviews, "Bulk_Selected_Interviews.csv");
  };

  // Export Handlers
  const handleExportCSV = () => exportToCSV(processedInterviews, "Recruiter_Interview_Report.csv");
  const handleExportPDF = () => exportToPDF(processedInterviews, "Recruiter Interview Dashboard Master Report");

  // Modal Action Handlers
  const handleOpenSchedule = (candidate) => {
    setSelectedCandidate(candidate);
    setShowScheduleModal(true);
  };

  const handleOpenFeedback = (interview, round) => {
    setSelectedInterview(interview);
    setSelectedRound(round || interview?.rounds?.[0]);
    setShowFeedbackModal(true);
  };

  const handleView = (interview) => {
    setSelectedInterview(interview);
    setShowViewModal(true);
  };

  const handleEdit = (interview) => {
    setSelectedInterview(interview);
    setShowEditModal(true);
  };

  const handleDelete = async (interviewId) => {
    if (window.confirm("Are you sure you want to permanently delete this interview record from the database?")) {
      try {
        await deleteInterview(interviewId);
        showToast("Interview permanently deleted.", "success");
      } catch (err) {
        const errorMsg = err?.response?.data?.message || "Failed to delete interview.";
        showToast(errorMsg, "error");
      }
    }
  };

  const handleOpenReschedule = (interview, round) => {
    setSelectedInterview(interview);
    setSelectedRound(round || interview.rounds?.[0]);
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async (interviewId, payload) => {
    try {
      await rescheduleInterview(interviewId, payload);
      setShowRescheduleModal(false);
      showToast("Interview rescheduled successfully.", "success");
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Failed to reschedule interview.";
      showToast(errorMsg, "error");
    }
  };

  const handleJoinMeet = (meetUrl) => {
    if (!meetUrl || !meetUrl.trim()) {
      showToast("Invalid Google Meet link.", "error");
      return;
    }

    const trimmedUrl = meetUrl.trim();
    if (!trimmedUrl.toLowerCase().startsWith("https://meet.google.com/")) {
      showToast("Invalid Google Meet link.", "error");
      return;
    }

    window.open(trimmedUrl, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className={`interviews-page ${isDark ? "dark" : ""}`}>
        {/* Skeleton Hero Banner */}
        <div className="ats-skeleton-loader" style={{ height: "110px", borderRadius: "14px", marginBottom: "24px" }} />

        {/* Skeleton KPI Cards */}
        <div className="stats-grid" style={{ marginBottom: "24px" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="ats-skeleton-loader" style={{ height: "88px", borderRadius: "14px" }} />
          ))}
        </div>

        {/* Skeleton Toolbar */}
        <div className="ats-skeleton-loader" style={{ height: "58px", borderRadius: "14px", marginBottom: "24px" }} />

        {/* Skeleton Interview Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="ats-skeleton-loader" style={{ height: "190px", borderRadius: "16px" }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`interviews-page ${isDark ? "dark" : ""}`} style={{ padding: "60px 20px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div style={{ background: "var(--ats-card-bg)", border: "1px solid #fecaca", borderRadius: "14px", padding: "36px", maxWidth: "480px", textAlign: "center", boxShadow: "var(--ats-shadow)" }}>
          <XCircle size={44} color="#ef4444" style={{ margin: "0 auto 14px" }} />
          <h3 style={{ margin: "0 0 8px", color: "var(--ats-text-main)", fontSize: "18px", fontWeight: "800" }}>Unable to Load Interview Hub</h3>
          <p style={{ color: "var(--ats-text-muted)", fontSize: "13px", margin: "0 0 20px 0", lineHeight: "1.5" }}>{error}</p>
          <button onClick={refreshData} style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 22px", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <RefreshCw size={16} /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`interviews-page ${isDark ? "dark" : ""}`}>
      {/* Hero Section */}
      <div className="ats-hero-banner">
        <div className="ats-hero-content">
          <h1>Enterprise ATS Interview Management Hub</h1>
          <p>Streamline candidate evaluation pipelines, Google Meet scheduling & conflict-free interview management.</p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            className="ats-hero-cta"
            onClick={() => {
              setSelectedCandidate(null);
              setShowScheduleModal(true);
            }}
          >
            <Plus size={18} /> Schedule Interview
          </button>

          <button
            onClick={refreshData}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#ffffff",
              padding: "10px 16px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <RefreshCw size={15} /> Refresh Pipeline
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <KpiCard icon={Zap}          bg="#fef3c7" color="#92400e" value={stats.todays}            label="Today's Interviews" />
        <KpiCard icon={Clock}         bg="#dbeafe" color="#1e40af" value={stats.upcoming}          label="Upcoming Interviews" />
        <KpiCard icon={CheckCircle2}  bg="#dcfce7" color="#166534" value={stats.completed}  label="Completed Interviews" />
        <KpiCard icon={XCircle}       bg="#fee2e2" color="#991b1b" value={stats.cancelled}  label="Cancelled Interviews" />
      </div>

      {/* Load Dynamic Weekly Heatmap */}
      <InterviewHeatmap
        interviews={interviews}
        selectedDate={selectedHeatmapDate}
        onSelectDate={(dateKey) => {
          setSelectedHeatmapDate(dateKey);
          setCurrentPage(1);
        }}
        isDark={isDark}
      />

      {/* Toolbar & Filter Controls */}
      <div className="toolbar-container">
        <div className="toolbar-left">
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "10px", top: "11px", color: "var(--ats-text-muted)" }} />
            <input
              type="text"
              className="ats-search-input"
              placeholder="Search name, role, email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* View Switcher Tabs & Export */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={handleExportCSV}
            style={{
              background: "#10b981", color: "#fff", border: "none",
              borderRadius: "8px", padding: "8px 14px", fontSize: "12px",
              fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px"
            }}
          >
            <FileSpreadsheet size={14} /> CSV
          </button>

          <button
            onClick={handleExportPDF}
            style={{
              background: "#4f46e5", color: "#fff", border: "none",
              borderRadius: "8px", padding: "8px 14px", fontSize: "12px",
              fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px"
            }}
          >
            <Download size={14} /> PDF
          </button>

          <div className="ats-view-tabs">
            <button
              className={`view-tab-btn ${activeView === "table" ? "active" : ""}`}
              onClick={() => setActiveView("table")}
            >
              <Table size={15} /> Table
            </button>

            <button
              className={`view-tab-btn ${activeView === "cards" ? "active" : ""}`}
              onClick={() => setActiveView("cards")}
            >
              <Grid size={15} /> Cards
            </button>

            <button
              className={`view-tab-btn ${activeView === "queue" ? "active" : ""}`}
              onClick={() => setActiveView("queue")}
            >
              <Users size={15} /> Queue
            </button>

            <button
              className={`view-tab-btn ${activeView === "calendar" ? "active" : ""}`}
              onClick={() => setActiveView("calendar")}
            >
              <CalendarIcon size={15} /> Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Today's High-Priority Section */}
      {todaysInterviews.length > 0 && activeView !== "calendar" && (
        <div className="todays-section">
          <div className="todays-header">
            <Zap size={20} color="#4f46e5" />
            <h2>Today's High-Priority Interviews ({todaysInterviews.length})</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" }}>
            {todaysInterviews.map((interview) => (
              <InterviewCard
                key={`today-${interview.id}`}
                interview={interview}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onFeedback={handleOpenFeedback}
                onReschedule={handleOpenReschedule}
                onJoinMeet={handleJoinMeet}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area (Full Width) */}
      <div className="main-content-full-wrapper" style={{ width: "100%", marginBottom: "28px" }}>
        {activeView === "table" && (
          <InterviewTable
            interviews={paginatedInterviews}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReschedule={handleOpenReschedule}
            onJoinMeet={handleJoinMeet}
            onFeedback={handleOpenFeedback}
            sortField={sortField}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}

        {activeView === "cards" && (
          <div>
            {paginatedInterviews.length === 0 ? (
              <div style={{ background: "var(--ats-card-bg)", padding: "40px", borderRadius: "var(--ats-radius)", textAlign: "center", border: "1px solid var(--ats-border)" }}>
                <p style={{ color: "var(--ats-text-muted)" }}>No interviews match the current filters.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
                {paginatedInterviews.map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    interview={interview}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onReschedule={handleOpenReschedule}
                    onJoinMeet={handleJoinMeet}
                    onFeedback={handleOpenFeedback}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === "queue" && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {shortlistedCandidates.length === 0 ? (
                <div style={{ background: "var(--ats-card-bg)", padding: "40px", borderRadius: "var(--ats-radius)", textAlign: "center", border: "1px solid var(--ats-border)" }}>
                  <p style={{ color: "var(--ats-text-muted)" }}>No candidates currently pending in shortlist queue.</p>
                </div>
              ) : (
                shortlistedCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.applicationId}
                    candidate={candidate}
                    onSchedule={(cand) => handleOpenSchedule(cand)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeView === "calendar" && (
          <div>
            <InterviewCalendar
              events={calendarEvents}
              interviews={interviews}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReschedule={handleOpenReschedule}
              onJoinMeet={handleJoinMeet}
            />
          </div>
        )}
      </div>

      {/* Bottom Full-Width Audit Log Section */}
      <div className="bottom-audit-log-section" style={{ width: "100%", marginTop: "12px" }}>
        <AuditLogPanel interviews={interviews} />
      </div>

      {/* Dialog Modals */}
      <ScheduleDialog
        isOpen={showScheduleModal}
        candidate={selectedCandidate}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={handleScheduleSubmit}
      />

      <ViewInterviewDialog
        isOpen={showViewModal}
        interview={selectedInterview}
        onClose={() => setShowViewModal(false)}
        onEdit={(inv) => {
          setShowViewModal(false);
          handleEdit(inv);
        }}
        onReschedule={(inv) => {
          setShowViewModal(false);
          handleOpenReschedule(inv);
        }}
        onDelete={(invId) => {
          setShowViewModal(false);
          handleDelete(invId);
        }}
        onJoinMeet={handleJoinMeet}
      />

      <EditInterviewDialog
        isOpen={showEditModal}
        interview={selectedInterview}
        onClose={() => setShowEditModal(false)}
        onSaveSuccess={refreshData}
      />

      <FeedbackDialog
        isOpen={showFeedbackModal}
        interview={selectedInterview}
        round={selectedRound}
        onClose={() => setShowFeedbackModal(false)}
        onSubmitFeedback={async (payload) => {
          await interviewService.submitFeedback(payload);
          refreshData();
        }}
      />

      <RescheduleDialog
        isOpen={showRescheduleModal}
        interview={selectedInterview}
        round={selectedRound}
        onClose={() => setShowRescheduleModal(false)}
        onReschedule={handleRescheduleSubmit}
      />

      {/* Global Toast Notifications */}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
};

const InterviewsPageWrapped = (props) => (
  <InterviewErrorBoundary>
    <InterviewsPage {...props} />
  </InterviewErrorBoundary>
);

export default InterviewsPageWrapped;
