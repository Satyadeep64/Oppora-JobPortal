import { useState, useEffect } from "react";
import { ROADMAP_TRACKS } from "./roadmapData";
import {
    FaRoute, FaCheckCircle, FaBookOpen, FaQuestionCircle,
    FaExternalLinkAlt, FaTimes, FaSlidersH, FaLightbulb,
    FaChevronRight, FaClock, FaCheck, FaShareAlt,
    FaSun, FaMoon
} from "react-icons/fa";
import "./CareerPath.css";

const CareerPath = () => {
    const [selectedTrackId, setSelectedTrackId] = useState("fullstack");
    const [viewMode, setViewMode] = useState("flow"); // 'flow' | 'tree' | 'timeline'
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem("theme") || localStorage.getItem("cp_theme") || "dark";
        } catch {
            return "dark";
        }
    });

    const [masteredStages, setMasteredStages] = useState(() => {
        try {
            const saved = localStorage.getItem("oppora_mastered_stages");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [selectedDrawerStage, setSelectedDrawerStage] = useState(null);

    // Sync theme to document element
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        setTheme(nextTheme);
        try {
            localStorage.setItem("theme", nextTheme);
            localStorage.setItem("cp_theme", nextTheme);
            document.documentElement.setAttribute("data-theme", nextTheme);
        } catch (e) {
            console.error("Failed to save theme", e);
        }
    };

    // Save mastered stages to localStorage
    useEffect(() => {
        try {
            localStorage.setItem("oppora_mastered_stages", JSON.stringify(masteredStages));
        } catch (e) {
            console.error("Failed to save mastered stages", e);
        }
    }, [masteredStages]);

    const activeTrack = ROADMAP_TRACKS.find(t => t.id === selectedTrackId) || ROADMAP_TRACKS[0];

    const toggleStageMastery = (stageId, e) => {
        if (e) e.stopPropagation();
        if (masteredStages.includes(stageId)) {
            setMasteredStages(masteredStages.filter(id => id !== stageId));
        } else {
            setMasteredStages([...masteredStages, stageId]);
        }
    };

    // Calculate completion metrics
    const totalStages = activeTrack.stages.length;
    const masteredCount = activeTrack.stages.filter(s => masteredStages.includes(s.id)).length;
    const completionPct = Math.round((masteredCount / totalStages) * 100) || 0;

    const getLevelBadgeClass = (level) => {
        switch (level) {
            case "Beginner": return "level-beginner";
            case "Intermediate": return "level-intermediate";
            case "Advanced": return "level-advanced";
            case "Expert": return "level-expert";
            default: return "level-beginner";
        }
    };

    return (
        <div className={`career-path-page ${theme === "light" ? "light-theme" : "dark-theme"}`}>
            {/* Header Banner */}
            <div className="cp-header">
                <div className="cp-header-info">
                    <h1><FaRoute /> Interactive Tech Stack Career Path</h1>
                    <p>Structured learning roadmaps, key concept milestones, and interview prep for modern developers.</p>
                </div>

                <div className="cp-header-actions">
                    <button type="button" className="theme-toggle-btn" onClick={toggleTheme}>
                        {theme === "dark" ? <FaSun className="icon-sun" /> : <FaMoon className="icon-moon" />}
                        <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                    </button>

                    <div className="cp-overall-progress">
                        <div className="progress-stats">
                            <span className="progress-pct">{completionPct}%</span>
                            <span className="progress-label">{masteredCount} of {totalStages} Stages Mastered</span>
                        </div>
                        <div className="cp-bar-outer">
                            <div className="cp-bar-inner" style={{ width: `${completionPct}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Track Selector Bar */}
            <div className="track-selector-bar">
                {ROADMAP_TRACKS.map((track) => (
                    <button
                        key={track.id}
                        type="button"
                        className={`track-pill-btn ${selectedTrackId === track.id ? "active" : ""}`}
                        onClick={() => setSelectedTrackId(track.id)}
                    >
                        <span className="track-icon">{track.icon}</span>
                        <span>{track.title}</span>
                    </button>
                ))}
            </div>

            {/* Track Description & View Switcher */}
            <div className="track-banner">
                <div className="track-banner-text">
                    <h2>{activeTrack.title} Roadmap</h2>
                    <p>{activeTrack.subtitle}</p>
                </div>

                <div className="view-mode-tabs">
                    <button
                        type="button"
                        className={`vm-tab ${viewMode === "flow" ? "active" : ""}`}
                        onClick={() => setViewMode("flow")}
                    >
                        🗺️ Flow Diagram
                    </button>
                    <button
                        type="button"
                        className={`vm-tab ${viewMode === "tree" ? "active" : ""}`}
                        onClick={() => setViewMode("tree")}
                    >
                        🌲 Learning Tree
                    </button>
                    <button
                        type="button"
                        className={`vm-tab ${viewMode === "timeline" ? "active" : ""}`}
                        onClick={() => setViewMode("timeline")}
                    >
                        ⏱️ Timeline
                    </button>
                </div>
            </div>

            {/* 1. FLOW DIAGRAM VIEW */}
            {viewMode === "flow" && (
                <div className="flow-diagram-container">
                    {activeTrack.stages.map((stage, idx) => {
                        const isMastered = masteredStages.includes(stage.id);
                        return (
                            <div key={stage.id} className="flow-node-wrapper">
                                <div
                                    className={`flow-node-card ${isMastered ? "mastered" : ""}`}
                                    onClick={() => setSelectedDrawerStage(stage)}
                                >
                                    <div className="node-left-group">
                                        <div className="stage-num-badge">
                                            {isMastered ? <FaCheck /> : stage.stageNumber}
                                        </div>
                                        <div className="node-details">
                                            <h3>
                                                {stage.title}
                                                {isMastered && <span className="mastered-tag">✓ Mastered</span>}
                                            </h3>
                                            <p className="node-desc">{stage.desc}</p>
                                            <div className="skills-row">
                                                {stage.skills.map((skill) => (
                                                    <span key={skill} className="skill-chip">{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="node-right-group">
                                        <div className="stage-meta">
                                            <span className={`level-badge ${getLevelBadgeClass(stage.level)}`}>
                                                {stage.level}
                                            </span>
                                            <span className="duration-text"><FaClock /> {stage.duration}</span>
                                        </div>

                                        <button
                                            type="button"
                                            className={`toggle-mastery-btn ${isMastered ? "done" : ""}`}
                                            onClick={(e) => toggleStageMastery(stage.id, e)}
                                            title={isMastered ? "Mark as In Progress" : "Mark Stage as Mastered"}
                                        >
                                            {isMastered ? <FaCheckCircle /> : <FaCheck />}
                                            {isMastered ? "Mastered" : "Mark Done"}
                                        </button>

                                        <button
                                            type="button"
                                            className="view-guide-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedDrawerStage(stage);
                                            }}
                                        >
                                            Guide <FaChevronRight />
                                        </button>
                                    </div>
                                </div>

                                {idx < activeTrack.stages.length - 1 && (
                                    <div className="flow-connector"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 2. LEARNING TREE VIEW */}
            {viewMode === "tree" && (
                <div className="tree-container">
                    {activeTrack.stages.map((stage) => (
                        <div key={stage.id} className="tree-card">
                            <div className="tree-header">
                                <h4>Stage {stage.stageNumber}: {stage.title}</h4>
                                <span className={`level-badge ${getLevelBadgeClass(stage.level)}`}>{stage.level}</span>
                            </div>
                            <p className="node-desc">{stage.desc}</p>
                            <div className="concepts-checklist">
                                {stage.concepts.map((concept, cIdx) => (
                                    <div key={cIdx} className="concept-item">
                                        <FaCheckCircle className="icon-green" />
                                        <span>{concept}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 3. TIMELINE VIEW */}
            {viewMode === "timeline" && (
                <div className="timeline-container">
                    {activeTrack.stages.map((stage) => (
                        <div key={stage.id} className="timeline-item">
                            <div className="timeline-dot"></div>
                            <h4>Phase {stage.stageNumber}: {stage.title}</h4>
                            <p className="duration-text"><FaClock /> Estimated Time: {stage.duration}</p>
                            <p className="node-desc">{stage.desc}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* SLIDE-OVER DETAIL DRAWER / MODAL */}
            {selectedDrawerStage && (
                <div className="cp-drawer-overlay" onClick={() => setSelectedDrawerStage(null)}>
                    <div className="cp-drawer-card" onClick={(e) => e.stopPropagation()}>
                        <div className="drawer-header">
                            <div className="drawer-title-group">
                                <h2>Stage {selectedDrawerStage.stageNumber}: {selectedDrawerStage.title}</h2>
                                <p>{selectedDrawerStage.level} • {selectedDrawerStage.duration}</p>
                            </div>
                            <button
                                type="button"
                                className="close-drawer-btn"
                                onClick={() => setSelectedDrawerStage(null)}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="drawer-body">
                            <p className="node-desc">{selectedDrawerStage.desc}</p>

                            {/* Concepts */}
                            <div className="drawer-section">
                                <h4><FaLightbulb /> Key Concepts to Master</h4>
                                <div className="concepts-checklist">
                                    {selectedDrawerStage.concepts.map((concept, i) => (
                                        <div key={i} className="concept-item">
                                            <FaCheckCircle className="icon-green" />
                                            <span>{concept}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recommended Learning Resources */}
                            <div className="drawer-section">
                                <h4><FaBookOpen /> Free Learning Resources</h4>
                                {selectedDrawerStage.resources.map((res, rIdx) => (
                                    <a
                                        key={rIdx}
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="resource-link-card"
                                    >
                                        <span>{res.title}</span>
                                        <FaExternalLinkAlt />
                                    </a>
                                ))}
                            </div>

                            {/* Interview Prep Questions */}
                            {selectedDrawerStage.interviewQuestions && (
                                <div className="drawer-section">
                                    <h4><FaQuestionCircle /> Key Interview Questions</h4>
                                    {selectedDrawerStage.interviewQuestions.map((q, qIdx) => (
                                        <div key={qIdx} className="q-card">
                                            💡 <strong>Q:</strong> {q}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CareerPath;
