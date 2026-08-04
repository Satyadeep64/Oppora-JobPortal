import "./ResumeResults.css";

const ResumeResults = ({ result }) => {
  return (
    <div className="results-container">

      <div className="score-card">
        <h2>ATS Score</h2>
        <div className="score-circle">
          {result.score}%
        </div>
      </div>

      <div className="results-grid">

        <div className="result-card">
          <h3>Skills Detected</h3>

          <div className="badge-container">
            {result.skills.map((skill, index) => (
              <span key={index} className="skill-badge">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="result-card">
          <h3>Missing Skills</h3>

          <div className="badge-container">
            {result.missing.map((skill, index) => (
              <span key={index} className="missing-badge">
                {skill}
              </span>
            ))}
          </div>
        </div>

      </div>

      <div className="result-card">

        <h3>AI Suggestions</h3>

        <ul className="suggestion-list">
          {result.suggestions.map((item, index) => (
            <li key={index}>
              {item}
            </li>
          ))}
        </ul>

      </div>

    </div>
  );
};

export default ResumeResults;