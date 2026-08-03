import ATSScoreCard from "./ATSScoreCard";
import "./ResumeDashboard.css";

const ResumeDashboard = ({ result }) => {
  const skills = Array.isArray(result?.skills) ? result.skills : [];
  const missing = Array.isArray(result?.missing) ? result.missing : [];
  const suggestions = Array.isArray(result?.suggestions) ? result.suggestions : [];
  const score = result?.score || 0;
  const feedback = result?.feedback || "No feedback provided.";

  return (
    <div className="dashboard-container">

      {/* Left Sidebar */}
      <div className="dashboard-sidebar">

        <ATSScoreCard score={score} />

        <div className="summary-card">
          <h4>Resume Summary</h4>

          <p>
            Your resume has been analyzed by Oppora AI.
          </p>

          <div className="summary-item">
            <span>Strengths</span>
            <strong>{skills.length}</strong>
          </div>

          <div className="summary-item">
            <span>Missing Skills</span>
            <strong>{missing.length}</strong>
          </div>

          <div className="summary-item">
            <span>Suggestions</span>
            <strong>{suggestions.length}</strong>
          </div>

        </div>

      </div>

      {/* Right Side */}

      <div className="dashboard-main">

  <div className="dashboard-card fade">

    <h2>✔ Strengths</h2>

    <div className="tag-container">

      {skills.map((item, index) => (

        <span
          key={index}
          className="skill-tag"
        >
          {item}
        </span>

      ))}

    </div>

  </div>


  <div className="dashboard-card fade">

    <h2>⚠ Missing Skills</h2>

    <div className="tag-container">

      {missing.map((item, index) => (

        <span
          key={index}
          className="missing-tag"
        >
          {item}
        </span>

      ))}

    </div>

  </div>


  <div className="dashboard-card fade">

    <h2>💡 AI Suggestions</h2>

    <ul>

      {suggestions.map((item, index) => (

        <li key={index}>
          {item}
        </li>

      ))}

    </ul>

  </div>


  <div className="dashboard-card fade">

    <h2>📝 Overall Feedback</h2>

    <p className="feedback">

      {feedback}

    </p>
    </div>

  </div>

</div>
  );
};

export default ResumeDashboard;