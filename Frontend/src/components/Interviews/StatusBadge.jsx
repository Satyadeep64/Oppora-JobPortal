import React from "react";
import { STATUS_COLORS } from "../../constants/interviewConstants";

const StatusBadge = ({ status }) => {
  const colorScheme = STATUS_COLORS[status] || {
    bg: "#f3f4f6",
    text: "#374151",
    border: "#e5e7eb"
  };

  return (
    <span
      style={{
        backgroundColor: colorScheme.bg,
        color: colorScheme.text,
        border: `1px solid ${colorScheme.border}`,
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px"
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: colorScheme.text
        }}
      />
      {status}
    </span>
  );
};

export default StatusBadge;
