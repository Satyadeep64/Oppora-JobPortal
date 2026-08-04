import React, { useState } from "react";
import { Mail, CheckCircle2, AlertCircle, RefreshCw, Eye, X, Send, Clock, User, Building, Calendar, Video, FileText } from "lucide-react";

const EmailStatus = ({ interview, isSent = true, sentAt, onResend, status = "Sent" }) => {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [resending, setResending] = useState(false);

  const candidateName = interview?.candidateName || "Candidate Name";
  const companyName = interview?.companyName || "Oppora Hub";
  const jobTitle = interview?.opportunityTitle || "Open Role";
  const roundTitle = interview?.rounds?.[0]?.title || "Technical Round 1";
  const meetUrl = interview?.rounds?.[0]?.meetingDetails?.meetingUrl || "https://meet.google.com/abc-defg-hij";
  const recruiterName = interview?.recruiterName || "Sarah HR Recruiter";
  const instructions = interview?.specialInstructions || "Please join 5 minutes early and ensure a stable internet connection.";
  const scheduledTime = interview?.rounds?.[0]?.scheduledTime || new Date().toISOString();
  const durationMinutes = interview?.rounds?.[0]?.durationMinutes || 45;

  const handleResendClick = async () => {
    setResending(true);
    try {
      if (onResend) await onResend();
    } finally {
      setTimeout(() => setResending(false), 1000);
    }
  };

  const statusConfig = {
    Sent: { bg: "#ecfdf5", border: "#a7f3d0", color: "#047857", icon: <CheckCircle2 size={15} color="#059669" /> },
    Pending: { bg: "#fef3c7", border: "#fde68a", color: "#b45309", icon: <Clock size={15} color="#d97706" /> },
    Failed: { bg: "#fef2f2", border: "#fecaca", color: "#b91c1c", icon: <AlertCircle size={15} color="#dc2626" /> }
  };

  const currentConfig = statusConfig[status] || statusConfig.Sent;

  return (
    <div className="email-status-container" style={{
      background: "var(--ats-card-bg)",
      border: "1px solid var(--ats-border)",
      borderRadius: "12px",
      padding: "14px 18px",
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    }}>
      {/* Header Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ background: "#e0e7ff", padding: "8px", borderRadius: "8px", color: "#4f46e5" }}>
            <Mail size={18} />
          </div>
          <div>
            <h5 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "var(--ats-text-main)" }}>Interview Invitation Email</h5>
            <span style={{ fontSize: "11px", color: "var(--ats-text-muted)" }}>
              {sentAt ? `Dispatched at ${new Date(sentAt).toLocaleTimeString()}` : "Queue Status: Active"}
            </span>
          </div>
        </div>

        {/* Status Badge & Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            background: currentConfig.bg,
            border: `1px solid ${currentConfig.border}`,
            color: currentConfig.color,
            padding: "4px 10px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px"
          }}>
            {currentConfig.icon} {status}
          </span>

          <button
            onClick={() => setShowPreviewModal(true)}
            title="Preview Invitation HTML Email"
            style={{
              background: "var(--ats-bg)",
              border: "1px solid var(--ats-border)",
              color: "var(--ats-text-main)",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <Eye size={14} /> Preview
          </button>

          <button
            onClick={handleResendClick}
            disabled={resending}
            style={{
              background: status === "Failed" ? "#dc2626" : "#4f46e5",
              color: "#ffffff",
              border: "none",
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px"
            }}
          >
            <RefreshCw size={13} className={resending ? "spin-icon" : ""} />
            {resending ? "Dispatching..." : status === "Failed" ? "Retry Email" : "Resend Email"}
          </button>
        </div>
      </div>

      {/* Email Preview Modal Popup */}
      {showPreviewModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(5px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1100, padding: "20px"
        }}>
          <div style={{
            background: "#ffffff", borderRadius: "16px", width: "100%", maxWidth: "600px",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden"
          }}>
            <div style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
              padding: "18px 24px", color: "#ffffff", display: "flex",
              justify: "space-between", alignItems: "center"
            }}>
              <div>
                <h4 style={{ margin: 0, fontSize: "17px", fontWeight: "800" }}>HTML Email Invitation Preview</h4>
                <p style={{ margin: "2px 0 0 0", fontSize: "12px", opacity: 0.9 }}>Recipient: {candidateName}</p>
              </div>
              <button onClick={() => setShowPreviewModal(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={20} /></button>
            </div>

            {/* Email Body HTML Preview Card */}
            <div style={{ padding: "24px", color: "#1e293b", fontFamily: "Segoe UI, sans-serif" }}>
              <div style={{ background: "#f8fafc", borderLeft: "4px solid #4f46e5", padding: "16px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
                <div style={{ marginBottom: "6px" }}><strong>Candidate Name:</strong> {candidateName}</div>
                <div style={{ marginBottom: "6px" }}><strong>Company:</strong> {companyName}</div>
                <div style={{ marginBottom: "6px" }}><strong>Job Role:</strong> {jobTitle}</div>
                <div style={{ marginBottom: "6px" }}><strong>Interview Round:</strong> {roundTitle}</div>
                <div style={{ marginBottom: "6px" }}><strong>Date & Time:</strong> {new Date(scheduledTime).toLocaleString()} ({durationMinutes} Mins)</div>
                <div style={{ marginBottom: "6px" }}><strong>Recruiter Name:</strong> {recruiterName}</div>
                <div><strong>Google Meet Link:</strong> <a href={meetUrl} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>{meetUrl}</a></div>
              </div>

              <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                <a href={meetUrl} target="_blank" rel="noreferrer" style={{ background: "#10b981", color: "#fff", padding: "10px 20px", borderRadius: "6px", textDecoration: "none", fontWeight: "700", fontSize: "14px", display: "inline-block" }}>
                  Join Google Meet Conference
                </a>
              </div>
            </div>

            <div style={{ background: "#f1f5f9", padding: "14px 24px", textAlign: "right" }}>
              <button onClick={() => setShowPreviewModal(false)} style={{ padding: "8px 18px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>Close Preview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailStatus;
