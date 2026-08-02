import { useEffect, useState } from "react";

const messages = [
  "Reading your resume...",
  "Extracting technical skills...",
  "Calculating ATS score...",
  "Generating AI suggestions..."
];

const ResumeLoading = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= messages.length - 1) return;

    const timer = setTimeout(() => {
      setIndex(index + 1);
    }, 1500);

    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div className="loading-container">
      <h2>Analyzing Resume...</h2>
      <p>{messages[index]}</p>
    </div>
  );
};

export default ResumeLoading;