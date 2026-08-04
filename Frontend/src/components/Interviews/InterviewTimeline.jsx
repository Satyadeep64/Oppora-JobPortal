import React from "react";
import { CheckCircle2, Clock, Circle } from "lucide-react";

const InterviewTimeline = ({ rounds = [], overallStatus = "Scheduled" }) => {
  const steps = [
    { title: "Application Reviewed", status: "Completed" },
    { title: "Shortlisted", status: "Completed" },
    { title: rounds[0]?.title || "Technical Round 1", status: overallStatus === "Completed" ? "Completed" : "Active" },
    { title: "Final Evaluation", status: overallStatus === "Selected" ? "Completed" : "Pending" },
    { title: "Offer / Selection", status: overallStatus === "Selected" ? "Completed" : "Pending" }
  ];

  return (
    <div className="interview-timeline" style={{ padding: "16px 0" }}>
      <h4 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: "600", color: "#475569" }}>
        Interview Pipeline Progress
      </h4>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        {steps.map((step, index) => {
          const isCompleted = step.status === "Completed";
          const isActive = step.status === "Active";

          return (
            <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative", zIndex: 1 }}>
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: isCompleted ? "#10b981" : isActive ? "#4f46e5" : "#e2e8f0",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
                fontSize: "12px",
                boxShadow: isActive ? "0 0 0 4px rgba(79, 70, 229, 0.2)" : "none"
              }}>
                {isCompleted ? <CheckCircle2 size={16} /> : isActive ? <Clock size={16} /> : <Circle size={14} />}
              </div>
              <span style={{ fontSize: "12px", marginTop: "8px", fontWeight: isActive ? "700" : "500", color: isActive ? "#3730a3" : "#64748b", textAlign: "center" }}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InterviewTimeline;
