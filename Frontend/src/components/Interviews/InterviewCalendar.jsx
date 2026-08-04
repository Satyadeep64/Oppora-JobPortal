import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, Video,
  AlertTriangle, Grid, List, RotateCcw, CheckCircle, Plus, Eye, Edit3,
  Trash2, RefreshCw, X, ExternalLink
} from "lucide-react";
import { formatInterviewTime, formatInterviewDate } from "../../utils/interviewUtils";
import StatusBadge from "./StatusBadge";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WORK_HOURS = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"];

const InterviewCalendar = ({
  events = [],
  interviews = [],
  onView,
  onEdit,
  onDelete,
  onReschedule,
  onJoinMeet,
  onSelectSlot
}) => {
  const [calendarView, setCalendarView] = useState("month"); // "month" | "week" | "day" | "agenda"
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Normalize all interviews/events into standard calendar event objects
  const allEvents = useMemo(() => {
    const list = [];
    const seenIds = new Set();

    // 1. Process explicit calendar events
    if (Array.isArray(events)) {
      events.forEach((ev) => {
        if (!ev) return;
        const idKey = ev.interviewId ? `inv-${ev.interviewId}` : (ev.id || `evt-${Math.random()}`);
        seenIds.add(idKey);
        if (ev.interviewId) seenIds.add(ev.interviewId);

        const startDate = new Date(ev.start || ev.scheduledTime || ev.interviewDate);
        const endDate = new Date(ev.end || startDate.getTime() + (ev.duration || 45) * 60000);

        list.push({
          ...ev,
          id: idKey,
          candidateName: ev.candidateName || ev.title || "Candidate",
          jobRole: ev.jobRole || ev.opportunityTitle || "Position",
          interviewer: ev.interviewer || ev.recruiterName || "Recruiter",
          start: startDate,
          end: endDate,
          status: ev.overallStatus || ev.status || "Scheduled",
          meetingUrl: ev.googleMeetLink || ev.meetingUrl || "",
          notes: ev.specialInstructions || ev.notes || ""
        });
      });
    }

    // 2. Process interviews array (includes newly scheduled interviews)
    if (Array.isArray(interviews)) {
      interviews.filter(Boolean).forEach((inv) => {
        if (seenIds.has(inv.id) || seenIds.has(`inv-${inv.id}`)) return;

        const round = inv.rounds?.[0] || {};
        const meeting = round.meetingDetails || {};
        const startTimeStr = round.scheduledTime || inv.scheduledTime || inv.interviewDate || new Date().toISOString();
        const startDate = new Date(startTimeStr);
        const dur = inv.duration || round.durationMinutes || 45;
        const endDate = new Date(startDate.getTime() + dur * 60000);

        list.push({
          id: `inv-${inv.id}`,
          rawInterview: inv,
          candidateName: inv.candidateName || "Candidate",
          candidateEmail: inv.candidateEmail || "",
          jobRole: inv.jobRole || inv.opportunityTitle || "Position",
          interviewer: inv.interviewer || inv.recruiterName || "Recruiter",
          roundTitle: inv.interviewRound || round.title || "Technical Round 1",
          start: startDate,
          end: endDate,
          duration: dur,
          status: inv.overallStatus || inv.interviewStatus || "Scheduled",
          invitationStatus: inv.invitationStatus || (round.isEmailSent ? "Sent" : "Pending"),
          meetingUrl: inv.googleMeetLink || meeting.meetingUrl || "",
          notes: inv.specialInstructions || inv.notes || ""
        });
      });
    }

    return list;
  }, [events, interviews]);

  // Interviewer Conflict & Double-Booking Detection Logic
  const conflicts = useMemo(() => {
    const conflictSet = new Set();
    const list = allEvents.filter((e) => e.status !== "Cancelled");

    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];

        // Check if same interviewer or candidate
        const sameInterviewer = (a.interviewer && b.interviewer && a.interviewer.toLowerCase() === b.interviewer.toLowerCase());
        const sameCandidate = (a.candidateName && b.candidateName && a.candidateName.toLowerCase() === b.candidateName.toLowerCase());

        if (sameInterviewer || sameCandidate) {
          const startA = new Date(a.start).getTime();
          const endA = new Date(a.end).getTime();
          const startB = new Date(b.start).getTime();
          const endB = new Date(b.end).getTime();

          // Time Overlap Test
          if (startA < endB && endA > startB) {
            conflictSet.add(a.id);
            conflictSet.add(b.id);
          }
        }
      }
    }
    return conflictSet;
  }, [allEvents]);

  // Navigation Handlers
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (calendarView === "month") d.setMonth(d.getMonth() - 1);
    else if (calendarView === "week") d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (calendarView === "month") d.setMonth(d.getMonth() + 1);
    else if (calendarView === "week") d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => setCurrentDate(new Date());

  // Date Calculation Helpers for Month View
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= lastDate; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [currentDate]);

  // Events filtered for Day View
  const dayEvents = useMemo(() => {
    const dateStr = currentDate.toDateString();
    return allEvents.filter((e) => new Date(e.start).toDateString() === dateStr);
  }, [allEvents, currentDate]);

  // Events grouped by Date for Agenda View
  const agendaGrouped = useMemo(() => {
    const groups = {};
    allEvents.forEach((ev) => {
      const key = new Date(ev.start).toDateString();
      if (!groups[key]) groups[key] = [];
      groups[key].push(ev);
    });
    return groups;
  }, [allEvents]);

  return (
    <div className="interview-calendar-advanced" style={{
      background: "var(--ats-card-bg, #ffffff)",
      border: "1px solid var(--ats-border, #e2e8f0)",
      borderRadius: "16px",
      padding: "22px",
      boxShadow: "var(--ats-shadow, 0 4px 6px -1px rgba(0,0,0,0.05))",
      color: "var(--ats-text-main, #0f172a)"
    }}>
      {/* Calendar Header & View Switcher */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ background: "linear-gradient(135deg, #4f46e5, #3b82f6)", padding: "10px", borderRadius: "12px", color: "#ffffff" }}>
            <CalendarIcon size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "var(--ats-text-main)" }}>Interactive ATS Interview Calendar</h3>
            <span style={{ fontSize: "12px", color: "var(--ats-text-muted)" }}>Live scheduling grid • Double-booking conflict detector • Google Meet integrated</span>
          </div>
        </div>

        {/* View Switcher Tabs & Date Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", background: "var(--ats-bg, #f1f5f9)", padding: "3px", borderRadius: "10px", border: "1px solid var(--ats-border, #cbd5e1)" }}>
            {["month", "week", "day", "agenda"].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setCalendarView(v)}
                style={{
                  background: calendarView === v ? "var(--ats-card-bg, #ffffff)" : "transparent",
                  color: calendarView === v ? "#4f46e5" : "var(--ats-text-muted, #64748b)",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "800",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  boxShadow: calendarView === v ? "0 2px 4px rgba(0,0,0,0.08)" : "none"
                }}
              >
                {v} View
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button type="button" onClick={handleToday} style={{ background: "var(--ats-bg)", border: "1px solid var(--ats-border)", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: "700", cursor: "pointer", color: "var(--ats-text-main)" }}>
              Today
            </button>
            <button type="button" onClick={handlePrev} style={{ background: "var(--ats-bg)", border: "1px solid var(--ats-border)", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", color: "var(--ats-text-main)" }}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontWeight: "800", fontSize: "14px", minWidth: "150px", textAlign: "center" }}>
              {currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <button type="button" onClick={handleNext} style={{ background: "var(--ats-bg)", border: "1px solid var(--ats-border)", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", color: "var(--ats-text-main)" }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Double-Booking & Conflict Detection Alert Banner */}
      {conflicts.size > 0 && (
        <div style={{
          background: "#fef2f2",
          border: "1px solid #fca5a5",
          color: "#991b1b",
          padding: "12px 18px",
          borderRadius: "12px",
          marginBottom: "18px",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <AlertTriangle size={20} color="#dc2626" />
          <span><b>Double-Booking Conflict Detected:</b> {conflicts.size} overlapping interview slots detected for interviewer or candidate. Reschedule conflicting slots to avoid scheduling clashes.</span>
        </div>
      )}

      {/* 1. MONTH VIEW */}
      {calendarView === "month" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px", background: "var(--ats-border, #cbd5e1)", borderRadius: "12px", overflow: "hidden" }}>
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} style={{ background: "var(--ats-bg, #f8fafc)", padding: "10px", textAlign: "center", fontWeight: "800", fontSize: "12px", color: "var(--ats-text-muted)" }}>
                {d}
              </div>
            ))}

            {daysInMonth.map((dayDate, idx) => {
              if (!dayDate) {
                return <div key={`empty-${idx}`} style={{ background: "var(--ats-bg, #f8fafc)", minHeight: "100px" }} />;
              }

              const dateStr = dayDate.toDateString();
              const isToday = dateStr === new Date().toDateString();
              const dayEventsList = allEvents.filter((ev) => new Date(ev.start).toDateString() === dateStr);

              return (
                <div
                  key={dayDate.toISOString()}
                  style={{
                    background: isToday ? "var(--ats-card-bg, #ffffff)" : "var(--ats-card-bg, #ffffff)",
                    minHeight: "110px",
                    padding: "8px",
                    border: isToday ? "2px solid #4f46e5" : "none",
                    boxSizing: "border-box"
                  }}
                >
                  <div style={{ fontSize: "12px", fontWeight: "800", color: isToday ? "#4f46e5" : "var(--ats-text-main)", marginBottom: "4px" }}>
                    {dayDate.getDate()}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {dayEventsList.slice(0, 3).map((event) => {
                      const hasConflict = conflicts.has(event.id);

                      return (
                        <div
                          key={event.id}
                          onClick={() => {
                            setSelectedEvent(event);
                            if (onView) onView(event.rawInterview || event);
                          }}
                          style={{
                            background: hasConflict
                              ? "rgba(239, 68, 68, 0.18)"
                              : event.status === "Completed"
                              ? "rgba(16, 185, 129, 0.18)"
                              : event.status === "Rescheduled"
                              ? "rgba(245, 158, 11, 0.18)"
                              : "rgba(79, 70, 229, 0.18)",
                            color: hasConflict
                              ? "#f87171"
                              : event.status === "Completed"
                              ? "#34d399"
                              : event.status === "Rescheduled"
                              ? "#fbbf24"
                              : "var(--ats-text-main, #818cf8)",
                            border: `1px solid ${
                              hasConflict
                                ? "rgba(239, 68, 68, 0.4)"
                                : event.status === "Completed"
                                ? "rgba(16, 185, 129, 0.4)"
                                : event.status === "Rescheduled"
                                ? "rgba(245, 158, 11, 0.4)"
                                : "rgba(79, 70, 229, 0.4)"
                            }`,
                            borderRadius: "6px",
                            padding: "4px 6px",
                            fontSize: "11px",
                            fontWeight: "700",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          {hasConflict && "⚠️ "}
                          {formatInterviewTime(event.start)} - {event.candidateName}
                        </div>
                      );
                    })}

                    {dayEventsList.length > 3 && (
                      <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--ats-text-muted)", paddingLeft: "4px" }}>
                        +{dayEventsList.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. WEEK VIEW */}
      {calendarView === "week" && (
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "80px repeat(7, 1fr)", gap: "1px", background: "var(--ats-border)", borderRadius: "12px", overflow: "hidden", minWidth: "700px" }}>
            <div style={{ background: "var(--ats-bg)", padding: "10px", fontWeight: "800", fontSize: "11px" }}>Time</div>
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} style={{ background: "var(--ats-bg)", padding: "10px", textAlign: "center", fontWeight: "800", fontSize: "12px" }}>{d}</div>
            ))}

            {WORK_HOURS.map((hour) => (
              <React.Fragment key={hour}>
                <div style={{ background: "var(--ats-bg)", padding: "10px", fontSize: "11px", fontWeight: "700", color: "var(--ats-text-muted)" }}>
                  {hour}
                </div>
                {DAYS_OF_WEEK.map((_, dayIdx) => (
                  <div key={`${hour}-${dayIdx}`} style={{ background: "var(--ats-card-bg)", minHeight: "50px", padding: "4px" }}>
                    {allEvents.filter((e) => {
                      const evDay = new Date(e.start).getDay();
                      const evTime = formatInterviewTime(e.start);
                      return evDay === dayIdx && evTime.slice(0, 5) === hour.slice(0, 5);
                    }).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => onView && onView(ev.rawInterview || ev)}
                        style={{
                          background: conflicts.has(ev.id) ? "#fef2f2" : "#ecfdf5",
                          border: `1px solid ${conflicts.has(ev.id) ? "#fca5a5" : "#a7f3d0"}`,
                          color: conflicts.has(ev.id) ? "#991b1b" : "#065f46",
                          padding: "4px 6px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", cursor: "pointer"
                        }}
                      >
                        {ev.candidateName} ({ev.jobRole})
                      </div>
                    ))}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* 3. DAY VIEW */}
      {calendarView === "day" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "var(--ats-text-main)" }}>
            Interviews for {currentDate.toDateString()} ({dayEvents.length} Scheduled)
          </h4>

          {dayEvents.length === 0 ? (
            <div style={{ background: "var(--ats-bg)", padding: "30px", borderRadius: "12px", textAlign: "center", color: "var(--ats-text-muted)" }}>
              No interview events scheduled for this day.
            </div>
          ) : (
            dayEvents.map((ev) => {
              const hasConflict = conflicts.has(ev.id);

              return (
                <div
                  key={ev.id}
                  style={{
                    background: hasConflict ? "#fef2f2" : "var(--ats-bg)",
                    border: `1px solid ${hasConflict ? "#fca5a5" : "var(--ats-border)"}`,
                    borderRadius: "12px", padding: "16px",
                    display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800" }}>{ev.candidateName}</h4>
                      <StatusBadge status={ev.status} />
                      {hasConflict && (
                        <span style={{ background: "#ef4444", color: "#fff", fontSize: "10px", fontWeight: "800", padding: "2px 6px", borderRadius: "4px" }}>
                          Double-Booked Conflict
                        </span>
                      )}
                    </div>

                    <p style={{ margin: "4px 0", fontSize: "13px", color: "var(--ats-primary)", fontWeight: "700" }}>
                      {ev.jobRole} • <span style={{ color: "var(--ats-text-muted)" }}>Interviewer: {ev.interviewer}</span>
                    </p>

                    <div style={{ fontSize: "12px", color: "var(--ats-text-muted)", display: "flex", gap: "14px", marginTop: "4px" }}>
                      <span><Clock size={13} style={{ verticalAlign: "middle" }} /> {formatInterviewTime(ev.start)} ({ev.duration || 45} mins)</span>
                      {ev.candidateEmail && <span><User size={13} style={{ verticalAlign: "middle" }} /> {ev.candidateEmail}</span>}
                    </div>
                  </div>

                  {/* Actions for Day Event */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => onView && onView(ev.rawInterview || ev)}
                      style={{ background: "var(--ats-card-bg)", color: "var(--ats-text-main)", border: "1px solid var(--ats-border)", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      <Eye size={14} /> View Details
                    </button>

                    <button
                      type="button"
                      onClick={() => onReschedule && onReschedule(ev.rawInterview || ev)}
                      style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      <RefreshCw size={14} /> Reschedule
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete && onDelete(ev.id)}
                      style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      <Trash2 size={14} /> Cancel
                    </button>

                    {ev.meetingUrl && (
                      <button
                        type="button"
                        onClick={() => onJoinMeet && onJoinMeet(ev.meetingUrl)}
                        style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <Video size={14} /> Join Meeting
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 4. AGENDA VIEW */}
      {calendarView === "agenda" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {Object.keys(agendaGrouped).length === 0 ? (
            <div style={{ background: "var(--ats-bg)", padding: "40px", borderRadius: "12px", textAlign: "center", color: "var(--ats-text-muted)" }}>
              No upcoming interview agenda items found.
            </div>
          ) : (
            Object.entries(agendaGrouped).map(([dateKey, groupEvents]) => (
              <div key={dateKey} style={{ background: "var(--ats-bg)", border: "1px solid var(--ats-border)", borderRadius: "12px", padding: "16px" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "800", color: "#4f46e5", borderBottom: "1px solid var(--ats-border)", paddingBottom: "6px" }}>
                  📅 {dateKey} ({groupEvents.length} Interviews)
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {groupEvents.map((ev) => {
                    const hasConflict = conflicts.has(ev.id);

                    return (
                      <div
                        key={ev.id}
                        style={{
                          background: "var(--ats-card-bg)", border: `1px solid ${hasConflict ? "#fca5a5" : "var(--ats-border)"}`,
                          borderRadius: "10px", padding: "12px 16px",
                          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px"
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontWeight: "800", fontSize: "13px" }}>{ev.candidateName}</span>
                            <StatusBadge status={ev.status} />
                            {hasConflict && <span style={{ background: "#ef4444", color: "#fff", fontSize: "10px", fontWeight: "800", padding: "2px 6px", borderRadius: "4px" }}>Conflict</span>}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--ats-text-muted)", marginTop: "2px" }}>
                            {ev.jobRole} • {ev.interviewer} • {formatInterviewTime(ev.start)}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "6px" }}>
                          <button type="button" onClick={() => onView && onView(ev.rawInterview || ev)} style={{ background: "var(--ats-bg)", border: "1px solid var(--ats-border)", borderRadius: "6px", padding: "5px 10px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>
                            View
                          </button>
                          <button type="button" onClick={() => onReschedule && onReschedule(ev.rawInterview || ev)} style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: "6px", padding: "5px 10px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>
                            Reschedule
                          </button>
                          {ev.meetingUrl && (
                            <button type="button" onClick={() => onJoinMeet && onJoinMeet(ev.meetingUrl)} style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: "6px", padding: "5px 10px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>
                              Join
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};

export default InterviewCalendar;
