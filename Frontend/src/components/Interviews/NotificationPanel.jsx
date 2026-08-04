import React, { useState, useMemo } from "react";
import {
  History, User, Clock, Mail, Calendar, Edit3, XCircle, CheckCircle2,
  Search, Download, AlertCircle, RefreshCw, Layers, FileText, Trash2
} from "lucide-react";
import { exportToCSV, exportToPDF } from "../../utils/interviewUtils";

const NotificationPanel = ({ auditLogs = [], interviews = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("All");

  // Dynamically derive audit log events from DB audit logs + live interview records
  const logs = useMemo(() => {
    const list = [];

    // 1. Explicit DB Audit Logs
    if (Array.isArray(auditLogs) && auditLogs.length > 0) {
      auditLogs.forEach((log) => {
        list.push({
          id: `audit-${log.id}`,
          action: log.action || "Audit Event",
          recruiter: log.performedBy || log.performedByName || "Recruiter Admin",
          candidate: log.candidateName || "Candidate",
          timestamp: log.performedOn ? new Date(log.performedOn).toLocaleString() : "Recently",
          status: log.action.includes("Failed") ? "Failed" : log.action.includes("Cancelled") || log.action.includes("Deleted") ? "Cancelled" : "Success",
          details: log.changes || log.details || ""
        });
      });
    }

    // 2. Derive lifecycle events from live interview state
    if (Array.isArray(interviews) && interviews.length > 0) {
      interviews.filter(Boolean).forEach((i) => {
        const round = i.rounds?.[0] || {};
        const candidateName = i.candidateName || i.customCandidateName || "Candidate";
        const recruiterName = i.interviewer || i.recruiterName || "Recruiter Admin";
        const jobTitle = i.jobRole || i.opportunityTitle || "Open Role";

        // 1. Interview Created
        list.push({
          id: `created-${i.id}`,
          action: "Interview Created",
          recruiter: recruiterName,
          candidate: candidateName,
          timestamp: i.createdOn || i.createdAt ? new Date(i.createdOn || i.createdAt).toLocaleString() : "Recently",
          status: "Success",
          details: `Scheduled ${i.interviewRound || round.title || "Round 1"} for ${jobTitle}`
        });

        // 2. Invitation Sent vs Invitation Failed
        const invStatus = i.invitationStatus || (round.isEmailSent ? "Sent" : "Pending");
        if (invStatus === "Sent") {
          list.push({
            id: `email-sent-${i.id}`,
            action: "Invitation Sent",
            recruiter: "EmailService (SMTP)",
            candidate: candidateName,
            timestamp: i.updatedOn || i.updatedAt ? new Date(i.updatedOn || i.updatedAt).toLocaleString() : "Recently",
            status: "Success",
            details: `Delivered HTML invitation via opporateam@gmail.com`
          });
        } else if (invStatus === "Failed") {
          list.push({
            id: `email-failed-${i.id}`,
            action: "Invitation Failed",
            recruiter: "EmailService (SMTP)",
            candidate: candidateName,
            timestamp: i.updatedOn || i.updatedAt ? new Date(i.updatedOn || i.updatedAt).toLocaleString() : "Recently",
            status: "Failed",
            details: `SMTP delivery failed. Preserved interview data for retry.`
          });
        }

        // 3. Status Actions: Completed / Cancelled / Rescheduled / Updated
        const currentStatus = i.overallStatus || i.interviewStatus;
        if (currentStatus === "Completed") {
          list.push({
            id: `completed-${i.id}`,
            action: "Interview Completed",
            recruiter: recruiterName,
            candidate: candidateName,
            timestamp: i.updatedOn || i.updatedAt ? new Date(i.updatedOn || i.updatedAt).toLocaleString() : "Recently",
            status: "Success",
            details: `Candidate evaluation completed for ${jobTitle}`
          });
        } else if (currentStatus === "Cancelled") {
          list.push({
            id: `cancelled-${i.id}`,
            action: "Interview Cancelled",
            recruiter: recruiterName,
            candidate: candidateName,
            timestamp: i.updatedOn || i.updatedAt ? new Date(i.updatedOn || i.updatedAt).toLocaleString() : "Recently",
            status: "Cancelled",
            details: i.notes || i.specialInstructions || "Interview process cancelled"
          });
        } else if (i.updatedOn && i.updatedOn !== i.createdOn) {
          list.push({
            id: `updated-${i.id}`,
            action: "Interview Updated",
            recruiter: recruiterName,
            candidate: candidateName,
            timestamp: new Date(i.updatedOn).toLocaleString(),
            status: "Success",
            details: "Updated Google Meet room and recruiter notes"
          });
        }
      });
    }

    return list;
  }, [auditLogs, interviews]);

  // Search & Filter Logic
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase();
      const recruiterName = log.recruiter || "System";
      const candidateName = log.candidate || "N/A";

      const matchesSearch =
        recruiterName.toLowerCase().includes(q) ||
        candidateName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        (log.details && log.details.toLowerCase().includes(q));

      const matchesAction = actionFilter === "All" || log.action === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [logs, searchQuery, actionFilter]);

  // CSV Export
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    const csvData = filteredLogs.map((l) => ({
      Action: l.action,
      Timestamp: l.timestamp,
      Recruiter: l.recruiter,
      Candidate: l.candidate,
      Status: l.status,
      Details: l.details
    }));
    exportToCSV(csvData, "Audit_Logs_Export.csv");
  };

  // PDF Export
  const handleExportPDF = () => {
    if (filteredLogs.length === 0) return;
    exportToPDF(filteredLogs, "Dynamic Audit Log Report");
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "Interview Created": return <Calendar size={14} color="#4f46e5" />;
      case "Interview Updated": return <Edit3 size={14} color="#3b82f6" />;
      case "Interview Deleted": return <Trash2 size={14} color="#ef4444" />;
      case "Invitation Sent": return <Mail size={14} color="#10b981" />;
      case "Invitation Failed": return <AlertCircle size={14} color="#dc2626" />;
      case "Interview Cancelled": return <XCircle size={14} color="#ef4444" />;
      case "Interview Completed": return <CheckCircle2 size={14} color="#059669" />;
      default: return <History size={14} color="#4f46e5" />;
    }
  };

  return (
    <div className="audit-timeline-panel" style={{
      background: "var(--ats-card-bg, #ffffff)",
      border: "1px solid var(--ats-border, #e2e8f0)",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "var(--ats-shadow, 0 4px 6px -1px rgba(0,0,0,0.05))",
      color: "var(--ats-text-main, #0f172a)"
    }}>
      {/* Header & Export Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ background: "#e0e7ff", padding: "8px", borderRadius: "8px", color: "#4f46e5" }}>
            <History size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>Audit Log</h3>
            <span style={{ fontSize: "11px", color: "var(--ats-text-muted)" }}>Live Event History & Action Tracking</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              background: "#10b981", color: "#ffffff", border: "none",
              borderRadius: "6px", padding: "6px 10px", fontSize: "11px",
              fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"
            }}
          >
            <Download size={13} /> CSV
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            style={{
              background: "#4f46e5", color: "#ffffff", border: "none",
              borderRadius: "6px", padding: "6px 10px", fontSize: "11px",
              fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"
            }}
          >
            <FileText size={13} /> PDF
          </button>
        </div>
      </div>

      {/* Search & Filter Inputs */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
        <div style={{ position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: "10px", top: "9px", color: "var(--ats-text-muted)" }} />
          <input
            type="text"
            placeholder="Search recruiter, candidate, action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%", padding: "7px 10px 7px 30px",
              border: "1px solid var(--ats-border, #cbd5e1)", borderRadius: "8px",
              fontSize: "12px", background: "var(--ats-bg, #f8fafc)", color: "var(--ats-text-main)"
            }}
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          style={{
            width: "100%", padding: "7px 10px",
            border: "1px solid var(--ats-border, #cbd5e1)", borderRadius: "8px",
            fontSize: "12px", background: "var(--ats-bg, #f8fafc)", color: "var(--ats-text-main)"
          }}
        >
          <option value="All">All 7 Lifecycle Actions</option>
          <option value="Interview Created">Interview Created</option>
          <option value="Interview Updated">Interview Updated</option>
          <option value="Interview Deleted">Interview Deleted</option>
          <option value="Invitation Sent">Invitation Sent</option>
          <option value="Invitation Failed">Invitation Failed</option>
          <option value="Interview Completed">Interview Completed</option>
          <option value="Interview Cancelled">Interview Cancelled</option>
        </select>
      </div>

      {/* Event Log Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "550px", overflowY: "auto" }}>
        {filteredLogs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "var(--ats-text-muted)", fontSize: "12px" }}>
            No audit records match the filter.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const recruiterName = log.recruiter || "Recruiter";
            const candidateName = log.candidate || "Candidate";
            const logStatus = log.status || "Success";

            return (
              <div key={log.id} style={{
                background: "var(--ats-bg, #f8fafc)",
                border: "1px solid var(--ats-border, #e2e8f0)",
                borderRadius: "10px",
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                gap: "5px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#4f46e5", display: "flex", alignItems: "center", gap: "5px" }}>
                    {getActionIcon(log.action)} {log.action}
                  </span>
                  <span style={{
                    fontSize: "10px", fontWeight: "800", padding: "2px 6px", borderRadius: "4px",
                    background: logStatus === "Failed" ? "#fee2e2" : logStatus === "Cancelled" ? "#fff1f2" : "#ecfdf5",
                    color: logStatus === "Failed" ? "#dc2626" : logStatus === "Cancelled" ? "#e11d48" : "#059669"
                  }}>
                    {logStatus}
                  </span>
                </div>

                <div style={{ fontSize: "11px", color: "var(--ats-text-main)", fontWeight: "600", display: "flex", justifyContent: "space-between" }}>
                  <span><User size={11} style={{ verticalAlign: "middle" }} /> {recruiterName} → <span style={{ color: "var(--ats-primary)" }}>{candidateName}</span></span>
                  <span style={{ fontSize: "10px", color: "var(--ats-text-muted)" }}>{log.timestamp}</span>
                </div>

                {log.details && (
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--ats-text-muted)", fontStyle: "italic" }}>
                    "{log.details}"
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
