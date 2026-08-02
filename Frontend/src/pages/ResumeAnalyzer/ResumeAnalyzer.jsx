import { useState, useRef, useEffect } from "react";
import "./ResumeAnalyzer.css";
import ResumeUpload from "./ResumeUpload";
//import ResumeResults from "./ResumeResults";
import ResumeLoading from "./ResumeLoading";
import ResumeDashboard from "./ResumeDashboard";
import ResumeLibrary from "./ResumeLibrary";
import ResumeHero from "../../assets/resumeillustration.png";

const ResumeAnalyzer = () => {

   //const [step, setStep] = useState("upload");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  //const [resumeHistory, setResumeHistory] = useState([]);
const resultsRef = useRef(null);
useEffect(() => {
  if (result && resultsRef.current) {
    resultsRef.current.scrollIntoView({ behavior: "smooth" });
  }
}, [result]);
/*useEffect(() => {
  loadHistory();
}, []);
useEffect(() => {
  loadHistory();
}, [showAll]);*/


/*const loadHistory = async () => {
  try {
    const response = await fetch(
      "https://localhost:7054/api/ResumeAnalysis/history/1"
    );

    const data = await response.json();
    setResumeHistory(data);

  } catch (error) {
    console.error(error);
  }
};*/
/*const loadHistory = async () => {
  const response = await fetch(
    `https://localhost:7054/api/ResumeAnalysis/history/1${showAll ? "?all=true" : ""}`
  );

  const data = await response.json();
  setResumes(data);
};*/
const viewReport = async (id) => {
  try {
    setLoading(true);

    const response = await fetch(
      `https://localhost:7054/api/ResumeAnalysis/report/${id}`
    );

    const data = await response.json();

    const report = {
      score: data.score,
      skills: data.skills,
      missing: data.missing,
      suggestions: data.suggestions,
      feedback: data.feedback,
    };

    setResult(report);

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);

  } catch (err) {
    console.error(err);
    alert("Unable to load report.");
  } finally {
    setLoading(false);
  }
};


  const analyzeResume = async (file) => {
  console.log(file);
  setResult(null); 
 setLoading(true);
  //setStep("loading");

  try {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await fetch("https://localhost:7054/api/ResumeAnalysis/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    const formattedResult = {
      score: data.atsScore,
      skills: data.strengths,
      missing: data.missingSkills,
      suggestions: data.suggestions,
      feedback: data.overallFeedback
    };

    /*setResumeHistory(prev => [
  {
    id: Date.now(),
    fileName: file.name,
    uploadedAt: new Date().toISOString(),
    atsScore: formattedResult.score,
    status:
      formattedResult.score >= 85
        ? "Excellent"
        : formattedResult.score >= 70
        ? "Good"
        : "Needs Improvement"
  },
  ...prev
]);*/

setResult(formattedResult);

// Sync with database after UI updates
/*setTimeout(() => {
  loadHistory();
}, 500);*/

setLoading(false);


setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong while analyzing resume");
    setLoading(false);
  }finally{
    setLoading(false);
  }
    //setStep("dashboard");

  };

 return (
  <div className="resume-page">
    <div className="resume-container">
      <div className="resume-header">
      <h1 className="resume-title">AI Resume Analyzer</h1>

      <p className="subtitle">
        Upload your resume and let Oppora AI analyze your ATS score,
        technical skills, missing keywords, and recommend improvements.
      </p>
      </div>
      
      {/* Upload Section ALWAYS visible */}
<div className="hero-card">
  <ResumeUpload onAnalyze={analyzeResume} />
</div>
<div ref={resultsRef}>
  {loading && <ResumeLoading />}
  {!loading && result && (
    <ResumeDashboard result={result} />
  )}
</div>

<ResumeLibrary
    onViewReport={viewReport}
/>

    </div>
  </div>
 );
};


export default ResumeAnalyzer;