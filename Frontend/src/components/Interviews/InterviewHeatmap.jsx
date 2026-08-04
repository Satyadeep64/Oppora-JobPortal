import React, { useState, useMemo } from "react";
import { Flame, Calendar, RefreshCw, X, Filter } from "lucide-react";

/**
 * Color intensity criteria based on interview counts:
 * 0 interviews: Very light
 * 1–2 interviews: Light
 * 3–5 interviews: Medium
 * 6–10 interviews: Dark
 * 10+ interviews: Very Dark
 */
const getHeatmapColor = (count, isDark) => {
  if (count === 0) return isDark ? "#1e293b" : "#f1f5f9";
  if (count <= 2) return "#bbf7d0"; // Light green
  if (count <= 5) return "#4ade80"; // Medium green
  if (count <= 10) return "#16a34a"; // Dark green
  return "#14532d"; // Very Dark green
};

const getHeatmapTextColor = (count, isDark) => {
  if (count === 0) return isDark ? "#64748b" : "#94a3b8";
  if (count <= 5) return "#0f172a";
  return "#ffffff";
};

const getInterviewDateKey = (interview) => {
  if (!interview) return null;
  const rawDate = interview.interviewDate || interview.scheduledStartTime || interview.scheduledTime || interview.createdAt || interview.createdOn;
  if (!rawDate) return null;
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const InterviewHeatmap = ({ interviews = [], selectedDate = null, onSelectDate = () => {}, isDark = false }) => {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Compute 4 rolling weeks (28 days) dynamically from MySQL interviews data
  const heatmapDays = useMemo(() => {
    const dateMap = new Map();
    const safeList = Array.isArray(interviews) ? interviews.filter(Boolean) : [];

    safeList.forEach((inv) => {
      const key = getInterviewDateKey(inv);
      if (!key) return;

      if (!dateMap.has(key)) {
        dateMap.set(key, { total: 0, scheduled: 0, completed: 0, cancelled: 0 });
      }
      const entry = dateMap.get(key);
      entry.total += 1;

      const status = (inv.overallStatus || inv.interviewStatus || inv.status || "Scheduled").toLowerCase();
      if (status.includes("completed") || status.includes("finished")) {
        entry.completed += 1;
      } else if (status.includes("cancelled") || status.includes("deleted") || status.includes("failed")) {
        entry.cancelled += 1;
      } else {
        entry.scheduled += 1;
      }
    });

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + (6 - dayOfWeek)); // End on coming Saturday

    for (let i = 27; i >= 0; i--) {
      const d = new Date(endDate);
      d.setDate(endDate.getDate() - i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const dayNum = String(d.getDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${dayNum}`;

      const metrics = dateMap.get(dateKey) || { total: 0, scheduled: 0, completed: 0, cancelled: 0 };
      const formattedDate = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });

      days.push({
        dateKey,
        dateObj: d,
        dayNumber: d.getDate(),
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        formattedDate,
        isToday: d.getTime() === today.getTime(),
        ...metrics
      });
    }

    return days;
  }, [interviews]);

  // Group into 4 weeks (7 days per week)
  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < heatmapDays.length; i += 7) {
      result.push(heatmapDays.slice(i, i + 7));
    }
    return result;
  }, [heatmapDays]);

  const handleMouseEnter = (e, day) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 8
    });
    setHoveredDay(day);
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  const activeFilteredDay = useMemo(() => {
    if (!selectedDate) return null;
    return heatmapDays.find((d) => d.dateKey === selectedDate);
  }, [selectedDate, heatmapDays]);

  return (
    <div className="interview-heatmap-card" style={{
      background: "var(--ats-card-bg, #ffffff)",
      border: "1px solid var(--ats-border, #e2e8f0)",
      borderRadius: "16px",
      padding: "20px 24px",
      marginBottom: "24px",
      boxShadow: "var(--ats-shadow, 0 4px 6px -1px rgba(0,0,0,0.05))",
      color: "var(--ats-text-main, #0f172a)",
      position: "relative"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", padding: "8px", borderRadius: "10px", color: "#ffffff", display: "flex" }}>
            <Flame size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>Weekly Interview Heat Map</h3>
            <span style={{ fontSize: "12px", color: "var(--ats-text-muted)" }}>
              Recruiter interview volume over the past 4 weeks (Click a day square to filter)
            </span>
          </div>
        </div>

        {/* Selected Date Filter Badge */}
        {selectedDate && activeFilteredDay && (
          <div style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            color: "#1e40af",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <Filter size={13} />
            <span>Filter: {activeFilteredDay.formattedDate} ({activeFilteredDay.total} interviews)</span>
            <X
              size={14}
              style={{ cursor: "pointer", marginLeft: "4px" }}
              onClick={() => onSelectDate(null)}
              title="Clear date filter"
            />
          </div>
        )}
      </div>

      {/* Days of Week Header */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", marginBottom: "8px", textAlign: "center" }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
          <span key={dayName} style={{ fontSize: "11px", fontWeight: "800", color: "var(--ats-text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {dayName}
          </span>
        ))}
      </div>

      {/* Heatmap Grid (4 Weeks x 7 Days) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {weeks.map((week, wIdx) => (
          <div key={`week-${wIdx}`} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
            {week.map((day) => {
              const bg = getHeatmapColor(day.total, isDark);
              const textColor = getHeatmapTextColor(day.total, isDark);
              const isSelected = selectedDate === day.dateKey;

              return (
                <div
                  key={day.dateKey}
                  onClick={() => onSelectDate(isSelected ? null : day.dateKey)}
                  onMouseEnter={(e) => handleMouseEnter(e, day)}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    height: "42px",
                    borderRadius: "10px",
                    background: bg,
                    color: textColor,
                    border: isSelected
                      ? "2px solid #4f46e5"
                      : day.isToday
                      ? "2px dashed #f59e0b"
                      : "1px solid var(--ats-border, #cbd5e1)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    boxShadow: isSelected ? "0 0 0 3px rgba(79, 70, 229, 0.25)" : "none",
                    position: "relative",
                    transform: isSelected ? "scale(1.04)" : "scale(1)"
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: "800", lineHeight: "1" }}>
                    {day.dayNumber}
                  </span>
                  {day.total > 0 && (
                    <span style={{ fontSize: "9.5px", fontWeight: "800", opacity: 0.9, marginTop: "2px" }}>
                      {day.total}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Heatmap Legend */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", flexWrap: "wrap", gap: "10px", fontSize: "11.5px", color: "var(--ats-text-muted)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span>Less Activity</span>
          {[0, 2, 4, 8, 12].map((cnt) => (
            <div
              key={`legend-${cnt}`}
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "4px",
                background: getHeatmapColor(cnt, isDark),
                border: "1px solid var(--ats-border, #cbd5e1)"
              }}
              title={cnt === 0 ? "0 interviews" : cnt <= 2 ? "1-2 interviews" : cnt <= 5 ? "3-5 interviews" : cnt <= 10 ? "6-10 interviews" : "10+ interviews"}
            />
          ))}
          <span>More Activity</span>
        </div>

        <div style={{ display: "flex", gap: "12px", fontSize: "11px" }}>
          <span><strong style={{ color: "#bbf7d0" }}>■</strong> 1-2 Light</span>
          <span><strong style={{ color: "#4ade80" }}>■</strong> 3-5 Medium</span>
          <span><strong style={{ color: "#16a34a" }}>■</strong> 6-10 Dark</span>
          <span><strong style={{ color: "#14532d" }}>■</strong> 10+ Very Dark</span>
        </div>
      </div>

      {/* Rich Floating Tooltip on Hover */}
      {hoveredDay && (
        <div style={{
          position: "fixed",
          top: tooltipPos.y,
          left: tooltipPos.x,
          transform: "translate(-50%, -100%)",
          background: "#0f172a",
          color: "#ffffff",
          padding: "10px 14px",
          borderRadius: "10px",
          fontSize: "12px",
          zIndex: 9999,
          pointerEvents: "none",
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
          whiteSpace: "nowrap",
          lineHeight: "1.5"
        }}>
          <div style={{ fontWeight: "800", borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: "4px", marginBottom: "6px", color: "#f8fafc" }}>
            {hoveredDay.formattedDate}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div><strong>Total Interviews:</strong> {hoveredDay.total}</div>
            <div style={{ color: "#86efac" }}><strong>Scheduled:</strong> {hoveredDay.scheduled}</div>
            <div style={{ color: "#93c5fd" }}><strong>Completed:</strong> {hoveredDay.completed}</div>
            <div style={{ color: "#fca5a5" }}><strong>Cancelled:</strong> {hoveredDay.cancelled}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewHeatmap;
