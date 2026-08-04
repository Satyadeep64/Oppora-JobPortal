import React, { useState, useMemo } from "react";
import { X, Star, FileText, Download, CheckCircle2, Award } from "lucide-react";

const FeedbackDialog = ({ isOpen, interview, round, onClose, onSubmitFeedback }) => {
  const recruiterId = localStorage.getItem("userId");

  const [formData, setFormData] = useState({
    technicalSkills: 5,
    communication: 4,
    problemSolving: 5,
    cultureFit: 5,
    leadership: 4,
    confidence: 5,
    recommendation: "Strong Hire",
    interviewerNotes: "Candidate demonstrated exceptional domain expertise, clean code design, and stellar problem-solving skills during the technical evaluation."
  });

  const [submitting, setSubmitting] = useState(false);

  // Calculate Overall Score Automatically
  const overallScore = useMemo(() => {
    const sum =
      parseInt(formData.technicalSkills || 0) +
      parseInt(formData.communication || 0) +
      parseInt(formData.problemSolving || 0) +
      parseInt(formData.cultureFit || 0) +
      parseInt(formData.leadership || 0) +
      parseInt(formData.confidence || 0);

    return (sum / 6).toFixed(1);
  }, [formData]);

  if (!isOpen || !interview) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        interviewRoundId: round?.id || interview.rounds?.[0]?.id || 1,
        evaluatorId: parseInt(recruiterId) || 1,
        rating: Math.round(parseFloat(overallScore)),
        overallRating: Math.round(parseFloat(overallScore)),
        technicalScore: parseInt(formData.technicalSkills),
        communicationScore: parseInt(formData.communication),
        problemSolvingScore: parseInt(formData.problemSolving),
        strengths: `Technical: ${formData.technicalSkills}/5, Culture Fit: ${formData.cultureFit}/5, Leadership: ${formData.leadership}/5`,
        areasOfImprovement: `Confidence: ${formData.confidence}/5`,
        comments: formData.interviewerNotes,
        recommendation: formData.recommendation
      };

      await onSubmitFeedback(payload);
      onClose();
    } catch (err) {
      console.error("Error submitting feedback scorecard:", err);
      alert("Failed to save scorecard.");
    } finally {
      setSubmitting(false);
    }
  };

  // Export Scorecard PDF Printable Window
  const handleExportPdf = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Interview Scorecard - ${interview.candidateName}</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 30px; color: #0f172a; }
          .header { border-bottom: 2px solid #4f46e5; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: 800; color: #4f46e5; margin: 0; }
          .meta { font-size: 14px; color: #64748b; margin-top: 5px; }
          .badge { display: inline-block; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 6px 12px; border-radius: 6px; font-weight: 700; font-size: 14px; margin-top: 10px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
          .score-box { font-size: 32px; font-weight: 800; color: #4f46e5; text-align: center; margin: 15px 0; }
          .notes { background: #fff; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; font-size: 14px; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Enterprise Interview Evaluation Scorecard</div>
          <div class="meta">Candidate: <strong>${interview.candidateName}</strong> | Role: ${interview.opportunityTitle} | Date: ${new Date().toLocaleDateString()}</div>
          <div class="badge">Recommendation: ${formData.recommendation}</div>
        </div>

        <div class="score-box">Overall Calculated Score: ${overallScore} / 5.0</div>

        <div class="grid">
          <div class="card"><strong>Technical Skills:</strong> ${formData.technicalSkills} / 5</div>
          <div class="card"><strong>Communication:</strong> ${formData.communication} / 5</div>
          <div class="card"><strong>Problem Solving:</strong> ${formData.problemSolving} / 5</div>
          <div class="card"><strong>Culture Fit:</strong> ${formData.cultureFit} / 5</div>
          <div class="card"><strong>Leadership:</strong> ${formData.leadership} / 5</div>
          <div class="card"><strong>Confidence:</strong> ${formData.confidence} / 5</div>
        </div>

        <div class="notes">
          <strong>Interviewer Notes & Comments:</strong><br/>
          ${formData.interviewerNotes}
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="ats-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ats-modal-dialog" style={{ maxWidth: "640px" }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          padding: "22px 28px", color: "#ffffff", display: "flex",
          justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "19px", fontWeight: "800" }}>
              Enterprise Candidate Scorecard
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", opacity: 0.95 }}>
              Candidate: {interview.candidateName} • {interview.opportunityTitle}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              type="button"
              onClick={handleExportPdf}
              title="Export Scorecard as PDF"
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "#ffffff",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <Download size={14} /> Export PDF
            </button>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={20} /></button>
          </div>
        </div>

        {/* Calculated Overall Rating Display */}
        <div style={{ background: "#f8fafc", padding: "16px 28px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Calculated Overall Score</span>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#10b981", marginTop: "2px" }}>
              {overallScore} <span style={{ fontSize: "16px", color: "#64748b", fontWeight: "600" }}>/ 5.0</span>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Recommendation *</label>
            <select
              value={formData.recommendation}
              onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #10b981",
                fontSize: "13px",
                fontWeight: "700",
                background: "#ecfdf5",
                color: "#047857",
                cursor: "pointer"
              }}
            >
              <option value="Strong Hire">Strong Hire</option>
              <option value="Hire">Hire</option>
              <option value="Hold">Hold</option>
              <option value="Reject">Reject</option>
            </select>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* 6 Category Rating Sliders / Inputs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Technical Skills (1-5)</label>
              <input
                type="number" min="1" max="5" required
                value={formData.technicalSkills}
                onChange={(e) => setFormData({ ...formData, technicalSkills: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Communication (1-5)</label>
              <input
                type="number" min="1" max="5" required
                value={formData.communication}
                onChange={(e) => setFormData({ ...formData, communication: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Problem Solving (1-5)</label>
              <input
                type="number" min="1" max="5" required
                value={formData.problemSolving}
                onChange={(e) => setFormData({ ...formData, problemSolving: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Culture Fit (1-5)</label>
              <input
                type="number" min="1" max="5" required
                value={formData.cultureFit}
                onChange={(e) => setFormData({ ...formData, cultureFit: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Leadership (1-5)</label>
              <input
                type="number" min="1" max="5" required
                value={formData.leadership}
                onChange={(e) => setFormData({ ...formData, leadership: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Confidence (1-5)</label>
              <input
                type="number" min="1" max="5" required
                value={formData.confidence}
                onChange={(e) => setFormData({ ...formData, confidence: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
              />
            </div>
          </div>

          {/* Detailed Interviewer Notes */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Detailed Interviewer Notes & Justification *</label>
            <textarea
              rows={4}
              required
              placeholder="Record detailed evaluation remarks, code quality observations, and feedback justification..."
              value={formData.interviewerNotes}
              onChange={(e) => setFormData({ ...formData, interviewerNotes: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", resize: "none" }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "6px" }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 18px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ padding: "10px 22px", border: "none", borderRadius: "8px", background: "#10b981", color: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}>
              {submitting ? "Saving Scorecard..." : "Store & Save Scorecard"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackDialog;
