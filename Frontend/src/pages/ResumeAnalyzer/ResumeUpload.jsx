import { useRef, useState } from "react";
import ResumeHero from "../../assets/resumeillustration.png";

const ResumeUpload = ({ onAnalyze }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

 return (
  <section className="hero-section">
    <div className="hero-top">

    <h2 className="hero-heading">
      Get Your Resume Interview Ready
    </h2>

    <p className="hero-description">
      Upload your resume and let Oppora AI evaluate your ATS score,
      identify strengths, detect missing keywords, and provide
      personalized recommendations to improve your chances of getting
      shortlisted.
    </p>

  </div>
  <div className="hero-content">
   <div className="hero-left">

  <img
    src={ResumeHero}
    alt="Resume Illustration"
    className="hero-image"
  />

  <div className="hero-features">

    <div className="feature-card ">
      <span>🎯</span>
      <p>ATS Score Analysis</p>
    </div>

    <div className="feature-card ">
      <span>🚀</span>
      <p>AI Suggestions</p>
    </div>

    <div className="feature-card ">
      <span>💼</span>
      <p>Skill Matching</p>
    </div>

    <div className="feature-card ">
      <span>⚡</span>
      <p>10 Second Analysis</p>
    </div>

  </div>

  <div className="security-note">
    🔒 Your resume is securely processed and never shared without your permission.
  </div>

</div>

    <div className="hero-right">



    <div
        className="upload-box"
        onClick={() => fileInputRef.current.click()}
    >
        <div className="upload-icon">
    📤
</div>

        <h3>Upload Resume</h3>

        <p>Drag & Drop PDF / DOCX</p>

        <button
    type="button"
    className="choose-btn"
        onClick={(e) => {
        e.stopPropagation();
        fileInputRef.current.click();
    }}
>
    Choose Resume
</button>

        <input
            hidden
            type="file"
            ref={fileInputRef}
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
        />

    </div>

   {selectedFile && (

<div className="selected-file">

    <span>📄 {selectedFile.name}</span>

    <span className="success-icon">
        ✔
    </span>

</div>

)}

    <div className="upload-info">

        <span>📄 Supports PDF & DOCX</span>

        <span>🔒 Your resume is securely processed</span>

        <span>⚡ Analysis takes less than 10 seconds</span>

    </div>

    <button
        className="analyze-btn"
        disabled={!selectedFile}
        onClick={() => onAnalyze(selectedFile)}
    >
        Analyze Resume
    </button>

</div>
</div>

  </section>
);
};

export default ResumeUpload;