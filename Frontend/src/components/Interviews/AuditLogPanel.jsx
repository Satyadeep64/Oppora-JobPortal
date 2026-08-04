import React, { useState, useEffect, useMemo } from "react";
import {
  History, Search, Download, FileText, ArrowUpDown, AlertCircle, X, ChevronRight
} from "lucide-react";
import { exportToCSV, exportToPDF } from "../../utils/interviewUtils";

/**
 * Helper component to highlight matching search text case-insensitively
 */
const HighlightText = ({ text = "", highlight = "" }) => {
  if (!highlight || !text) return text;
  const strText = String(text);
  const cleanHighlight = highlight.trim();
  if (!cleanHighlight) return strText;

  try {
    const escaped = cleanHighlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const parts = strText.split(regex);

    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === cleanHighlight.toLowerCase() ? (
            <mark
              key={index}
              style={{
                backgroundColor: "#fef08a",
                color: "#854d0e",
                padding: "1px 3px",
                borderRadius: "3px",
                fontWeight: "800"
              }}
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  } catch (e) {
    return strText;
  }
};

const AuditLogPanel = ({ auditLogs = [], interviews = [] }) => {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortField, setSortField] = useState("rawDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  // Track window width to detect mobile/tablet dynamically
  useEffect(() => {
    const handleResize = () => {
      setIsMobileOrTablet(window.innerWidth <= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1. Debounce Search Input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchInput);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // 2. Dynamically compile & unify audit events from DB audit logs + live interview state
  const logs = useMemo(() => {
    const list = [];
    const processedAuditIds = new Set();

    // Process explicit DB Audit Logs if available
    if (Array.isArray(auditLogs) && auditLogs.length > 0) {
      auditLogs.forEach((log) => {
        if (!log) return;
        processedAuditIds.add(log.id);

        const rawD = new Date(log.performedOn || log.timestamp || Date.now());
        const dateStr = !isNaN(rawD.getTime()) ? rawD.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A";
        const timeStr = !isNaN(rawD.getTime()) ? rawD.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "N/A";

        let actionName = log.action || "Interview Scheduled";
        if (actionName === "Interview Created") actionName = "Interview Scheduled";
        if (actionName === "Interview Cancelled") actionName = "Interview Deleted";

        const rec = log.performedByName || log.performedBy || "Recruiter Admin";
        const cand = log.candidateName || log.CandidateName || "Candidate";
        const role = log.jobRole || log.JobRole || log.opportunityTitle || "Role";
        const interviewer = log.interviewer || log.Interviewer || rec;

        list.push({
          id: `db-audit-${log.id}`,
          recruiter: rec,
          candidate: cand,
          jobRole: role,
          interviewer: interviewer,
          action: actionName,
          oldValue: log.oldValue || log.OldValue || "N/A",
          newValue: log.newValue || log.NewValue || log.changes || log.details || "Initial Creation",
          date: dateStr,
          time: timeStr,
          status: actionName.includes("Failed") ? "Failed" : (actionName.includes("Deleted") ? "Cancelled" : "Success"),
          rawDate: rawD
        });
      });
    }

    // Derive lifecycle audit entries from active interview records
    if (Array.isArray(interviews) && interviews.length > 0) {
      interviews.filter(Boolean).forEach((inv) => {
        const candName = inv.candidateName || inv.customCandidateName || "Candidate";
        const recruiterName = inv.recruiterName || inv.interviewer || "Recruiter Admin";
        const jobRole = inv.jobRole || inv.opportunityTitle || "Role";
        const interviewer = inv.interviewer || recruiterName;

        const createdD = new Date(inv.createdOn || inv.createdAt || Date.now());
        const createdDateStr = !isNaN(createdD.getTime()) ? createdD.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A";
        const createdTimeStr = !isNaN(createdD.getTime()) ? createdD.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "N/A";

        const updatedD = new Date(inv.updatedOn || inv.updatedAt || Date.now());
        const updatedDateStr = !isNaN(updatedD.getTime()) ? updatedD.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A";
        const updatedTimeStr = !isNaN(updatedD.getTime()) ? updatedD.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "N/A";

        const hasDbAudit = Array.isArray(inv.audits) && inv.audits.length > 0;

        if (hasDbAudit) {
          inv.audits.forEach((aud) => {
            if (aud && !processedAuditIds.has(aud.id)) {
              processedAuditIds.add(aud.id);
              const audD = new Date(aud.performedOn || aud.timestamp || Date.now());
              let act = aud.action || "Interview Scheduled";
              if (act === "Interview Created") act = "Interview Scheduled";
              if (act === "Interview Cancelled") act = "Interview Deleted";

              list.push({
                id: `inv-audit-${aud.id}`,
                recruiter: aud.performedByName || aud.performedBy || recruiterName,
                candidate: candName,
                jobRole: jobRole,
                interviewer: interviewer,
                action: act,
                oldValue: aud.oldValue || "N/A",
                newValue: aud.newValue || aud.changes || aud.details || "N/A",
                date: !isNaN(audD.getTime()) ? audD.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A",
                time: !isNaN(audD.getTime()) ? audD.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "N/A",
                status: act.includes("Failed") ? "Failed" : (act.includes("Deleted") ? "Cancelled" : "Success"),
                rawDate: audD
              });
            }
          });
        } else {
          // Interview Scheduled
          list.push({
            id: `scheduled-${inv.id}`,
            recruiter: recruiterName,
            candidate: candName,
            jobRole: jobRole,
            interviewer: interviewer,
            action: "Interview Scheduled",
            oldValue: "None (New Schedule)",
            newValue: `Slot: ${inv.interviewDate ? new Date(inv.interviewDate).toLocaleDateString() : ""} ${inv.interviewTime || ""} | Role: ${jobRole} | Meet: ${inv.googleMeetLink || "Pending"}`,
            date: createdDateStr,
            time: createdTimeStr,
            status: "Success",
            rawDate: createdD
          });

          // Email Sent / Email Failed
          const emailStat = inv.invitationStatus || (inv.rounds?.[0]?.isEmailSent ? "Sent" : "Pending");
          if (emailStat === "Sent") {
            list.push({
              id: `email-sent-${inv.id}`,
              recruiter: "EmailService (SMTP)",
              candidate: candName,
              jobRole: jobRole,
              interviewer: interviewer,
              action: "Email Sent",
              oldValue: "Invitation Pending",
              newValue: `Dispatched HTML invitation email to candidate`,
              date: updatedDateStr,
              time: updatedTimeStr,
              status: "Success",
              rawDate: updatedD
            });
          } else if (emailStat === "Failed") {
            list.push({
              id: `email-failed-${inv.id}`,
              recruiter: "EmailService (SMTP)",
              candidate: candName,
              jobRole: jobRole,
              interviewer: interviewer,
              action: "Email Failed",
              oldValue: "Invitation Pending",
              newValue: `SMTP transmission failed. Error saved. Retry available.`,
              date: updatedDateStr,
              time: updatedTimeStr,
              status: "Failed",
              rawDate: updatedD
            });
          }

          // Rescheduled or Deleted
          const currentStatus = inv.overallStatus || inv.interviewStatus;
          if (currentStatus === "Rescheduled") {
            list.push({
              id: `rescheduled-${inv.id}`,
              recruiter: recruiterName,
              candidate: candName,
              jobRole: jobRole,
              interviewer: interviewer,
              action: "Interview Rescheduled",
              oldValue: "Initial schedule",
              newValue: `Slot: ${inv.interviewDate ? new Date(inv.interviewDate).toLocaleDateString() : ""} ${inv.interviewTime || ""} | Link: ${inv.googleMeetLink || "Updated"}`,
              date: updatedDateStr,
              time: updatedTimeStr,
              status: "Rescheduled",
              rawDate: updatedD
            });
          } else if (currentStatus === "Cancelled") {
            list.push({
              id: `deleted-${inv.id}`,
              recruiter: recruiterName,
              candidate: candName,
              jobRole: jobRole,
              interviewer: interviewer,
              action: "Interview Deleted",
              oldValue: "Active Schedule",
              newValue: "Status changed to Cancelled/Deleted",
              date: updatedDateStr,
              time: updatedTimeStr,
              status: "Cancelled",
              rawDate: updatedD
            });
          } else if (inv.updatedOn && inv.updatedOn !== inv.createdOn) {
            list.push({
              id: `updated-${inv.id}`,
              recruiter: recruiterName,
              candidate: candName,
              jobRole: jobRole,
              interviewer: interviewer,
              action: "Interview Updated",
              oldValue: "Previous details",
              newValue: "Updated meeting details & recruiter notes",
              date: updatedDateStr,
              time: updatedTimeStr,
              status: "Updated",
              rawDate: updatedD
            });
          }
        }
      });
    }

    return list;
  }, [auditLogs, interviews]);

  // 3. Fast Real-Time Filtering
  const processedLogs = useMemo(() => {
    const q = debouncedSearchQuery.toLowerCase().trim();

    let result = logs.filter((log) => {
      if (!q) return true;
      return (
        (log.candidate || "").toLowerCase().includes(q) ||
        (log.recruiter || "").toLowerCase().includes(q) ||
        (log.jobRole || "").toLowerCase().includes(q) ||
        (log.interviewer || "").toLowerCase().includes(q) ||
        (log.action || "").toLowerCase().includes(q) ||
        (log.status || "").toLowerCase().includes(q) ||
        (log.oldValue || "").toLowerCase().includes(q) ||
        (log.newValue || "").toLowerCase().includes(q)
      );
    });

    result.sort((a, b) => {
      let valA, valB;
      if (sortField === "action") {
        valA = (a.action || "").toLowerCase();
        valB = (b.action || "").toLowerCase();
      } else if (sortField === "recruiter") {
        valA = (a.recruiter || "").toLowerCase();
        valB = (b.recruiter || "").toLowerCase();
      } else if (sortField === "candidate") {
        valA = (a.candidate || "").toLowerCase();
        valB = (b.candidate || "").toLowerCase();
      } else if (sortField === "status") {
        valA = (a.status || "").toLowerCase();
        valB = (b.status || "").toLowerCase();
      } else {
        valA = a.rawDate ? a.rawDate.getTime() : 0;
        valB = b.rawDate ? b.rawDate.getTime() : 0;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [logs, debouncedSearchQuery, sortField, sortOrder]);

  const handleSortClick = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleExportCSV = () => {
    if (processedLogs.length === 0) return;
    const csvData = processedLogs.map((l) => ({
      Recruiter: l.recruiter,
      Candidate: l.candidate,
      Action: l.action,
      "Old Value": l.oldValue,
      "New Value": l.newValue,
      Date: l.date,
      Time: l.time,
      Status: l.status
    }));
    exportToCSV(csvData, "Audit_Log_Report.csv");
  };

  const handleExportPDF = () => {
    if (processedLogs.length === 0) return;
    exportToPDF(processedLogs, "Audit Log Activity Report");
  };

  const getActionBadgeStyle = (action, status) => {
    if (status === "Failed" || action === "Email Failed") {
      return { bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" };
    }
    if (status === "Cancelled" || action === "Interview Deleted") {
      return { bg: "#fff1f2", color: "#e11d48", border: "#fda4af" };
    }
    if (action === "Interview Rescheduled" || status === "Rescheduled") {
      return { bg: "#fffbe6", color: "#d97706", border: "#fde68a" };
    }
    if (action === "Interview Updated" || status === "Updated") {
      return { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" };
    }
    if (action === "Email Sent") {
      return { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" };
    }
    return { bg: "#f5f3ff", color: "#4f46e5", border: "#c7d2fe" };
  };

  // Content render helper (reused across Desktop panel, Tablet drawer, and Mobile slide-in)
  const renderAuditLogInnerContent = (onCloseDrawer = null) => (
    <div className="audit-log-panel" style={{
      background: "var(--ats-card-bg, #ffffff)",
      border: "1px solid var(--ats-border, #e2e8f0)",
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "var(--ats-shadow, 0 4px 6px -1px rgba(0,0,0,0.05))",
      color: "var(--ats-text-main, #0f172a)",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      boxSizing: "border-box",
      width: "100%",
      maxHeight: "100%",
      overflowX: "hidden"
    }}>
      {/* Header & Export Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ background: "linear-gradient(135deg, #4f46e5, #3730a3)", padding: "10px", borderRadius: "12px", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <History size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800" }}>Audit Log</h3>
            <span style={{ fontSize: "11.5px", color: "var(--ats-text-muted)" }}>
              {logs.length} activity records tracked
            </span>
          </div>
        </div>

        {/* Action Controls & Close Drawer Button */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleExportCSV}
            title="Export CSV"
            style={{
              background: "#10b981", color: "#ffffff", border: "none",
              borderRadius: "8px", padding: "8px 12px", fontSize: "12px",
              fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px", minHeight: "36px"
            }}
          >
            <Download size={14} /> <span className="export-btn-label">CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            title="Export PDF"
            style={{
              background: "#4f46e5", color: "#ffffff", border: "none",
              borderRadius: "8px", padding: "8px 12px", fontSize: "12px",
              fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px", minHeight: "36px"
            }}
          >
            <FileText size={14} /> <span className="export-btn-label">PDF</span>
          </button>

          {onCloseDrawer && (
            <button
              type="button"
              onClick={onCloseDrawer}
              style={{
                background: "var(--ats-bg, #f1f5f9)", color: "var(--ats-text-main, #0f172a)",
                border: "1px solid var(--ats-border, #cbd5e1)", borderRadius: "8px",
                padding: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Responsive 100% Width Search Input Bar */}
      <div style={{ width: "100%", boxSizing: "border-box" }}>
        <div style={{ position: "relative", width: "100%", boxSizing: "border-box" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "11px", color: "var(--ats-text-muted)" }} />
          <input
            type="text"
            placeholder="Search candidate, recruiter, role, interviewer, action, status..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              width: "100%", padding: "9px 12px 9px 34px",
              border: "1px solid var(--ats-border, #cbd5e1)", borderRadius: "10px",
              fontSize: "13px", background: "var(--ats-bg, #f8fafc)",
              color: "var(--ats-text-main)", outline: "none", boxSizing: "border-box"
            }}
          />
        </div>
      </div>

      {/* Desktop / Large Screen Table View with Sticky Aligned Header & Min-Width Protection */}
      <div className="audit-desktop-table" style={{
        width: "100%",
        overflowY: "auto",
        overflowX: "auto",
        maxHeight: "calc(100vh - 260px)",
        borderRadius: "10px",
        border: "1px solid var(--ats-border, #e2e8f0)",
        boxSizing: "border-box"
      }}>
        <table style={{
          width: "100%",
          minWidth: "850px",
          borderCollapse: "collapse",
          textAlign: "left",
          fontSize: "12.5px",
          boxSizing: "border-box"
        }}>
          <thead>
            <tr style={{
              background: "var(--ats-bg, #f8fafc)",
              borderBottom: "2px solid var(--ats-border, #cbd5e1)",
              color: "var(--ats-text-muted, #64748b)",
              fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px",
              userSelect: "none",
              position: "sticky",
              top: 0,
              zIndex: 5,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
            }}>
              <th onClick={() => handleSortClick("recruiter")} style={{ padding: "11px 12px", cursor: "pointer", background: "var(--ats-bg, #f8fafc)", minWidth: "120px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  Recruiter <ArrowUpDown size={12} />
                </div>
              </th>
              <th onClick={() => handleSortClick("candidate")} style={{ padding: "11px 12px", cursor: "pointer", background: "var(--ats-bg, #f8fafc)", minWidth: "120px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  Candidate <ArrowUpDown size={12} />
                </div>
              </th>
              <th onClick={() => handleSortClick("action")} style={{ padding: "11px 12px", cursor: "pointer", background: "var(--ats-bg, #f8fafc)", minWidth: "135px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  Action <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ padding: "11px 12px", background: "var(--ats-bg, #f8fafc)", minWidth: "135px" }}>Old Value</th>
              <th style={{ padding: "11px 12px", background: "var(--ats-bg, #f8fafc)", minWidth: "150px" }}>New Value</th>
              <th onClick={() => handleSortClick("rawDate")} style={{ padding: "11px 12px", cursor: "pointer", background: "var(--ats-bg, #f8fafc)", minWidth: "95px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  Date <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ padding: "11px 12px", background: "var(--ats-bg, #f8fafc)", minWidth: "75px" }}>Time</th>
              <th onClick={() => handleSortClick("status")} style={{ padding: "11px 12px", cursor: "pointer", background: "var(--ats-bg, #f8fafc)", minWidth: "85px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  Status <ArrowUpDown size={12} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {processedLogs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "40px 16px", color: "var(--ats-text-muted, #64748b)" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <AlertCircle size={28} style={{ color: "#94a3b8" }} />
                    <span style={{ fontWeight: "700", fontSize: "14px", color: "#475569" }}>No records found</span>
                    <span style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center", maxWidth: "300px" }}>
                      {debouncedSearchQuery ? `No audit entries match "${debouncedSearchQuery}"` : "No audit records available."}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              processedLogs.map((log) => {
                const badgeStyle = getActionBadgeStyle(log.action, log.status);

                return (
                  <tr key={log.id} style={{ borderBottom: "1px solid var(--ats-border, #e2e8f0)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: "700", color: "var(--ats-text-main)", minWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.recruiter}>
                      <HighlightText text={log.recruiter} highlight={debouncedSearchQuery} />
                    </td>
                    <td style={{ padding: "10px 12px", fontWeight: "700", color: "var(--ats-primary, #4f46e5)", minWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.candidate}>
                      <HighlightText text={log.candidate} highlight={debouncedSearchQuery} />
                    </td>
                    <td style={{ padding: "10px 12px", minWidth: "135px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.action}>
                      <span style={{
                        background: badgeStyle.bg, color: badgeStyle.color,
                        border: `1px solid ${badgeStyle.border}`,
                        padding: "3px 8px", borderRadius: "6px",
                        fontSize: "11px", fontWeight: "800", display: "inline-flex", alignItems: "center"
                      }}>
                        <HighlightText text={log.action} highlight={debouncedSearchQuery} />
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--ats-text-muted)", fontSize: "11.5px", minWidth: "135px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.oldValue}>
                      <HighlightText text={log.oldValue} highlight={debouncedSearchQuery} />
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--ats-text-main)", fontSize: "11.5px", fontWeight: "600", minWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.newValue}>
                      <HighlightText text={log.newValue} highlight={debouncedSearchQuery} />
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--ats-text-muted)", fontSize: "11.5px", fontWeight: "600", minWidth: "95px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.date}>
                      {log.date}
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--ats-text-muted)", fontSize: "11.5px", fontWeight: "600", minWidth: "75px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.time}>
                      {log.time}
                    </td>
                    <td style={{ padding: "10px 12px", minWidth: "85px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.status}>
                      <span style={{
                        color: log.status === "Failed" ? "#ef4444" : log.status === "Cancelled" ? "#f59e0b" : "#10b981",
                        fontWeight: "800", fontSize: "11.5px"
                      }}>
                        <HighlightText text={log.status} highlight={debouncedSearchQuery} />
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile / Tablet Card View (No Horizontal Scroll) */}
      <div className="audit-mobile-list" style={{ width: "100%", overflowX: "hidden", boxSizing: "border-box" }}>
        {processedLogs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "36px 16px", color: "var(--ats-text-muted, #64748b)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <AlertCircle size={28} style={{ color: "#94a3b8", marginBottom: "8px" }} />
            <div style={{ fontWeight: "700", fontSize: "14px", color: "#475569" }}>No records found</div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px", maxWidth: "280px" }}>
              {debouncedSearchQuery ? `No entries match "${debouncedSearchQuery}"` : "No audit records available."}
            </div>
          </div>
        ) : (
          processedLogs.map((log) => {
            const badgeStyle = getActionBadgeStyle(log.action, log.status);

            return (
              <div key={log.id} style={{
                background: "var(--ats-bg, #f8fafc)",
                border: "1px solid var(--ats-border, #e2e8f0)",
                borderRadius: "12px",
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                boxSizing: "border-box",
                width: "100%",
                overflowX: "hidden"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px", width: "100%" }}>
                  <span style={{
                    background: badgeStyle.bg, color: badgeStyle.color,
                    border: `1px solid ${badgeStyle.border}`,
                    padding: "3px 8px", borderRadius: "6px",
                    fontSize: "11px", fontWeight: "800"
                  }}>
                    <HighlightText text={log.action} highlight={debouncedSearchQuery} />
                  </span>
                  <span style={{
                    color: log.status === "Failed" ? "#ef4444" : log.status === "Cancelled" ? "#f59e0b" : "#10b981",
                    fontWeight: "800", fontSize: "11.5px"
                  }}>
                    <HighlightText text={log.status} highlight={debouncedSearchQuery} />
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", flexWrap: "wrap", gap: "4px", width: "100%" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                    <span style={{ color: "var(--ats-text-muted)", fontSize: "11px" }}>Candidate: </span>
                    <strong style={{ color: "var(--ats-primary, #4f46e5)" }}>
                      <HighlightText text={log.candidate} highlight={debouncedSearchQuery} />
                    </strong>
                  </span>
                  <span style={{ color: "var(--ats-text-muted)", fontSize: "11px", fontWeight: "600" }}>
                    {log.date} {log.time}
                  </span>
                </div>

                <div style={{ fontSize: "11.5px", color: "var(--ats-text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <span style={{ color: "var(--ats-text-muted)" }}>Recruiter: </span>
                  <strong><HighlightText text={log.recruiter} highlight={debouncedSearchQuery} /></strong>
                </div>

                {log.newValue && (
                  <div style={{
                    fontSize: "11.5px", color: "var(--ats-text-main)",
                    background: "var(--ats-card-bg, #ffffff)",
                    padding: "6px 10px", borderRadius: "8px",
                    border: "1px solid var(--ats-border, #e2e8f0)",
                    wordBreak: "break-word",
                    width: "100%",
                    boxSizing: "border-box"
                  }}>
                    <span style={{ color: "var(--ats-text-muted)", fontSize: "10.5px", fontWeight: "700", textTransform: "uppercase" }}>Details: </span>
                    <HighlightText text={log.newValue} highlight={debouncedSearchQuery} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return renderAuditLogInnerContent();
};

export default AuditLogPanel;
