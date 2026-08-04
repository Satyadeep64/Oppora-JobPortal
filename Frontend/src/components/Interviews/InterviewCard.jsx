import React, { memo } from "react";
import {
  Calendar, Clock, Video, Layers, UserCheck, Eye, Edit3, Trash2, ExternalLink, Award
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatInterviewDate, formatInterviewTime } from "../../utils/interviewUtils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #4f46e5, #818cf8)",
  "linear-gradient(135deg, #059669, #34d399)",
  "linear-gradient(135deg, #d97706, #fbbf24)",
  "linear-gradient(135deg, #dc2626, #f87171)",
  "linear-gradient(135deg, #7c3aed, #c084fc)",
];

const avatarGradient = (name = "") => {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_GRADIENTS[sum % AVATAR_GRADIENTS.length];
};

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

// ─── Pill component ───────────────────────────────────────────────────────────

const InfoPill = ({ icon: Icon, label, color = "#4f46e5" }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      fontSize: "12px",
      fontWeight: 600,
      color: "var(--ats-text-main, #0f172a)",
      background: "var(--ats-bg, #f8fafc)",
      border: "1px solid var(--ats-border, #e2e8f0)",
      borderRadius: "20px",
      padding: "4px 10px",
      whiteSpace: "nowrap",
    }}
  >
    <Icon size={12} color={color} />
    {label}
  </span>
);

// ─── Action button ────────────────────────────────────────────────────────────

const ActionBtn = ({ children, onClick, bg, color = "#fff", border, title }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      background: bg || "var(--ats-bg, #f1f5f9)",
      color: color,
      border: border || "none",
      borderRadius: "8px",
      padding: "7px 13px",
      fontSize: "12px",
      fontWeight: 700,
      cursor: "pointer",
      transition: "all 0.15s ease",
      whiteSpace: "nowrap",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
  >
    {children}
  </button>
);

// ─── InterviewCard ────────────────────────────────────────────────────────────

const InterviewCard = memo(({ interview, onView, onEdit, onDelete, onJoinMeet, onFeedback }) => {
  if (!interview) return null;

  const round = interview.rounds?.[0] || {};
  const meetUrl = interview.googleMeetLink || round.meetingDetails?.meetingUrl || "";

  const name = interview.candidateName || "Candidate";
  const role = interview.jobRole || interview.opportunityTitle || "Software Engineer";
  const roundTitle = interview.interviewRound || round.title || "Technical Round 1";
  const interviewer = interview.interviewer || "Recruiter";
  const status = interview.overallStatus || interview.interviewStatus || "Scheduled";
  const duration = interview.duration || round.durationMinutes || 45;

  // Resolve display date & time
  const dateSource = round.scheduledTime || interview.interviewDate;
  const timeSource = round.scheduledTime || interview.scheduledTime;

  const displayTime = timeSource
    ? formatInterviewTime(timeSource)
    : (interview.interviewTime || "10:00 AM");

  return (
    <div
      className="interview-card"
      style={{
        background: "var(--ats-card-bg, #ffffff)",
        border: "1px solid var(--ats-border, #e2e8f0)",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "var(--ats-shadow, 0 4px 6px -1px rgba(0,0,0,0.05))",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* ── Header: Avatar + Candidate Name + Status Badge ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: avatarGradient(name),
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            fontWeight: 800,
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
          }}
        >
          {initials(name)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 800,
                color: "var(--ats-text-main, #0f172a)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "220px",
              }}
              title={name}
            >
              {name}
            </h3>
            <StatusBadge status={status} />
          </div>

          <p
            style={{
              margin: "3px 0 0",
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--ats-primary, #4f46e5)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={role}
          >
            {role}
          </p>
        </div>
      </div>

      {/* ── Info Pills: Date, Time, Round, Interviewer ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <InfoPill icon={Calendar} label={formatInterviewDate(dateSource)} color="#4f46e5" />
        <InfoPill icon={Clock} label={`${displayTime} · ${duration} min`} color="#0284c7" />
        <InfoPill icon={Layers} label={roundTitle} color="#7c3aed" />
        <InfoPill icon={UserCheck} label={interviewer} color="#059669" />
      </div>

      {/* ── Google Meet Link Pill / Button ── */}
      {meetUrl && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "12px",
          }}
        >
          <Video size={14} color="#10b981" style={{ flexShrink: 0 }} />
          <a
            href={meetUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "var(--ats-text-main, #065f46)",
              fontWeight: 600,
              textDecoration: "none",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
            }}
          >
            {meetUrl}
          </a>
          <ExternalLink size={12} color="#10b981" style={{ flexShrink: 0 }} />
        </div>
      )}

      {/* ── Action Buttons: View, Edit, Scorecard, Delete, Join Google Meet ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          paddingTop: "10px",
          borderTop: "1px solid var(--ats-border, #f1f5f9)",
          justifyContent: "flex-end",
        }}
      >
        {/* View */}
        <ActionBtn
          title="View Details"
          bg="var(--ats-bg, #f1f5f9)"
          color="var(--ats-text-main, #334155)"
          border="1px solid var(--ats-border, #cbd5e1)"
          onClick={() => onView && onView(interview)}
        >
          <Eye size={13} /> View
        </ActionBtn>

        {/* Edit */}
        <ActionBtn
          title="Edit Interview"
          bg="#f59e0b"
          onClick={() => onEdit && onEdit(interview)}
        >
          <Edit3 size={13} /> Edit
        </ActionBtn>

        {/* Feedback Scorecard */}
        {onFeedback && (
          <ActionBtn
            title="Candidate Scorecard / Feedback"
            bg="#10b981"
            onClick={() => onFeedback(interview, round)}
          >
            <Award size={13} /> Scorecard
          </ActionBtn>
        )}

        {/* Delete */}
        <ActionBtn
          title="Delete Interview"
          bg="#ef4444"
          onClick={() => onDelete && onDelete(interview.id)}
        >
          <Trash2 size={13} /> Delete
        </ActionBtn>

        {/* Join Google Meet */}
        {meetUrl ? (
          <ActionBtn
            title="Join Google Meet"
            bg="linear-gradient(135deg, #059669, #10b981)"
            onClick={() => onJoinMeet && onJoinMeet(meetUrl)}
          >
            <Video size={13} /> Join Meet
          </ActionBtn>
        ) : (
          <ActionBtn
            title="No Meet link assigned"
            bg="#94a3b8"
            onClick={() => alert("No Google Meet link assigned to this interview.")}
          >
            <Video size={13} /> No Meet
          </ActionBtn>
        )}
      </div>
    </div>
  );
});

export default InterviewCard;
