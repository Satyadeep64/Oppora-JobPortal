import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

class InterviewErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[InterviewErrorBoundary] Unhandled UI error caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          background: "var(--ats-bg, #f8fafc)",
          color: "var(--ats-text-main, #0f172a)"
        }}>
          <div style={{
            background: "var(--ats-card-bg, #ffffff)",
            border: "1px solid #fecaca",
            borderRadius: "20px",
            padding: "40px 32px",
            maxWidth: "540px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              width: "60px", height: "60px", borderRadius: "50%",
              background: "#fef2f2", color: "#ef4444",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 18px", boxShadow: "0 4px 10px rgba(239, 68, 68, 0.15)"
            }}>
              <AlertTriangle size={30} />
            </div>

            <h3 style={{ margin: "0 0 10px 0", fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>
              Something Went Wrong
            </h3>

            <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#64748b", lineHeight: "1.6" }}>
              An unexpected component rendering error occurred in the Schedule Interview module.
              Your data remains safely stored in the database.
            </p>

            {this.state.error && (
              <div style={{
                background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "10px",
                padding: "12px 16px", marginBottom: "24px", fontSize: "12px",
                textAlign: "left", color: "#334155", fontFamily: "monospace",
                maxHeight: "120px", overflowY: "auto"
              }}>
                <strong>Error:</strong> {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  background: "var(--ats-bg, #f1f5f9)", color: "var(--ats-text-main, #334155)",
                  border: "1px solid var(--ats-border, #cbd5e1)", borderRadius: "10px",
                  padding: "10px 20px", fontSize: "13px", fontWeight: "700", cursor: "pointer"
                }}
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                  color: "#ffffff", border: "none", borderRadius: "10px",
                  padding: "10px 22px", fontSize: "13px", fontWeight: "800",
                  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px"
                }}
              >
                <RefreshCw size={15} /> Reload Module
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default InterviewErrorBoundary;
