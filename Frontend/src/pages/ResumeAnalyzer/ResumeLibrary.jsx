import { useEffect, useState } from "react";
import "./ResumeAnalyzer.css";
//import { useNavigate } from "react-router-dom";
import "./ResumeLibrary.css";
import ResumePreviewModal from "./ResumePreviewModal";


const ResumeLibrary = ({ resumes, onViewReport }) => {
     const [history, setHistory] = useState([]);
     const [showAll, setShowAll] = useState(false);
     const [selectedResume, setSelectedResume] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [showAll]);

  const fetchHistory = async () => {
  try {
    const response = await fetch(
      `https://localhost:7054/api/ResumeAnalysis/history/1${showAll ? "?all=true" : ""}`
    );

    const data = await response.json();
    setHistory(data);

  } catch (err) {
    console.error(err);
  }
};
return (
    <section className="resume-library">

<div className="library-header">

  <div>
    <h2>📂 My Resume Library</h2>

    <p className="library-subtitle">
      Manage your uploaded resumes, review previous ATS reports,
      and track improvements over time.
    </p>
  </div>

  <button
  className="view-all-btn"
  onClick={() => setShowAll(!showAll)}
>
  {showAll ? "Show Less ↑" : "View All →"}
</button>

</div>      

      <table className="resume-table">

        <thead>

          <tr>
            <th>Resume</th>
            <th>Uploaded</th>
            <th>ATS %</th>
            <th>Status</th>
            <th>Action</th>
          </tr>

        </thead>

        <tbody>

{history.map((resume) => (

<tr key={resume.id}>

<td>

<div
    className="resume-name"
    onClick={() => setSelectedResume(resume)}
>

<span>📄</span>

<span>{resume.fileName}</span>

</div>

</td>

<td>

{new Date(resume.uploadedAt).toLocaleDateString()}

</td>

<td>

{resume.atsScore}%

</td>

<td>

<span
className={`status ${
resume.status === "Excellent"
? "excellent"
: resume.status === "Good"
? "good"
: "pending"
}`}

>

{resume.status}

</span>

</td>

<td>

<button
    className="action-btn secondary"
    onClick={() => onViewReport(resume.id)}
>
    View Report
</button>
</td>

</tr>

))}

</tbody>

      </table>
      <ResumePreviewModal
    resume={selectedResume}
    onClose={() => setSelectedResume(null)}
/>

    </section>
  );
};

export default ResumeLibrary;