import { useState } from "react";
import {
    FaUserTie, FaCode, FaSlidersH, FaVolumeUp,
    FaMicrophone, FaCommentAlt, FaPlay, FaCheck, FaLayerGroup
} from "react-icons/fa";

const ROLES = [
    { id: "fullstack", title: "Full-Stack Developer", desc: "React, Node.js, .NET & SQL Databases", icon: "💻" },
    { id: "frontend", title: "Frontend React Developer", desc: "React 19, CSS3, State & Performance", icon: "🎨" },
    { id: "backend", title: "Backend .NET / C# Developer", desc: "C#, ASP.NET Core, REST APIs & Microservices", icon: "⚙️" },
    { id: "datascientist", title: "Data Scientist & ML", desc: "Python, SQL, Machine Learning & Analytics", icon: "📊" },
    { id: "devops", title: "DevOps & Cloud Engineer", desc: "Docker, Kubernetes, CI/CD & AWS/Azure", icon: "☁️" },
    { id: "behavioral", title: "HR & Behavioral Specialist", desc: "STAR method, Leadership & Communication", icon: "🤝" }
];

const EXPERIENCE_LEVELS = [
    { id: "junior", label: "Junior (0 - 2 yrs)", desc: "Core fundamentals & problem solving" },
    { id: "mid", label: "Mid-Level (2 - 5 yrs)", desc: "Production code, architecture & best practices" },
    { id: "senior", label: "Senior / Lead (5+ yrs)", desc: "System design, optimization & leadership" }
];

const TECH_STACK_OPTIONS = [
    "React", "JavaScript", "TypeScript", "C# / .NET", "ASP.NET Core",
    "SQL Server", "Node.js", "Python", "REST APIs", "Git", "Docker", "System Design"
];

const InterviewSetupModal = ({ onStartInterview }) => {
    const [selectedRole, setSelectedRole] = useState("fullstack");
    const [experience, setExperience] = useState("mid");
    const [selectedTech, setSelectedTech] = useState(["React", "C# / .NET", "SQL Server"]);
    const [interviewType, setInterviewType] = useState("Technical");
    const [questionCount, setQuestionCount] = useState(5);
    const [speechMode, setSpeechMode] = useState("speech-to-speech"); // 'speech-to-speech' | 'speech-to-text'
    const [voiceSpeed, setVoiceSpeed] = useState(1.0);
    const [selectedVoiceGender, setSelectedVoiceGender] = useState("Female");

    const toggleTech = (tech) => {
        if (selectedTech.includes(tech)) {
            if (selectedTech.length > 1) {
                setSelectedTech(selectedTech.filter(t => t !== tech));
            }
        } else {
            setSelectedTech([...selectedTech, tech]);
        }
    };

    const handleStart = () => {
        const roleObj = ROLES.find(r => r.id === selectedRole);
        onStartInterview({
            role: roleObj ? roleObj.title : "Full-Stack Developer",
            roleId: selectedRole,
            experience,
            techStack: selectedTech,
            interviewType,
            questionCount,
            speechMode,
            voiceSpeed,
            voiceGender: selectedVoiceGender
        });
    };

    return (
        <div className="setup-modal-overlay">
            <div className="setup-modal-card">
                <div className="setup-header">
                    <div className="setup-badge">
                        <FaSlidersH /> AI Interview Configuration
                    </div>
                    <h2>Prepare for Your AI Mock Interview</h2>
                    <p>Customize your interview parameters, speech interaction mode, and technical focus areas.</p>
                </div>

                <div className="setup-body">
                    {/* Role Selection */}
                    <div className="setup-section">
                        <label className="section-label">
                            <FaUserTie /> Select Target Role
                        </label>
                        <div className="roles-grid">
                            {ROLES.map((r) => (
                                <div
                                    key={r.id}
                                    className={`role-card ${selectedRole === r.id ? "active" : ""}`}
                                    onClick={() => setSelectedRole(r.id)}
                                >
                                    <span className="role-icon">{r.icon}</span>
                                    <div className="role-info">
                                        <h4>{r.title}</h4>
                                        <p>{r.desc}</p>
                                    </div>
                                    {selectedRole === r.id && <FaCheck className="role-check" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Experience Level */}
                    <div className="setup-section">
                        <label className="section-label">
                            <FaLayerGroup /> Experience Level
                        </label>
                        <div className="exp-grid">
                            {EXPERIENCE_LEVELS.map((exp) => (
                                <div
                                    key={exp.id}
                                    className={`exp-card ${experience === exp.id ? "active" : ""}`}
                                    onClick={() => setExperience(exp.id)}
                                >
                                    <h5>{exp.label}</h5>
                                    <p>{exp.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tech Stack Chips */}
                    <div className="setup-section">
                        <label className="section-label">
                            <FaCode /> Focus Technologies
                        </label>
                        <div className="tech-chips">
                            {TECH_STACK_OPTIONS.map((tech) => (
                                <button
                                    key={tech}
                                    type="button"
                                    className={`tech-chip ${selectedTech.includes(tech) ? "active" : ""}`}
                                    onClick={() => toggleTech(tech)}
                                >
                                    {selectedTech.includes(tech) && <FaCheck className="chip-check" />}
                                    {tech}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Interaction Mode (Speech to Speech vs Speech to Text) */}
                    <div className="setup-section">
                        <label className="section-label">
                            <FaVolumeUp /> AI Interaction Mode
                        </label>
                        <div className="mode-toggle-container">
                            <div
                                className={`mode-card ${speechMode === "speech-to-speech" ? "active" : ""}`}
                                onClick={() => setSpeechMode("speech-to-speech")}
                            >
                                <div className="mode-icon-wrap">
                                    <FaMicrophone />
                                </div>
                                <div className="mode-details">
                                    <h4>Speech-to-Speech Mode (Recommended)</h4>
                                    <p>AI agent speaks questions & listens to your spoken audio responses with real-time speech synthesis.</p>
                                </div>
                                <span className="mode-badge">Full Voice</span>
                            </div>

                            <div
                                className={`mode-card ${speechMode === "speech-to-text" ? "active" : ""}`}
                                onClick={() => setSpeechMode("speech-to-text")}
                            >
                                <div className="mode-icon-wrap">
                                    <FaCommentAlt />
                                </div>
                                <div className="mode-details">
                                    <h4>Speech-to-Text Mode</h4>
                                    <p>AI agent displays full streaming text captions for questions & candidate can respond via text or speech.</p>
                                </div>
                                <span className="mode-badge text-mode">Text & Voice</span>
                            </div>
                        </div>
                    </div>

                    {/* Voice & Speed Settings */}
                    <div className="setup-grid-2">
                        <div className="setup-section">
                            <label className="section-label">
                                <FaVolumeUp /> AI Voice Persona
                            </label>
                            <div className="voice-selector">
                                <button
                                    type="button"
                                    className={`voice-btn ${selectedVoiceGender === "Female" ? "active" : ""}`}
                                    onClick={() => setSelectedVoiceGender("Female")}
                                >
                                    👩 Professional Female (Emma)
                                </button>
                                <button
                                    type="button"
                                    className={`voice-btn ${selectedVoiceGender === "Male" ? "active" : ""}`}
                                    onClick={() => setSelectedVoiceGender("Male")}
                                >
                                    👨 Confident Male (Alex)
                                </button>
                            </div>
                        </div>

                        <div className="setup-section">
                            <label className="section-label">
                                ⏱️ AI Speech Pace ({voiceSpeed}x)
                            </label>
                            <div className="speed-buttons">
                                {[0.8, 1.0, 1.25, 1.5].map((speed) => (
                                    <button
                                        key={speed}
                                        type="button"
                                        className={`speed-btn ${voiceSpeed === speed ? "active" : ""}`}
                                        onClick={() => setVoiceSpeed(speed)}
                                    >
                                        {speed}x
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="setup-footer">
                    <button className="start-interview-btn" onClick={handleStart}>
                        <FaPlay /> Start AI Interview Session
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InterviewSetupModal;
