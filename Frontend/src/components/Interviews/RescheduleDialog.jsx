import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, User, Award, Video, AlertCircle } from "lucide-react";

const INTERVIEW_ROUNDS = [
  "Technical Round 1",
  "Technical Round 2",
  "System Design",
  "HR / Behavioral",
  "Managerial Round",
  "Final Decision"
];

const RescheduleDialog = ({ isOpen, interview, round, onClose, onReschedule }) => {
  const [formData, setFormData] = useState({
    interviewDate: "",
    interviewTime: "10:00",
    interviewer: "",
    interviewRound: "Technical Round 1",
    durationMinutes: 45,
    googleMeetLink: "",
    reason: "Candidate schedule conflict"
  });

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Pre-populate form when dialog opens with existing interview data
  useEffect(() => {
    if (!isOpen || !interview) return;

    let initDate = "";
    if (interview.interviewDate) {
      initDate = new Date(interview.interviewDate).toISOString().split("T")[0];
    } else {
      initDate = new Date().toISOString().split("T")[0];
    }

    let initTime = "10:00";
    if (interview.interviewTime) {
      // If interviewTime is formatted like "10:30 AM", try to keep it or map to HH:MM
      initTime = interview.interviewTime;
    }

    setFormData({
      interviewDate: initDate,
      interviewTime: initTime || "10:00",
      interviewer: interview.interviewer || interview.Interviewer || "",
      interviewRound: interview.interviewRound || interview.InterviewRound || round?.title || "Technical Round 1",
      durationMinutes: interview.duration || round?.durationMinutes || 45,
      googleMeetLink: interview.googleMeetLink || interview.meetingUrl || "",
      reason: "Schedule conflict / updated slot"
    });
    setError(null);
  }, [isOpen, interview, round]);

  if (!isOpen || !interview) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 1. Validate required fields
    if (!formData.interviewDate || !formData.interviewTime || !formData.interviewer.trim()) {
      setError("Validation errors.");
      return;
    }

    // 2. Validate Google Meet Link
    if (formData.googleMeetLink && formData.googleMeetLink.trim().length > 0) {
      const trimmedLink = formData.googleMeetLink.trim().toLowerCase();
      if (!trimmedLink.startsWith("https://meet.google.com/")) {
        setError("Invalid Google Meet link.");
        return;
      }
    }

    setSubmitting(true);
    try {
      // Parse ISO string
      let scheduledISO = "";
      if (formData.interviewTime.includes(":")) {
        scheduledISO = new Date(`${formData.interviewDate}T${formData.interviewTime}:00`).toISOString();
      } else {
        scheduledISO = new Date(`${formData.interviewDate}T10:00:00`).toISOString();
      }

      const payload = {
        newScheduledTime: scheduledISO,
        interviewTime: formData.interviewTime,
        interviewer: formData.interviewer.trim(),
        interviewRound: formData.interviewRound.trim(),
        durationMinutes: parseInt(formData.durationMinutes, 10) || 45,
        reason: formData.reason.trim() || "Rescheduled by recruiter",
        googleMeetLink: formData.googleMeetLink.trim() || undefined,
        newMeetingUrl: formData.googleMeetLink.trim() || undefined,
        recruiterName: localStorage.getItem("userName") || "Lead Recruiter"
      };

      await onReschedule(interview.id, payload);
      onClose();
    } catch (err) {
      console.error("[RescheduleDialog] Error:", err);
      const isNet = err?.code === "ERR_NETWORK" || err?.message === "Network Error" || err?.response?.status >= 500;
      setError(isNet ? "Database error." : (err?.response?.data?.message || "Interview updating failed."));
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid var(--ats-border, #cbd5e1)",
    borderRadius: "8px",
    fontSize: "13px",
    background: "var(--ats-card-bg, #ffffff)",
    color: "var(--ats-text-main, #0f172a)",
    outline: "none",
    boxSizing: "border-box"
  };

  const labelStyle = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--ats-text-main, #1e293b)",
    marginBottom: "4px"
  };

  return (
    <div className="ats-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ats-modal-dialog" style={{ maxWidth: "600px" }}>
        
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          padding: "20px 24px", color: "#ffffff",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>Reschedule Interview</h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", opacity: 0.9 }}>
              Candidate: <strong>{interview.candidateName || interview.CandidateName}</strong> ({interview.jobRole})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{ background: "#fef2f2", borderBottom: "1px solid #fecaca", padding: "10px 24px", color: "#991b1b", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={labelStyle}><Calendar size={13} /> New Interview Date</label>
              <input
                type="date"
                required
                value={formData.interviewDate}
                onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}><Clock size={13} /> Start Time</label>
              <input
                type="text"
                required
                placeholder="e.g. 10:30 AM or 14:30"
                value={formData.interviewTime}
                onChange={(e) => setFormData({ ...formData, interviewTime: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={labelStyle}><User size={13} /> Assigned Interviewer</label>
              <input
                type="text"
                required
                value={formData.interviewer}
                onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}><Award size={13} /> Interview Round</label>
              <select
                value={formData.interviewRound}
                onChange={(e) => setFormData({ ...formData, interviewRound: e.target.value })}
                style={inputStyle}
              >
                {INTERVIEW_ROUNDS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label style={labelStyle}><Video size={13} /> Google Meet Link (Manual)</label>
              <button
                type="button"
                onClick={() => window.open("https://meet.google.com/new", "_blank", "noopener,noreferrer")}
                style={{
                  background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <Video size={12} /> Create Google Meet
              </button>
            </div>
            <input
              type="url"
              placeholder="Paste link: https://meet.google.com/xxx-xxxx-xxx"
              value={formData.googleMeetLink}
              onChange={(e) => setFormData({ ...formData, googleMeetLink: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ ...labelStyle, marginBottom: "4px" }}>Reason for Rescheduling</label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: "9px 18px", border: "1px solid var(--ats-border, #cbd5e1)", borderRadius: "8px", background: "var(--ats-bg, #fff)", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: "9px 22px", border: "none", borderRadius: "8px", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}
            >
              {submitting ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RescheduleDialog;
