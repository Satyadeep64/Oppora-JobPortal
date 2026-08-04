import React from "react";
import {
  Video, Calendar, Clock, Eye, Edit3, Trash2, Send, RefreshCw,
  ArrowUpDown, ChevronLeft, ChevronRight, MailCheck, ExternalLink, User, Award
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatInterviewDate, formatInterviewTime } from "../../utils/interviewUtils";

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #4f46e5, #818cf8)",
  "linear-gradient(135deg, #059669, #34d399)",
  "linear-gradient(135deg, #d97706, #fbbf24)",
  "linear-gradient(135deg, #dc2626, #f87171)",
  "linear-gradient(135deg, #7c3aed, #c084fc)"
];

const getAvatarGradient = (name = "") => {
  let charCodeSum = 0;
  for (let i = 0; i < name.length; i++) {
    charCodeSum += name.charCodeAt(i);
  }
  return AVATAR_GRADIENTS[charCodeSum % AVATAR_GRADIENTS.length];
};

const InterviewTable = ({
  interviews = [],
  onView,
  onEdit,
  onDelete,
  onFeedback,
  onReschedule,
  onJoinMeet,
  sortField,
  sortOrder,
  onSortChange,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange
}) => {

  const handleSortClick = (field) => {
    if (!onSortChange) return;
    if (sortField === field) {
      onSortChange(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange(field, "asc");
    }
  };

  return (
    <div className="interview-table-wrapper" style={{
      background: "var(--ats-card-bg, #ffffff)",
      border: "1px solid var(--ats-border, #e2e8f0)",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "var(--ats-shadow, 0 4px 6px -1px rgba(0,0,0,0.05))"
    }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
          <thead>
            <tr style={{
              background: "var(--ats-bg, #f8fafc)",
              borderBottom: "1px solid var(--ats-border, #e2e8f0)",
              color: "var(--ats-text-muted, #64748b)",
              fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.6px",
              userSelect: "none"
            }}>
              <th style={{ padding: "14px 18px" }}>
                Candidate & Role
              </th>

              <th
                onClick={() => handleSortClick("name")}
                style={{ padding: "14px 18px", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  Candidate Name <ArrowUpDown size={12} />
                </div>
              </th>

              <th
                onClick={() => handleSortClick("role")}
                style={{ padding: "14px 18px", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  Role & Dept <ArrowUpDown size={12} />
                </div>
              </th>

              <th
                onClick={() => handleSortClick("date")}
                style={{ padding: "14px 18px", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  Date & Time <ArrowUpDown size={12} />
                </div>
              </th>

              <th
                onClick={() => handleSortClick("status")}
                style={{ padding: "14px 18px", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  Status <ArrowUpDown size={12} />
                </div>
              </th>

              <th style={{ padding: "14px 18px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(!Array.isArray(interviews) || interviews.length === 0) ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--ats-text-muted)" }}>
                  No interviews available matching the filters.
                </td>
              </tr>
            ) : (
              interviews.filter(Boolean).map((interview) => {
                const round = interview.rounds?.[0] || {};
                const meeting = round.meetingDetails || {};
                const meetUrl = interview.googleMeetLink || meeting.meetingUrl || "";

                const candidateName = interview.candidateName || "Candidate";
                const initials = candidateName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <tr
                    key={interview.id}
                    style={{
                      borderBottom: "1px solid var(--ats-border, #e2e8f0)",
                      transition: "background 0.15s ease"
                    }}
                  >
                    {/* Candidate Avatar */}
                    <td style={{ padding: "14px 18px", width: "48px" }}>
                      <div style={{
                        width: "40px", height: "40px", borderRadius: "50%",
                        background: getAvatarGradient(candidateName),
                        color: "#ffffff", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "14px", fontWeight: "800",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.12)"
                      }}>
                        {initials}
                      </div>
                    </td>

                    {/* Candidate Name & Email */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: "800", color: "var(--ats-text-main, #0f172a)", fontSize: "14px" }}>
                        {candidateName}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--ats-text-muted, #64748b)", marginTop: "2px" }}>
                        {interview.candidateEmail}
                      </div>
                    </td>

                    {/* Role & Dept */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: "700", color: "var(--ats-primary, #4f46e5)", fontSize: "13px" }}>
                        {interview.jobRole || interview.opportunityTitle || "Software Engineer"}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--ats-text-muted, #64748b)", marginTop: "2px" }}>
                        {interview.department || "Engineering"} • {interview.interviewer || "Recruiter"}
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: "700", color: "var(--ats-text-main)", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={13} color="#4f46e5" /> {formatInterviewDate(round.scheduledTime || interview.interviewDate)}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--ats-text-muted)", marginTop: "3px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={13} /> {formatInterviewTime(round.scheduledTime || interview.scheduledTime)} ({interview.duration || round.durationMinutes || 45}m)
                      </div>
                    </td>

                    {/* Status Chip */}
                    <td style={{ padding: "14px 18px" }}>
                      <StatusBadge status={interview.overallStatus || interview.interviewStatus} />
                    </td>

                    {/* Action Buttons: View, Edit, Delete, Reschedule, Join Google Meet */}
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "5px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {/* View */}
                        <button
                          title="View Details"
                          type="button"
                          onClick={() => onView && onView(interview)}
                          style={{
                            background: "var(--ats-bg, #f1f5f9)", color: "var(--ats-text-main, #334155)",
                            border: "1px solid var(--ats-border, #cbd5e1)", borderRadius: "6px",
                            padding: "6px 8px", cursor: "pointer", display: "inline-flex", alignItems: "center"
                          }}
                        >
                          <Eye size={14} />
                        </button>

                        {/* Edit */}
                        <button
                          title="Edit Interview"
                          type="button"
                          onClick={() => onEdit && onEdit(interview)}
                          style={{
                            background: "#f59e0b", color: "#ffffff",
                            border: "none", borderRadius: "6px",
                            padding: "6px 8px", cursor: "pointer", display: "inline-flex", alignItems: "center"
                          }}
                        >
                          <Edit3 size={14} />
                        </button>

                        {/* Delete */}
                        <button
                          title="Delete Interview"
                          type="button"
                          onClick={() => onDelete && onDelete(interview.id)}
                          style={{
                            background: "#ef4444", color: "#ffffff",
                            border: "none", borderRadius: "6px",
                            padding: "6px 8px", cursor: "pointer", display: "inline-flex", alignItems: "center"
                          }}
                        >
                          <Trash2 size={14} />
                        </button>

                        {/* Scorecard / Feedback */}
                        {onFeedback && (
                          <button
                            title="Candidate Scorecard"
                            type="button"
                            onClick={() => onFeedback(interview, round)}
                            style={{
                              background: "#10b981", color: "#ffffff",
                              border: "none", borderRadius: "6px",
                              padding: "6px 8px", cursor: "pointer", display: "inline-flex", alignItems: "center"
                            }}
                          >
                            <Award size={14} />
                          </button>
                        )}

                        {/* Reschedule */}
                        <button
                          title="Reschedule"
                          type="button"
                          onClick={() => onReschedule && onReschedule(interview, round)}
                          style={{
                            background: "#4f46e5", color: "#ffffff",
                            border: "none", borderRadius: "6px",
                            padding: "6px 8px", cursor: "pointer", display: "inline-flex", alignItems: "center"
                          }}
                        >
                          <RefreshCw size={14} />
                        </button>

                        {/* Join Google Meet */}
                        {meetUrl && (
                          <button
                            title="Join Google Meet"
                            type="button"
                            onClick={() => onJoinMeet && onJoinMeet(meetUrl)}
                            style={{
                              background: "#0284c7", color: "#ffffff",
                              border: "none", borderRadius: "6px",
                              padding: "6px 10px", fontSize: "11px", fontWeight: "700",
                              cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px"
                            }}
                          >
                            <Video size={13} /> Meet
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Controls */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 20px", background: "var(--ats-bg, #f8fafc)",
        borderTop: "1px solid var(--ats-border, #e2e8f0)", flexWrap: "wrap", gap: "10px"
      }}>
        <div style={{ fontSize: "12px", color: "var(--ats-text-muted, #64748b)", fontWeight: "600" }}>
          Showing {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, totalItems)} of {totalItems} Interviews
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* Items Per Page Select */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--ats-text-muted)" }}>
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange && onPageSizeChange(parseInt(e.target.value, 10))}
              style={{
                background: "var(--ats-card-bg)", border: "1px solid var(--ats-border)",
                borderRadius: "6px", padding: "4px 8px", fontSize: "12px", color: "var(--ats-text-main)"
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Page Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              style={{
                background: "var(--ats-card-bg)", border: "1px solid var(--ats-border)",
                borderRadius: "6px", padding: "5px 10px", fontSize: "12px",
                cursor: currentPage <= 1 ? "not-allowed" : "pointer", opacity: currentPage <= 1 ? 0.5 : 1,
                display: "inline-flex", alignItems: "center"
              }}
            >
              <ChevronLeft size={14} /> Prev
            </button>

            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--ats-text-main)", padding: "0 6px" }}>
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              style={{
                background: "var(--ats-card-bg)", border: "1px solid var(--ats-border)",
                borderRadius: "6px", padding: "5px 10px", fontSize: "12px",
                cursor: currentPage >= totalPages ? "not-allowed" : "pointer", opacity: currentPage >= totalPages ? 0.5 : 1,
                display: "inline-flex", alignItems: "center"
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default InterviewTable;
