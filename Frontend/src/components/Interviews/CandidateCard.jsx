import React from "react";
import { User, Calendar, Briefcase, Mail } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatInterviewDate } from "../../utils/interviewUtils";

const CandidateCard = ({ candidate, onSchedule }) => {
  if (!candidate) return null;

  return (
    <div className="candidate-card" style={{
      border: "1px solid var(--ats-border, #e2e8f0)",
      borderRadius: "var(--ats-radius, 12px)",
      padding: "16px 20px",
      background: "var(--ats-card-bg, #ffffff)",
      color: "var(--ats-text-main, #0f172a)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",
      flexWrap: "wrap",
      boxShadow: "var(--ats-shadow)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: "240px", flex: 1 }}>
        <div style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "800",
          fontSize: "18px",
          flexShrink: 0
        }}>
          {candidate.fullName?.charAt(0) || "C"}
        </div>

        <div>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "700", color: "var(--ats-text-main)" }}>
            {candidate.fullName}
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "12.5px", color: "var(--ats-text-muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Mail size={13} /> {candidate.email}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Briefcase size={13} /> {candidate.opportunityTitle} ({candidate.companyName || "Oppora"})
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
        <div style={{ textAlign: "right" }}>
          <StatusBadge status={candidate.status} />
          <div style={{ fontSize: "11.5px", color: "var(--ats-text-muted)", marginTop: "4px" }}>
            Applied {formatInterviewDate(candidate.appliedAt)}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSchedule(candidate)}
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            padding: "9px 18px",
            fontWeight: "700",
            fontSize: "13px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)"
          }}
        >
          <Calendar size={14} /> Schedule Interview
        </button>
      </div>
    </div>
  );
};

export default CandidateCard;
