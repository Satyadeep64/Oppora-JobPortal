import { useEffect, useState } from "react";

const ATSScoreCard = ({ score }) => {

  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let current = 0;

    const timer = setInterval(() => {

      current++;

      setDisplayScore(current);

      if (current >= score) {
        clearInterval(timer);
      }

    }, 18);

    return () => clearInterval(timer);

  }, [score]);

  const radius = 70;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const progress =
    circumference -
    (displayScore / 100) * circumference;

  let color = "#ef4444";
  let status = "Needs Improvement";

  if (displayScore >= 80) {
    color = "#16a34a";
    status = "Excellent";
  }
  else if (displayScore >= 60) {
    color = "#f59e0b";
    status = "Good";
  }

  return (

    <div className="ats-card">

      <h2>ATS Score</h2>

      <svg
        className="progress-ring"
        width="170"
        height="170"
      >

        <circle
          className="progress-bg"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx="85"
          cy="85"
          fill="transparent"
        />

        <circle
          stroke={color}
          className="progress-bar"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          r={normalizedRadius}
          cx="85"
          cy="85"
          fill="transparent"
        />

      </svg>

      <div
        className="score-text"
        style={{ color }}
      >
        {displayScore}%
      </div>

      <p>{status}</p>

    </div>

  );

};

export default ATSScoreCard;