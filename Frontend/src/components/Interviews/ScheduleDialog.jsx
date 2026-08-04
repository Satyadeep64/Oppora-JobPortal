import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Briefcase,
  UserCheck,
  Layers,
  Calendar,
  Clock,
  Video,
  FileText,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { interviewService } from "../../services/interviewService";

// ─── Constants ────────────────────────────────────────────────────────────────

const INTERVIEW_ROUNDS = [
  "Screening Round",
  "Technical Round 1",
  "Technical Round 2",
  "System Design",
  "Managerial Round",
  "Culture & HR Round",
];

const INTERVIEWERS = [
  "Dr. Alan Turing (Lead Engineer)",
  "Sarah Jenkins (Engineering Manager)",
  "Michael Scott (Senior Recruiter)",
  "Dr. Grace Hopper (Systems Architect)",
  "Ada Lovelace (Data Science Lead)",
  "Recruiter Admin",
];

const DURATION_OPTIONS = [
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "45 minutes", value: 45 },
  { label: "60 minutes (1 hr)", value: 60 },
  { label: "90 minutes (1.5 hrs)", value: 90 },
  { label: "120 minutes (2 hrs)", value: 120 },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,}$/;
const MEET_URL_REGEX = /^https?:\/\/(www\.)?meet\.google\.com\/[a-z0-9-]+$/i;

const getTodayString = () => new Date().toISOString().slice(0, 10);

// ─── Initial Form Builder ─────────────────────────────────────────────────────

const buildInitialForm = (candidate) => ({
  candidateName: candidate?.fullName || candidate?.candidateName || "",
  candidateEmail: candidate?.email || candidate?.candidateEmail || "",
  phone: candidate?.phoneNumber || candidate?.phone || "",
  jobRole: candidate?.opportunityTitle || candidate?.jobRole || "",
  interviewer: INTERVIEWERS[0],
  interviewRound: INTERVIEW_ROUNDS[1],
  interviewDate: getTodayString(),
  interviewTime: "10:00",
  duration: 45,
  googleMeetLink: "",
  notes: "",
});

// ─── Sub-components ───────────────────────────────────────────────────────────

const FieldError = ({ message }) =>
  message ? (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        marginTop: "4px",
        fontSize: "11px",
        fontWeight: 600,
        color: "#ef4444",
      }}
    >
      <AlertCircle size={11} />
      {message}
    </span>
  ) : null;

const FormLabel = ({ icon: Icon, children, required }) => (
  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "12px",
      fontWeight: 700,
      color: "var(--ats-text-main, #1e293b)",
      marginBottom: "5px",
    }}
  >
    {Icon && <Icon size={12} />}
    {children}
    {required && <span style={{ color: "#ef4444" }}>*</span>}
  </label>
);

// ─── ScheduleDialog Component ─────────────────────────────────────────────────

const ScheduleDialog = ({ isOpen, candidate, onClose, onSchedule }) => {
  const [form, setForm] = useState(buildInitialForm(candidate));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (!isOpen) return;
    setForm(buildInitialForm(candidate));
    setErrors({});
    setServerError(null);
  }, [isOpen, candidate]);

  // Escape key listener to close dialog
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // ── Form Handlers ─────────────────────────────────────────────────────────

  const handleChange = (field) => (e) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleReset = () => {
    setForm(buildInitialForm(candidate));
    setErrors({});
    setServerError(null);
  };

  // ── Validation ────────────────────────────────────────────────────────────

  const validate = () => {
    const errs = {};

    // 1. Candidate Name
    if (!form.candidateName.trim()) {
      errs.candidateName = "Candidate name is required";
    }

    // 2. Candidate Email & Format
    if (!form.candidateEmail.trim()) {
      errs.candidateEmail = "Candidate email is required";
    } else if (!EMAIL_REGEX.test(form.candidateEmail.trim())) {
      errs.candidateEmail = "Enter a valid email address (e.g. name@example.com)";
    }

    // 3. Phone Number & Format
    if (!form.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!PHONE_REGEX.test(form.phone.trim())) {
      errs.phone = "Enter a valid phone number (min. 7 digits)";
    }

    // 4. Job Role
    if (!form.jobRole.trim()) {
      errs.jobRole = "Job role is required";
    }

    // 5. Interviewer
    if (!form.interviewer.trim()) {
      errs.interviewer = "Interviewer is required";
    }

    // 6. Interview Round
    if (!form.interviewRound.trim()) {
      errs.interviewRound = "Interview round is required";
    }

    // 7. Interview Date Validation
    if (!form.interviewDate) {
      errs.interviewDate = "Interview date is required";
    } else {
      const selected = new Date(`${form.interviewDate}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(selected.getTime())) {
        errs.interviewDate = "Enter a valid date";
      } else if (selected < today) {
        errs.interviewDate = "Interview date cannot be in the past";
      }
    }

    // 8. Interview Time Validation
    if (!form.interviewTime) {
      errs.interviewTime = "Interview time is required";
    } else {
      const [hours, minutes] = form.interviewTime.split(":");
      if (hours === undefined || minutes === undefined || isNaN(Number(hours)) || isNaN(Number(minutes))) {
        errs.interviewTime = "Enter a valid time (HH:MM)";
      }
    }

    // 9. Duration Validation
    const dur = Number(form.duration);
    if (!dur || dur < 15 || dur > 240) {
      errs.duration = "Duration must be between 15 and 240 minutes";
    }

    // 10. Google Meet Link URL Validation (Optional)
    if (form.googleMeetLink && form.googleMeetLink.trim().length > 0) {
      if (!MEET_URL_REGEX.test(form.googleMeetLink.trim())) {
        errs.googleMeetLink = "Must be a valid Google Meet URL (meet.google.com/xxx-xxxx-xxx)";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Form Submit ───────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      setServerError("Validation errors. Please check the required fields.");
      return;
    }

    setSaving(true);
    try {
      const scheduledTime = new Date(
        `${form.interviewDate}T${form.interviewTime}:00`
      ).toISOString();

      const payload = {
        candidateName: form.candidateName.trim(),
        candidateEmail: form.candidateEmail.trim(),
        candidatePhone: form.phone.trim(),
        jobRole: form.jobRole.trim(),
        interviewer: form.interviewer.trim(),
        interviewRound: form.interviewRound.trim(),
        roundTitle: form.interviewRound.trim(),
        scheduledTime,
        interviewDate: form.interviewDate,
        interviewTime: form.interviewTime,
        durationMinutes: Number(form.duration),
        googleMeetLink: form.googleMeetLink.trim() || undefined,
        customMeetingUrl: form.googleMeetLink.trim() || undefined,
        notes: form.notes.trim(),
        specialInstructions: form.notes.trim(),
        recruiterId: Number(localStorage.getItem("userId")) || 1,
        applicationId: candidate?.applicationId || undefined,
        candidateId: candidate?.userId || candidate?.candidateId || undefined,
        opportunityId: candidate?.opportunityId || undefined,
      };

      const savedInterview = await interviewService.scheduleInterview(payload);

      // Successfully saved: Refresh list, trigger parent callback, close dialog
      if (onSchedule) onSchedule(savedInterview || payload);
      onClose();
    } catch (err) {
      console.error("[ScheduleDialog] Save failed:", err);
      const isNet = err?.code === "ERR_NETWORK" || err?.message === "Network Error" || err?.response?.status >= 500;
      setServerError(
        isNet
          ? "Database error."
          : (err?.response?.data?.message || "Interview scheduling failed.")
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Input Dynamic Styles ──────────────────────────────────────────────────

  const inputStyle = (hasError) => ({
    width: "100%",
    padding: "10px 12px",
    fontSize: "13px",
    borderRadius: "8px",
    border: hasError
      ? "1.5px solid #ef4444"
      : "1px solid var(--ats-border, #cbd5e1)",
    background: "var(--ats-card-bg, #ffffff)",
    color: "var(--ats-text-main, #0f172a)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s ease",
  });

  const gridTwo = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" };
  const gridThree = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" };

  return (
    <div
      className="ats-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="ats-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Schedule Interview"
      >
        {/* ── Dialog Header ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
            padding: "20px 24px",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Sparkles size={18} />
              Schedule Interview
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: "12px", opacity: 0.85 }}>
              Fill in candidate and schedule parameters to store the interview.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: "rgba(255,255,255,0.18)",
              border: "none",
              color: "#fff",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* ── Server Error Alert ── */}
        {serverError && (
          <div
            style={{
              background: "#fef2f2",
              borderBottom: "1px solid #fecaca",
              padding: "10px 24px",
              color: "#991b1b",
              fontSize: "13px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0,
            }}
          >
            <AlertCircle size={15} />
            {serverError}
          </div>
        )}

        {/* ── Form Body ── */}
        <form
          id="schedule-interview-form"
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
          noValidate
        >
          {/* Section: Candidate Details */}
          <section>
            <h4
              style={{
                margin: "0 0 12px",
                fontSize: "13px",
                fontWeight: 800,
                color: "#4f46e5",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              <User size={14} />
              Candidate Information
            </h4>

            <div style={gridThree}>
              {/* Candidate Name */}
              <div>
                <FormLabel icon={User} required>
                  Candidate Name
                </FormLabel>
                <input
                  id="candidateName"
                  type="text"
                  value={form.candidateName}
                  onChange={handleChange("candidateName")}
                  placeholder="e.g. John Doe"
                  style={inputStyle(errors.candidateName)}
                  autoComplete="name"
                />
                <FieldError message={errors.candidateName} />
              </div>

              {/* Candidate Email */}
              <div>
                <FormLabel icon={Mail} required>
                  Candidate Email
                </FormLabel>
                <input
                  id="candidateEmail"
                  type="email"
                  value={form.candidateEmail}
                  onChange={handleChange("candidateEmail")}
                  placeholder="candidate@example.com"
                  style={inputStyle(errors.candidateEmail)}
                  autoComplete="email"
                />
                <FieldError message={errors.candidateEmail} />
              </div>

              {/* Phone Number */}
              <div>
                <FormLabel icon={Phone} required>
                  Phone Number
                </FormLabel>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange("phone")}
                  placeholder="+1 (555) 000-0000"
                  style={inputStyle(errors.phone)}
                  autoComplete="tel"
                />
                <FieldError message={errors.phone} />
              </div>
            </div>
          </section>

          {/* Section: Role & Interviewer */}
          <section>
            <h4
              style={{
                margin: "0 0 12px",
                fontSize: "13px",
                fontWeight: 800,
                color: "#4f46e5",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              <Briefcase size={14} />
              Role & Interviewer
            </h4>

            <div style={gridTwo}>
              {/* Job Role */}
              <div>
                <FormLabel icon={Briefcase} required>
                  Job Role
                </FormLabel>
                <input
                  id="jobRole"
                  type="text"
                  value={form.jobRole}
                  onChange={handleChange("jobRole")}
                  placeholder="e.g. Senior Full Stack Engineer"
                  style={inputStyle(errors.jobRole)}
                />
                <FieldError message={errors.jobRole} />
              </div>

              {/* Interviewer */}
              <div>
                <FormLabel icon={UserCheck} required>
                  Interviewer
                </FormLabel>
                <select
                  id="interviewer"
                  value={form.interviewer}
                  onChange={handleChange("interviewer")}
                  style={inputStyle(errors.interviewer)}
                >
                  {INTERVIEWERS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.interviewer} />
              </div>
            </div>
          </section>

          {/* Section: Interview Round & Schedule */}
          <section>
            <h4
              style={{
                margin: "0 0 12px",
                fontSize: "13px",
                fontWeight: 800,
                color: "#4f46e5",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              <Calendar size={14} />
              Schedule Details
            </h4>

            {/* Interview Round */}
            <div style={{ marginBottom: "14px" }}>
              <FormLabel icon={Layers} required>
                Interview Round
              </FormLabel>
              <select
                id="interviewRound"
                value={form.interviewRound}
                onChange={handleChange("interviewRound")}
                style={inputStyle(errors.interviewRound)}
              >
                {INTERVIEW_ROUNDS.map((round) => (
                  <option key={round} value={round}>
                    {round}
                  </option>
                ))}
              </select>
              <FieldError message={errors.interviewRound} />
            </div>

            <div style={gridThree}>
              {/* Interview Date */}
              <div>
                <FormLabel icon={Calendar} required>
                  Interview Date
                </FormLabel>
                <input
                  id="interviewDate"
                  type="date"
                  min={getTodayString()}
                  value={form.interviewDate}
                  onChange={handleChange("interviewDate")}
                  style={inputStyle(errors.interviewDate)}
                />
                <FieldError message={errors.interviewDate} />
              </div>

              {/* Interview Time */}
              <div>
                <FormLabel icon={Clock} required>
                  Interview Time
                </FormLabel>
                <input
                  id="interviewTime"
                  type="time"
                  value={form.interviewTime}
                  onChange={handleChange("interviewTime")}
                  style={inputStyle(errors.interviewTime)}
                />
                <FieldError message={errors.interviewTime} />
              </div>

              {/* Duration */}
              <div>
                <FormLabel icon={Clock} required>
                  Duration
                </FormLabel>
                <select
                  id="duration"
                  value={form.duration}
                  onChange={handleChange("duration")}
                  style={inputStyle(errors.duration)}
                >
                  {DURATION_OPTIONS.map(({ label, value }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.duration} />
              </div>
            </div>
          </section>

          {/* Section: Meeting & Notes */}
          <section>
            <h4
              style={{
                margin: "0 0 12px",
                fontSize: "13px",
                fontWeight: 800,
                color: "#4f46e5",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              <Video size={14} />
              Meeting & Notes
            </h4>

            {/* Google Meet Link */}
            <div style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <FormLabel icon={Video}>
                  Google Meet Link (Manual)
                </FormLabel>
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
                id="googleMeetLink"
                type="url"
                value={form.googleMeetLink}
                onChange={handleChange("googleMeetLink")}
                placeholder="Paste link: https://meet.google.com/abc-defg-hij"
                style={inputStyle(errors.googleMeetLink)}
              />
              <FieldError message={errors.googleMeetLink} />
            </div>

            {/* Notes */}
            <div>
              <FormLabel icon={FileText}>
                Notes / Instructions (Optional)
              </FormLabel>
              <textarea
                id="notes"
                rows={3}
                value={form.notes}
                onChange={handleChange("notes")}
                placeholder="Add candidate instructions, agenda, or evaluation criteria..."
                style={{
                  ...inputStyle(false),
                  resize: "vertical",
                  minHeight: "80px",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </section>
        </form>

        {/* ── Dialog Footer Actions ── */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--ats-border, #e2e8f0)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
            background: "var(--ats-bg, #f8fafc)",
          }}
        >
          {/* Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: "1px solid var(--ats-border, #cbd5e1)",
              color: "var(--ats-text-muted, #64748b)",
              borderRadius: "8px",
              padding: "9px 16px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <RotateCcw size={13} />
            Reset
          </button>

          <div style={{ display: "flex", gap: "10px" }}>
            {/* Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "var(--ats-bg, #f1f5f9)",
                border: "1px solid var(--ats-border, #cbd5e1)",
                color: "var(--ats-text-main, #334155)",
                borderRadius: "8px",
                padding: "9px 20px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            {/* Save Interview Button */}
            <button
              type="submit"
              form="schedule-interview-form"
              disabled={saving}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: saving
                  ? "#94a3b8"
                  : "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                border: "none",
                color: "#ffffff",
                borderRadius: "8px",
                padding: "9px 22px",
                fontSize: "13px",
                fontWeight: 800,
                cursor: saving ? "not-allowed" : "pointer",
                boxShadow: saving ? "none" : "0 4px 12px rgba(79,70,229,0.3)",
                transition: "opacity 0.2s ease",
              }}
            >
              {saving ? (
                <>
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  Save Interview
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ScheduleDialog;
