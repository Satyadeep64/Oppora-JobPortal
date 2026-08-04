import { useState, useEffect, useCallback } from "react";
import { interviewService } from "../services/interviewService";

export const useInterviews = () => {
  const recruiterId = localStorage.getItem("userId") || 1;

  const [interviews, setInterviews] = useState([]);
  const [shortlistedCandidates, setShortlistedCandidates] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isNetworkError, setIsNetworkError] = useState(false);

  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    setIsNetworkError(false);
    try {
      const [allInterviews, shortlisted, events] = await Promise.all([
        interviewService.getInterviewsByRecruiter(recruiterId),
        interviewService.getShortlistedCandidates(recruiterId),
        interviewService.getCalendarEvents(recruiterId)
      ]);

      setInterviews(Array.isArray(allInterviews) ? allInterviews : []);
      setShortlistedCandidates(Array.isArray(shortlisted) ? shortlisted : []);
      setCalendarEvents(Array.isArray(events) ? events : []);
    } catch (err) {
      console.error("[useInterviews] Error fetching pipeline data:", err);
      const isNet = err?.code === "ERR_NETWORK" || err?.message === "Network Error";
      setIsNetworkError(isNet);
      setError(
        isNet
          ? "Network Disconnected: Unable to reach backend API server at http://localhost:5024."
          : (err?.response?.data?.message || "Failed to load interview records.")
      );
    } finally {
      setLoading(false);
    }
  }, [recruiterId]);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Method to immediately prepend a newly saved interview optimistically
  const addOptimisticInterview = useCallback((newInterview) => {
    if (!newInterview) return;
    setInterviews((prev) => {
      const exists = prev.some((item) => item.id === newInterview.id);
      if (exists) {
        return prev.map((item) => (item.id === newInterview.id ? newInterview : item));
      }
      return [newInterview, ...prev];
    });
  }, []);

  const withSubmit = useCallback(async (asyncFn) => {
    setSubmitting(true);
    try {
      const result = await asyncFn();
      await fetchData(false);
      return result;
    } catch (err) {
      console.error("[useInterviews] Mutation error:", err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [fetchData]);

  const scheduleInterview = (payload) =>
    withSubmit(() => interviewService.scheduleInterview(payload));

  const updateInterview = (interviewId, payload) =>
    withSubmit(() => interviewService.updateInterview(interviewId, payload));

  const deleteInterview = (interviewId) =>
    withSubmit(() => interviewService.deleteInterview(interviewId));

  const rescheduleInterview = (interviewId, payload) =>
    withSubmit(() => interviewService.rescheduleInterview(interviewId, payload));

  const cancelInterview = (interviewId, reason = "Cancelled by recruiter") =>
    withSubmit(() => interviewService.cancelInterview(interviewId, reason));

  const completeInterview = (interviewId) =>
    withSubmit(() => interviewService.completeInterview(interviewId));

  const submitFeedback = (feedbackPayload) =>
    withSubmit(() => interviewService.submitFeedback(feedbackPayload));

  const checkConflict = async (checkPayload) => {
    try {
      return await interviewService.checkConflict(checkPayload);
    } catch (err) {
      console.error("[useInterviews] Error checking schedule conflict:", err);
      return { hasConflict: false };
    }
  };

  return {
    interviews,
    shortlistedCandidates,
    calendarEvents,
    loading,
    submitting,
    error,
    isNetworkError,
    refreshData: () => fetchData(false),
    addOptimisticInterview,
    scheduleInterview,
    updateInterview,
    deleteInterview,
    rescheduleInterview,
    cancelInterview,
    completeInterview,
    checkConflict,
    submitFeedback
  };
};
