import axios from "axios";

const API_BASE_URL = "http://localhost:5024/api";

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    "Content-Type": "application/json"
  }
});

export const interviewService = {
  // 1. GET Interviews (All or by Recruiter)
  getAllInterviews: async (recruiterId = null, status = null) => {
    try {
      let url = `${API_BASE_URL}/Interview`;
      const params = [];
      if (recruiterId) params.push(`recruiterId=${recruiterId}`);
      if (status && status !== "All") params.push(`status=${encodeURIComponent(status)}`);
      if (params.length > 0) url += `?${params.join("&")}`;

      const res = await axios.get(url, getAuthHeaders());
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.warn("[interviewService] getAllInterviews error:", err.message);
      return [];
    }
  },

  getInterviewsByRecruiter: async (recruiterId) => {
    try {
      if (!recruiterId || recruiterId <= 0) return await interviewService.getAllInterviews();
      const res = await axios.get(`${API_BASE_URL}/Interview/recruiter/${recruiterId}`, getAuthHeaders());
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.warn("[interviewService] getInterviewsByRecruiter error:", err.message);
      return await interviewService.getAllInterviews();
    }
  },

  // 2. GET Calendar Events
  getCalendarEvents: async (recruiterId = null) => {
    try {
      const url = recruiterId ? `${API_BASE_URL}/Interview/calendar?recruiterId=${recruiterId}` : `${API_BASE_URL}/Interview/calendar`;
      const res = await axios.get(url, getAuthHeaders());
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.warn("[interviewService] getCalendarEvents error:", err.message);
      return [];
    }
  },

  // 3. POST Interview (Create / Schedule)
  scheduleInterview: async (payload) => {
    const res = await axios.post(`${API_BASE_URL}/Interview`, payload, getAuthHeaders());
    return res.data;
  },

  // 4. PUT Interview (Update)
  updateInterview: async (interviewId, payload) => {
    const res = await axios.put(`${API_BASE_URL}/Interview/${interviewId}`, payload, getAuthHeaders());
    return res.data;
  },

  // 5. DELETE Interview (Delete / Cancel)
  deleteInterview: async (interviewId) => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/Interview/${interviewId}`, getAuthHeaders());
      return res.data;
    } catch (err) {
      // Fallback to cancel endpoint if DELETE route isn't configured
      const res = await axios.post(`${API_BASE_URL}/Interview/${interviewId}/cancel`, { reason: "Deleted by Recruiter Admin" }, getAuthHeaders());
      return res.data;
    }
  },

  cancelInterview: async (interviewId, reason) => {
    const res = await axios.post(`${API_BASE_URL}/Interview/${interviewId}/cancel`, { reason }, getAuthHeaders());
    return res.data;
  },

  // 7. GET Audit Log
  getAuditLogs: async (interviewId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/Interview/${interviewId}/audits`, getAuthHeaders());
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.warn("[interviewService] getAuditLogs error:", err.message);
      return [];
    }
  },

  // Additional Helper endpoints
  getShortlistedCandidates: async (recruiterId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/Interview/shortlisted/${recruiterId}`, getAuthHeaders());
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.warn("[interviewService] getShortlistedCandidates error:", err.message);
      return [];
    }
  },

  rescheduleInterview: async (interviewId, payload) => {
    const res = await axios.post(`${API_BASE_URL}/Interview/${interviewId}/reschedule`, payload, getAuthHeaders());
    return res.data;
  },

  completeInterview: async (interviewId) => {
    const res = await axios.post(`${API_BASE_URL}/Interview/${interviewId}/complete`, {}, getAuthHeaders());
    return res.data;
  },

  submitFeedback: async (payload) => {
    const res = await axios.post(`${API_BASE_URL}/Interview/feedback`, payload, getAuthHeaders());
    return res.data;
  }
};
