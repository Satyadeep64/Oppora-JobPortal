import React, { useState } from "react";
import {
  X, User, Mail, Phone, Briefcase, Building2, UserCheck, Layers,
  Calendar, Clock, Video, FileText, CheckCircle2, History, ExternalLink,
  Copy, Check, Edit3, RefreshCw, Trash2, AlertTriangle, ShieldCheck
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatInterviewDate, formatInterviewTime } from "../../utils/interviewUtils";

const ViewInterviewDialog = ({
  isOpen,
  interview,
  onClose,
  onEdit,
  onReschedule,
  onDelete,
  onJoinMeet
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !interview) return null;

  const round = interview.rounds?.[0] || {};
  const meeting = round.meetingDetails || {};
  const meetUrl = interview.googleMeetLink || interview.meetingUrl || meeting.meetingUrl || "";

  const candidateName = interview.candidateName || interview.CandidateName || "Candidate";
  const candidateEmail = interview.candidateEmail || interview.CandidateEmail || "N/A";
  const candidatePhone = interview.candidatePhone || interview.CandidatePhone || "N/A";
  const jobRole = interview.jobRole || interview.customJobTitle || "Role";
  const department = interview.department || "Engineering";
  const interviewer = interview.interviewer || interview.Interviewer || interview.recruiterName || "Recruiter Admin";
  const interviewRound = interview.interviewRound || interview.roundTitle || round.title || "Technical Round 1";
  const overallStatus = interview.overallStatus || interview.interviewStatus || interview.status || "Scheduled";
  const duration = interview.duration || round.durationMinutes || 45;
  const createdBy = interview.createdBy || interview.CreatedBy || interviewer;
  const updatedBy = interview.updatedBy || interview.UpdatedBy || (interview.updatedOn ? `Recruiter Admin (${new Date(interview.updatedOn).toLocaleDateString()})` : createdBy);

  const rawDate = round.scheduledTime || interview.interviewDate;
  const formattedDate = formatInterviewDate(rawDate);
  const formattedTime = formatInterviewTime(round.scheduledTime || interview.scheduledTime || interview.interviewTime);

  const invitationStatus = interview.invitationStatus || (round.isEmailSent ? "Sent" : "Pending");

  const candidateInitials = candidateName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleCopyLink = () => {
    if (!meetUrl) return;
    navigator.clipboard.writeText(meetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compile timeline nodes
  const timelineEvents = [];
  if (Array.isArray(interview.audits) && interview.audits.length > 0) {
    interview.audits.forEach((aud) => {
      timelineEvents.push({
        title: aud.action,
        by: aud.performedByName || aud.performedBy || "Recruiter Admin",
        details: aud.changes || aud.details || aud.newValue || "",
        time: aud.performedOn ? new Date(aud.performedOn).toLocaleString() : "Recently",
        rawDate: new Date(aud.performedOn || Date.now())
      });
    });
  } else {
    // Derived Timeline
    timelineEvents.push({
      title: "Interview Scheduled",
      by: createdBy,
      details: `Scheduled ${interviewRound} for ${jobRole} on ${formattedDate} at ${formattedTime}`,
      time: interview.createdOn ? new Date(interview.createdOn).toLocaleString() : "Recently",
      rawDate: new Date(interview.createdOn || Date.now())
    });

    if (invitationStatus === "Sent") {
      timelineEvents.push({
        title: "Email Sent",
        by: "EmailService (SMTP)",
        details: `Dispatched HTML invitation email to ${candidateEmail}`,
        time: interview.updatedOn ? new Date(interview.updatedOn).toLocaleString() : "Recently",
        rawDate: new Date(interview.updatedOn || Date.now())
      });
    } else if (invitationStatus === "Failed") {
      timelineEvents.push({
        title: "Email Failed",
        by: "EmailService (SMTP)",
        details: "SMTP invitation delivery failed. Retry available.",
        time: interview.updatedOn ? new Date(interview.updatedOn).toLocaleString() : "Recently",
        rawDate: new Date(interview.updatedOn || Date.now())
      });
    }

    if (overallStatus === "Rescheduled") {
      timelineEvents.push({
        title: "Interview Rescheduled",
        by: interviewer,
        details: `Updated slot to ${formattedDate} at ${formattedTime}`,
        time: interview.updatedOn ? new Date(interview.updatedOn).toLocaleString() : "Recently",
        rawDate: new Date(interview.updatedOn || Date.now())
      });
    }
  }

  return (
    <div className="ats-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ats-modal-dialog" style={{ maxWidth: "780px", width: "95%" }}>
        
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)",
          padding: "20px 24px", color: "#ffffff",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderTopLeftRadius: "16px", borderTopRightRadius: "16px",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "50%",
              background: "rgba(255,255,255,0.25)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", fontWeight: "800", flexShrink: 0
            }}>
              {candidateInitials}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>
                  {candidateName}
                </h3>
                <StatusBadge status={overallStatus} />
              </div>
              <p style={{ margin: "3px 0 0", fontSize: "13px", opacity: 0.9 }}>
                {jobRole} • {department} Department
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.2)", border: "none", color: "#fff",
              borderRadius: "50%", width: "32px", height: "32px",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "24px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Details Grid (Responsive) */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px"
          }}>
            
            {/* Candidate Card */}
            <div style={{ background: "var(--ats-bg, #f8fafc)", border: "1px solid var(--ats-border, #e2e8f0)", borderRadius: "12px", padding: "14px 16px" }}>
              <h4 style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: "800", color: "#4f46e5", display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={14} /> Candidate Info
              </h4>
              <p style={{ margin: "4px 0", fontSize: "13px", color: "var(--ats-text-main)" }}>
                <b>Name:</b> {candidateName}
              </p>
              <p style={{ margin: "4px 0", fontSize: "13px", color: "var(--ats-text-main)", overflow: "hidden", textOverflow: "ellipsis" }}>
                <b>Email:</b> {candidateEmail}
              </p>
              <p style={{ margin: "4px 0", fontSize: "13px", color: "var(--ats-text-main)" }}>
                <b>Phone:</b> {candidatePhone}
              </p>
            </div>

            {/* Position & Round */}
            <div style={{ background: "var(--ats-bg, #f8fafc)", border: "1px solid var(--ats-border, #e2e8f0)", borderRadius: "12px", padding: "14px 16px" }}>
              <h4 style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: "800", color: "#4f46e5", display: "flex", alignItems: "center", gap: "6px" }}>
                <Briefcase size={14} /> Role & Interviewer
              </h4>
              <p style={{ margin: "4px 0", fontSize: "13px", color: "var(--ats-text-main)" }}>
                <b>Job Role:</b> {jobRole}
              </p>
              <p style={{ margin: "4px 0", fontSize: "13px", color: "var(--ats-text-main)" }}>
                <b>Department:</b> {department}
              </p>
              <p style={{ margin: "4px 0", fontSize: "13px", color: "var(--ats-text-main)" }}>
                <b>Interviewer:</b> {interviewer}
              </p>
              <p style={{ margin: "4px 0", fontSize: "13px", color: "var(--ats-text-main)" }}>
                <b>Round:</b> {interviewRound}
              </p>
            </div>

            {/* Schedule Details */}
            <div style={{ background: "var(--ats-bg, #f8fafc)", border: "1px solid var(--ats-border, #e2e8f0)", borderRadius: "12px", padding: "14px 16px" }}>
              <h4 style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: "800", color: "#4f46e5", display: "flex", alignItems: "center", gap: "6px" }}>
                <Calendar size={14} /> Schedule & Email
              </h4>
              <p style={{ margin: "4px 0", fontSize: "13px", color: "var(--ats-text-main)" }}>
                <b>Date:</b> {formattedDate}
              </p>
              <p style={{ margin: "4px 0", fontSize: "13px", color: "var(--ats-text-main)" }}>
                <b>Time:</b> {formattedTime}
              </p>
              <p style={{ margin: "4px 0", fontSize: "13px", color: "var(--ats-text-main)" }}>
                <b>Duration:</b> {duration} minutes
              </p>
              <p style={{ margin: "4px 0", fontSize: "13px", color: "var(--ats-text-main)", display: "flex", alignItems: "center", gap: "6px" }}>
                <b>Email Status:</b> 
                <span style={{
                  color: invitationStatus === "Sent" ? "#10b981" : invitationStatus === "Failed" ? "#ef4444" : "#f59e0b",
                  fontWeight: "800"
                }}>
                  {invitationStatus}
                </span>
              </p>
            </div>

          </div>

          {/* Audit Metadata Box (Created By / Updated By) */}
          <div style={{
            background: "var(--ats-card-bg, #ffffff)", border: "1px solid var(--ats-border, #e2e8f0)",
            borderRadius: "12px", padding: "12px 16px", display: "flex", justifyContent: "space-between",
            fontSize: "12px", color: "var(--ats-text-muted)", flexWrap: "wrap", gap: "10px"
          }}>
            <div><b>Created By:</b> {createdBy}</div>
            <div><b>Updated By:</b> {updatedBy}</div>
          </div>

          {/* Google Meet Link Banner */}
          {meetUrl && (
            <div style={{
              background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
              border: "1px solid #a7f3d0", borderRadius: "12px", padding: "14px 18px",
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "220px" }}>
                <Video size={22} color="#059669" />
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontWeight: "800", fontSize: "13px", color: "#065f46" }}>Google Meet Link</div>
                  <div style={{ fontSize: "12px", color: "#1d4ed8", fontWeight: "600", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {meetUrl}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={{
                    background: "#ffffff", color: "#065f46", border: "1px solid #a7f3d0",
                    borderRadius: "8px", padding: "8px 14px", fontSize: "12px",
                    fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px"
                  }}
                >
                  {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy Meet Link"}
                </button>

                <button
                  type="button"
                  onClick={() => onJoinMeet ? onJoinMeet(meetUrl) : window.open(meetUrl, "_blank", "noopener,noreferrer")}
                  style={{
                    background: "#10b981", color: "#ffffff", border: "none",
                    borderRadius: "8px", padding: "8px 16px", fontSize: "12px",
                    fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px"
                  }}
                >
                  <ExternalLink size={14} /> Join Google Meet
                </button>
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <div style={{
            background: "var(--ats-bg, #f8fafc)", border: "1px solid var(--ats-border, #e2e8f0)",
            borderRadius: "12px", padding: "16px 18px"
          }}>
            <h4 style={{ margin: "0 0 14px", fontSize: "14px", fontWeight: "800", color: "var(--ats-text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
              <History size={16} color="#4f46e5" /> Activity Timeline
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative", paddingLeft: "8px" }}>
              {timelineEvents.map((ev, idx) => (
                <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{
                    width: "10px", height: "10px", borderRadius: "50%",
                    background: ev.title.includes("Failed") ? "#ef4444" : ev.title.includes("Rescheduled") ? "#f59e0b" : "#4f46e5",
                    marginTop: "4px", flexShrink: 0
                  }} />
                  <div style={{ flex: 1, fontSize: "12px", color: "var(--ats-text-main)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: "800", color: "var(--ats-text-main)" }}>{ev.title}</span>
                      <span style={{ fontSize: "11px", color: "var(--ats-text-muted)" }}>{ev.time}</span>
                    </div>
                    <div style={{ color: "var(--ats-text-muted)", marginTop: "2px" }}>
                      By <b>{ev.by}</b> — {ev.details}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Action Buttons */}
        <div style={{
          padding: "16px 24px", borderTop: "1px solid var(--ats-border, #e2e8f0)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "10px", flexShrink: 0
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "var(--ats-bg, #fff)", color: "var(--ats-text-main, #334155)",
              border: "1px solid var(--ats-border, #cbd5e1)", borderRadius: "8px",
              padding: "9px 18px", fontSize: "13px", fontWeight: "700", cursor: "pointer"
            }}
          >
            Close
          </button>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(interview)}
                style={{
                  background: "#3b82f6", color: "#fff", border: "none",
                  borderRadius: "8px", padding: "9px 16px", fontSize: "13px",
                  fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px"
                }}
              >
                <Edit3 size={14} /> Edit
              </button>
            )}

            {onReschedule && (
              <button
                type="button"
                onClick={() => onReschedule(interview)}
                style={{
                  background: "#f59e0b", color: "#fff", border: "none",
                  borderRadius: "8px", padding: "9px 16px", fontSize: "13px",
                  fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px"
                }}
              >
                <RefreshCw size={14} /> Reschedule
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(interview.id)}
                style={{
                  background: "#ef4444", color: "#fff", border: "none",
                  borderRadius: "8px", padding: "9px 16px", fontSize: "13px",
                  fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px"
                }}
              >
                <Trash2 size={14} /> Delete
              </button>
            )}

            {meetUrl && (
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  background: "var(--ats-bg, #f1f5f9)", color: "var(--ats-text-main, #0f172a)",
                  border: "1px solid var(--ats-border, #cbd5e1)", borderRadius: "8px",
                  padding: "9px 14px", fontSize: "13px", fontWeight: "700",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "5px"
                }}
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy Meet Link"}
              </button>
            )}

            {meetUrl && (
              <button
                type="button"
                onClick={() => onJoinMeet ? onJoinMeet(meetUrl) : window.open(meetUrl, "_blank", "noopener,noreferrer")}
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff", border: "none", borderRadius: "8px",
                  padding: "9px 18px", fontSize: "13px", fontWeight: "800",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                }}
              >
                <Video size={15} /> Join Google Meet
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ViewInterviewDialog;
