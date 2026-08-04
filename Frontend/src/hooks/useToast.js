/**
 * useToast — Lightweight toast notification hook.
 *
 * Usage:
 *   const { toasts, showToast } = useToast();
 *   showToast("Interview saved!", "success");
 *   showToast("Something went wrong.", "error");
 *
 * Render <ToastContainer toasts={toasts} /> somewhere in your page.
 */
import { useState, useCallback } from "react";

let _nextId = 1;

export const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

/**
 * @param {number} [duration=4000] - Auto-dismiss timeout in ms.
 */
export const useToast = (duration = 4000) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /**
   * Show a toast notification.
   * @param {string} message - The message to display.
   * @param {"success"|"error"|"warning"|"info"} [type="info"] - Toast type.
   * @param {number} [ms] - Override auto-dismiss duration.
   */
  const showToast = useCallback(
    (message, type = TOAST_TYPES.INFO, ms = duration) => {
      const id = _nextId++;
      setToasts((prev) => [
        ...prev,
        { id, message, type, createdAt: Date.now() },
      ]);
      if (ms > 0) {
        setTimeout(() => dismiss(id), ms);
      }
      return id;
    },
    [dismiss, duration]
  );

  return { toasts, showToast, dismiss };
};
