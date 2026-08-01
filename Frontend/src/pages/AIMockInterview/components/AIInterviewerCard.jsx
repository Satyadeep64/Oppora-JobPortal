import { useState } from "react";
import {
    FaVolumeUp, FaVolumeMute, FaLightbulb, FaRobot,
    FaSyncAlt, FaCommentDots, FaFont
} from "react-icons/fa";

const AIInterviewerCard = ({
    question,
    questionNumber,
    totalQuestions,
    agentState, // 'idle' | 'speaking' | 'listening' | 'evaluating'
    speechMode,
    isMuted,
    onToggleMute,
    onReplaySpeech,
    onGetHint,
    voiceSpeed,
    onChangeVoiceSpeed,
    hintText
}) => {
    const [showHintModal, setShowHintModal] = useState(false);
    const [fontSize, setFontSize] = useState("normal"); // normal | large

    const getStatusText = () => {
        switch (agentState) {
            case "speaking":
                return "AI Agent is Speaking...";
            case "listening":
                return "Listening to Candidate...";
            case "evaluating":
                return "Analyzing Response...";
            default:
                return "Ready";
        }
    };

    const getStatusBadgeClass = () => {
        switch (agentState) {
            case "speaking": return "badge-speaking";
            case "listening": return "badge-listening";
            case "evaluating": return "badge-evaluating";
            default: return "badge-idle";
        }
    };

    return (
        <div className="ai-interviewer-card">
            {/* Top Bar with Agent Avatar & Live Status */}
            <div className="agent-topbar">
                <div className="agent-profile">
                    <div className={`agent-avatar-ring ${agentState === "speaking" ? "pulsing-ring" : ""}`}>
                        <div className="agent-avatar-icon">
                            <FaRobot />
                        </div>
                    </div>
                    <div className="agent-meta">
                        <h3>Oppora AI Recruiter Agent</h3>
                        <span className={`status-badge ${getStatusBadgeClass()}`}>
                            <span className="status-dot"></span>
                            {getStatusText()}
                        </span>
                    </div>
                </div>

                <div className="agent-controls">
                    {/* Replay Question Voice */}
                    <button
                        type="button"
                        className="agent-icon-btn"
                        onClick={onReplaySpeech}
                        title="Replay Audio Question"
                    >
                        <FaVolumeUp /> Replay Audio
                    </button>

                    {/* Mute/Unmute Agent Voice */}
                    <button
                        type="button"
                        className={`agent-icon-btn ${isMuted ? "muted" : ""}`}
                        onClick={onToggleMute}
                        title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
                    >
                        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                        {isMuted ? "Muted" : "Mute"}
                    </button>

                    {/* Speed Selector */}
                    <div className="speed-pill-group">
                        {[0.8, 1.0, 1.25, 1.5].map((speed) => (
                            <button
                                key={speed}
                                type="button"
                                className={`speed-pill ${voiceSpeed === speed ? "active" : ""}`}
                                onClick={() => onChangeVoiceSpeed(speed)}
                            >
                                {speed}x
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Live Audio Waveform Equalizer */}
            <div className={`waveform-container ${agentState === "speaking" ? "active-speaking" : agentState === "listening" ? "active-listening" : ""}`}>
                <div className="wave-bar bar-1"></div>
                <div className="wave-bar bar-2"></div>
                <div className="wave-bar bar-3"></div>
                <div className="wave-bar bar-4"></div>
                <div className="wave-bar bar-5"></div>
                <div className="wave-bar bar-6"></div>
                <div className="wave-bar bar-7"></div>
                <div className="wave-bar bar-8"></div>
                <span className="wave-label">
                    {agentState === "speaking" ? "AI Voice Synthesizer Streaming..." : agentState === "listening" ? "Mic Listening active..." : "Audio Standby"}
                </span>
            </div>

            {/* Question Text Box / Speech Captions Stream */}
            <div className={`question-box ${fontSize === "large" ? "large-text" : ""}`}>
                <div className="question-header">
                    <span className="q-badge">Question {questionNumber} of {totalQuestions}</span>
                    <div className="q-actions">
                        <button
                            type="button"
                            className="text-size-btn"
                            onClick={() => setFontSize(fontSize === "normal" ? "large" : "normal")}
                            title="Toggle Text Size"
                        >
                            <FaFont />
                        </button>
                    </div>
                </div>

                <div className="question-text">
                    {question ? question.text : "Loading question..."}
                </div>

                {/* Speech to text captions badge */}
                {speechMode === "speech-to-text" && (
                    <div className="speech-caption-notice">
                        <FaCommentDots /> <strong>Speech-to-Text Mode Active:</strong> Text caption rendered. Read or listen to question above.
                    </div>
                )}
            </div>

            {/* Hint & Assistance Row */}
            <div className="agent-bottom-bar">
                <button
                    type="button"
                    className="hint-btn"
                    onClick={() => {
                        onGetHint();
                        setShowHintModal(true);
                    }}
                >
                    <FaLightbulb /> Request AI Hint / Key Concepts
                </button>
            </div>

            {/* Hint Overlay */}
            {showHintModal && hintText && (
                <div className="hint-card-popup">
                    <div className="hint-card-header">
                        <span><FaLightbulb /> AI Interview Hint</span>
                        <button type="button" className="close-hint" onClick={() => setShowHintModal(false)}>✕</button>
                    </div>
                    <div className="hint-card-body">
                        {hintText}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIInterviewerCard;
