export const INTERVIEW_STATUSES = {
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  RESCHEDULED: "Rescheduled",
  SELECTED: "Selected",
  REJECTED: "Rejected"
};

export const INTERVIEW_ROUNDS = [
  "Screening Round",
  "Technical Round 1",
  "Technical Round 2",
  "System Design Round",
  "Managerial Round",
  "HR Round"
];

export const INTERVIEW_TYPES = [
  "Technical",
  "Screening",
  "System Design",
  "Managerial",
  "HR Culture"
];

export const DEPARTMENTS = [
  "Engineering",
  "Product & Design",
  "Data Science",
  "Human Resources"
];

export const MEETING_PROVIDERS = [
  "Google Meet",
  "Microsoft Teams",
  "Zoom"
];

export const STATUS_COLORS = {
  Scheduled: { bg: "#e0e7ff", text: "#3730a3", border: "#c7d2fe" },
  "In Progress": { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  Completed: { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" },
  Rescheduled: { bg: "#ffedd5", text: "#9a3412", border: "#fed7aa" },
  Cancelled: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
  Selected: { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" },
  Rejected: { bg: "#f3f4f6", text: "#374151", border: "#e5e7eb" }
};
