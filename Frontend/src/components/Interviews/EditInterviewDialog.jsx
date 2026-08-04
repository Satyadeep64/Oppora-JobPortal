import React, { useState, useEffect } from "react";
import {
  X, Edit3, User, Mail, Phone, Briefcase, Building2, UserCheck, Layers,
  Calendar, Clock, Video, FileText, CheckCircle2, RefreshCw, AlertCircle
} from "lucide-react";
import { interviewService } from "../../services/interviewService";

const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design / UX",
  "Data Science & AI",
  "Quality Assurance",
  "Human Resources",
  "Marketing",
  "Sales & Business"
];

const INTERVIEW_ROUNDS = [
  "Screening Round",
  "Technical Round 1",
  "Technical Round 2",
  "System Design",
  "Managerial Round",
  "Culture & HR Round"
];

const INTERVIEW_TYPES = [
  "Technical",
  "Screening",
  "System Design",
  "Behavioral / HR",
  "Coding Assessment"
];

const EditInterviewDialog = ({ isOpen, interview, onClose, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    candidateName: "",
    candidateEmail: "",
    phone: "",
    jobRole: "",
    department: "Engineering",
    interviewer: "",
    interviewRound: "Technical Round 1",
    interviewType: "Technical",
    interviewDate: "",
    interviewTime: "10:00",
    duration: 45,
    googleMeetLink: "",
    notes: ""
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !interview) return;
    const round = interview.rounds?.[0] || {};
    const meeting = round.meetingDetails || {};

    const scheduledDate = round.scheduledTime
      ? new Date(round.scheduledTime).toISOString().slice(0, 10)
      : interview.interviewDate
      ? new Date(interview.interviewDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    const scheduledTime = round.scheduledTime
      ? new Date(round.scheduledTime).toTimeString().slice(0, 5)
      : "10:00";

    setFormData({
      candidateName: interview.candidateName || "",
      candidateEmail: interview.candidateEmail || "",
      phone: interview.candidatePhone || "",
      jobRole: interview.jobRole || interview.opportunityTitle || "",
      department: interview.department || "Engineering",
      interviewer: interview.interviewer || interview.recruiterName || "Dr. Alan Turing",
      interviewRound: interview.interviewRound || round.title || "Technical Round 1",
      interviewType: interview.interviewType || round.interviewType || "Technical",
      interviewDate: scheduledDate,
      interviewTime: scheduledTime,
      duration: interview.duration || round.durationMinutes || 45,
      googleMeetLink: interview.googleMeetLink || meeting.meetingUrl || "",
      notes: interview.specialInstructions || interview.notes || ""
    });
    setError(null);
  }, [isOpen, interview]);

  if (!isOpen || !interview) return null;

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Form Validation
    if (!formData.candidateName.trim() || !formData.candidateEmail.trim() || !formData.jobRole.trim() || !formData.interviewer.trim()) {
      setError("Validation errors.");
      return;
    }

    if (formData.googleMeetLink && formData.googleMeetLink.trim()) {
      if (!formData.googleMeetLink.trim().toLowerCase().startsWith("https://meet.google.com/")) {
        setError("Invalid Google Meet link.");
        return;
      }
    }

    setSaving(true);
    try {
      const scheduledDateTime = new Date(`${formData.interviewDate}T${formData.interviewTime}:00`).toISOString();

      const payload = {
        candidateName: formData.candidateName.trim(),
        candidateEmail: formData.candidateEmail.trim(),
        candidatePhone: formData.phone.trim(),
        jobRole: formData.jobRole.trim(),
        customJobTitle: formData.jobRole.trim(),
        department: formData.department,
        interviewer: formData.interviewer.trim(),
        roundTitle: formData.interviewRound,
        interviewRound: formData.interviewRound,
        interviewType: formData.interviewType,
        scheduledTime: scheduledDateTime,
        interviewDate: formData.interviewDate,
        interviewTime: formData.interviewTime,
        durationMinutes: parseInt(formData.duration, 10),
        duration: parseInt(formData.duration, 10),
        customMeetingUrl: formData.googleMeetLink.trim() || undefined,
        googleMeetLink: formData.googleMeetLink.trim() || undefined,
        specialInstructions: formData.notes.trim(),
        recruiterNotes: formData.notes.trim(),
        overallStatus: interview.overallStatus || "Scheduled"
      };

      await interviewService.updateInterview(interview.id, payload);

      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      console.error("[EditInterviewDialog] Update failed:", err);
      const isNet = err?.code === "ERR_NETWORK" || err?.message === "Network Error" || err?.response?.status >= 500;
      setError(isNet ? "Database connection failed." : (err?.response?.data?.message || "Interview updating failed."));
    } finally {
      setSaving(false);
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
    display: "block",
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--ats-text-main, #1e293b)",
    marginBottom: "4px"
  };

  return (
    <div className="ats-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ats-modal-dialog" style={{ maxWidth: "720px" }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          padding: "20px 28px", color: "#ffffff",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexShrink: 0
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
              <Edit3 size={18} /> Edit Interview Details
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "12px", opacity: 0.9 }}>
              Update schedule parameters for candidate {interview.candidateName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.2)", border: "none", color: "#fff",
              borderRadius: "50%", width: "32px", height: "32px",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", borderBottom: "1px solid #fecaca", padding: "10px 24px", color: "#991b1b", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 28px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Candidate Name</label>
              <input type="text" value={formData.candidateName} onChange={handleChange("candidateName")} style={inputStyle} required />
            </div>

            <div>
              <label style={labelStyle}>Candidate Email</label>
              <input type="email" value={formData.candidateEmail} onChange={handleChange("candidateEmail")} style={inputStyle} required />
            </div>

            <div>
              <label style={labelStyle}>Phone Number</label>
              <input type="text" value={formData.phone} onChange={handleChange("phone")} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Role / Position</label>
              <input type="text" value={formData.jobRole} onChange={handleChange("jobRole")} style={inputStyle} required />
            </div>

            <div>
              <label style={labelStyle}>Department</label>
              <select value={formData.department} onChange={handleChange("department")} style={inputStyle}>
                {DEPARTMENTS.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Interviewer</label>
              <input type="text" value={formData.interviewer} onChange={handleChange("interviewer")} style={inputStyle} required />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Interview Round</label>
              <select value={formData.interviewRound} onChange={handleChange("interviewRound")} style={inputStyle}>
                {INTERVIEW_ROUNDS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Interview Type</label>
              <select value={formData.interviewType} onChange={handleChange("interviewType")} style={inputStyle}>
                {INTERVIEW_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Interview Date</label>
              <input type="date" value={formData.interviewDate} onChange={handleChange("interviewDate")} style={inputStyle} required />
            </div>

            <div>
              <label style={labelStyle}>Start Time</label>
              <input type="time" value={formData.interviewTime} onChange={handleChange("interviewTime")} style={inputStyle} required />
            </div>

            <div>
              <label style={labelStyle}>Duration (mins)</label>
              <select value={formData.duration} onChange={handleChange("duration")} style={inputStyle}>
                <option value={15}>15 Mins</option>
                <option value={30}>30 Mins</option>
                <option value={45}>45 Mins</option>
                <option value={60}>60 Mins (1 Hr)</option>
                <option value={90}>90 Mins</option>
                <option value={120}>120 Mins</option>
              </select>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label style={labelStyle}>Google Meet Link (Manual)</label>
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
            <input type="text" value={formData.googleMeetLink} onChange={handleChange("googleMeetLink")} placeholder="Paste link: https://meet.google.com/..." style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Notes & Instructions</label>
            <textarea rows={2} value={formData.notes} onChange={handleChange("notes")} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          {/* Footer Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "14px", borderTop: "1px solid var(--ats-border)" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ background: "var(--ats-bg)", color: "var(--ats-text-main)", border: "1px solid var(--ats-border)", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{ background: "#f59e0b", color: "#ffffff", border: "none", borderRadius: "8px", padding: "8px 20px", fontSize: "13px", fontWeight: "800", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              {saving ? <RefreshCw size={14} className="spin-icon" style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle2 size={15} />}
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditInterviewDialog;
