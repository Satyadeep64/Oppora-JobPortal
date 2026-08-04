import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

const TOAST_STYLES = {
  success: {
    background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    icon: CheckCircle2,
    iconColor: "#ecfdf5",
  },
  error: {
    background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
    icon: XCircle,
    iconColor: "#fef2f2",
  },
  warning: {
    background: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
    icon: AlertTriangle,
    iconColor: "#fffbeb",
  },
  info: {
    background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
    icon: Info,
    iconColor: "#eff6ff",
  },
};

/**
 * Individual Toast item.
 */
const Toast = ({ toast, onDismiss }) => {
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
  const Icon = style.icon;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: style.background,
        color: "#ffffff",
        borderRadius: "12px",
        padding: "12px 16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        minWidth: "280px",
        maxWidth: "440px",
        animation: "toast-slide-in 0.25s ease",
        pointerEvents: "all",
      }}
    >
      <Icon size={18} color={style.iconColor} style={{ flexShrink: 0 }} />
      <span
        style={{
          flex: 1,
          fontSize: "13px",
          fontWeight: 600,
          lineHeight: 1.4,
          wordBreak: "break-word",
        }}
      >
        {toast.message}
      </span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        style={{
          background: "rgba(255,255,255,0.2)",
          border: "none",
          borderRadius: "50%",
          color: "#fff",
          cursor: "pointer",
          width: "22px",
          height: "22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          padding: 0,
        }}
      >
        <X size={13} />
      </button>
    </div>
  );
};

/**
 * Toast container — renders toasts in the bottom-right corner.
 * Place this at the root of your page component.
 *
 * @param {{ toasts: Array, dismiss: Function }} props
 */
const ToastContainer = ({ toasts = [], dismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toast-slide-in {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          pointerEvents: "none",
        }}
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </>
  );
};

export default ToastContainer;
