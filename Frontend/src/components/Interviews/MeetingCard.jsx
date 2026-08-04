import React, { useState } from "react";
import { Video, Copy, ExternalLink, Check, Clock, Globe, QrCode, X, Calendar, RefreshCw, XCircle } from "lucide-react";
import { extractGoogleMeetId, copyToClipboard, formatInterviewDate, formatInterviewTime } from "../../utils/interviewUtils";

const MeetingCard = ({ meetingDetails, onReschedule, onCancel }) => {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const url = meetingDetails?.meetingUrl || "https://meet.google.com/abc-defg-hij";
  const meetingId = meetingDetails?.meetingId || extractGoogleMeetId(url);
  const eventId = meetingDetails?.externalCalendarEventId || "cal-evt-897123";
  const duration = meetingDetails?.durationMinutes || 45;
  const timeZone = meetingDetails?.timeZone || "UTC";

  const startTimeStr = meetingDetails?.scheduledStartTime ? `${formatInterviewDate(meetingDetails.scheduledStartTime)} ${formatInterviewTime(meetingDetails.scheduledStartTime)}` : "Today at 10:00 AM";
  const endTimeStr = meetingDetails?.scheduledEndTime ? formatInterviewTime(meetingDetails.scheduledEndTime) : "10:45 AM";

  const handleCopy = async () => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`;

  return (
    <div className="meeting-card" style={{
      border: "1px solid var(--ats-border)",
      borderRadius: "14px",
      padding: "20px",
      background: "var(--ats-card-bg)",
      boxShadow: "var(--ats-shadow)"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            padding: "12px",
            borderRadius: "12px",
            color: "#059669"
          }}>
            <Video size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "var(--ats-text-main)" }}>Google Meet Conference</h4>
            <div style={{ fontSize: "12px", color: "var(--ats-text-muted)", fontWeight: "600", marginTop: "2px" }}>
              Meeting ID: <span style={{ color: "var(--ats-primary)", fontWeight: "700" }}>{meetingId}</span> • Event ID: <span style={{ fontFamily: "monospace" }}>{eventId}</span>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons: Join & QR Code */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowQrModal(true)}
            title="Generate QR Code"
            style={{
              background: "var(--ats-bg)",
              border: "1px solid var(--ats-border)",
              color: "var(--ats-text-main)",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px"
            }}
          >
            <QrCode size={14} /> Mobile QR
          </button>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#10b981",
              color: "#ffffff",
              padding: "8px 16px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: "700",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.2)"
            }}
          >
            <Video size={15} /> Join Meeting
          </a>
        </div>
      </div>

      {/* Meeting Link Bar */}
      <div style={{
        background: "var(--ats-bg)",
        border: "1px solid var(--ats-border)",
        padding: "10px 14px",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justify: "space-between",
        fontSize: "13px",
        marginBottom: "16px"
      }}>
        <span style={{ color: "var(--ats-text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "300px", fontWeight: "600" }}>
          {url}
        </span>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={handleCopy}
            style={{
              background: "none",
              border: "none",
              color: copied ? "#16a34a" : "#4f46e5",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontWeight: "700",
              fontSize: "12px"
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied Link" : "Copy Link"}
          </button>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--ats-text-muted)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "3px",
              fontSize: "12px",
              fontWeight: "600"
            }}
          >
            Open Room <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Schedule Info Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "12px",
        marginBottom: "16px",
        background: "var(--ats-bg)",
        border: "1px solid var(--ats-border)",
        padding: "12px",
        borderRadius: "10px"
      }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--ats-text-muted)", textTransform: "uppercase" }}>Start - End Time</span>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--ats-text-main)", display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
            <Clock size={14} color="#4f46e5" /> {startTimeStr} - {endTimeStr}
          </div>
        </div>

        <div>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--ats-text-muted)", textTransform: "uppercase" }}>Duration & TimeZone</span>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--ats-text-main)", display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
            <Globe size={14} color="#3b82f6" /> {duration} Mins ({timeZone})
          </div>
        </div>
      </div>

      {/* Secondary Management Actions: Reschedule & Cancel */}
      {(onReschedule || onCancel) && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--ats-border)", paddingTop: "14px" }}>
          {onReschedule && (
            <button
              onClick={onReschedule}
              style={{
                background: "#f59e0b",
                color: "#ffffff",
                border: "none",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <RefreshCw size={13} /> Reschedule Meeting
            </button>
          )}

          {onCancel && (
            <button
              onClick={onCancel}
              style={{
                background: "#ef4444",
                color: "#ffffff",
                border: "none",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <XCircle size={13} /> Cancel Meeting
            </button>
          )}
        </div>
      )}

      {/* QR Code Modal Popup */}
      {showQrModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1100, padding: "20px"
        }}>
          <div style={{
            background: "#ffffff", borderRadius: "18px", padding: "24px",
            width: "100%", maxWidth: "340px", textAlign: "center",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>Scan Google Meet QR</h4>
              <button onClick={() => setShowQrModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "inline-block", marginBottom: "14px" }}>
              <img src={qrCodeApiUrl} alt="Google Meet QR Code" style={{ width: "180px", height: "180px", display: "block" }} />
            </div>

            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Scan with mobile camera to join the Google Meet conference.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingCard;
