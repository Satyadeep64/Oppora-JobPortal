import { useState, useEffect, useRef } from "react";
import {
    FaMicrophone, FaMicrophoneSlash, FaPaperPlane, FaKeyboard,
    FaForward, FaTrash, FaClock, FaCheckCircle, FaExclamationTriangle
} from "react-icons/fa";

const SpeechController = ({
    onAnswerSubmit,
    onSkipQuestion,
    agentState,
    speechMode,
    currentQuestionIndex,
    totalQuestions
}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [textMode, setTextMode] = useState(false);
    const [timer, setTimer] = useState(120); // 2 minutes per question
    const [isPaused, setIsPaused] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(true);

    const recognitionRef = useRef(null);

    // Initialize Web Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setSpeechSupported(false);
            setTextMode(true);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
            let currentTranscript = "";
            for (let i = 0; i < event.results.length; i++) {
                currentTranscript += event.results[i][0].transcript;
            }
            setTranscript(currentTranscript);
        };

        recognition.onerror = (event) => {
            console.warn("Speech recognition error:", event.error);
            if (event.error === "not-allowed" || event.error === "service-not-allowed") {
                setIsListening(false);
            }
        };

        recognition.onend = () => {
            // If user didn't intentionally stop listening, we can let them restart manually
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch {
                    // Ignore stop error
                }
            }
        };
    }, []);

    // Reset state on question change
    useEffect(() => {
        setTranscript("");
        setTimer(120);
        setIsListening(false);
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch {
                // Ignore
            }
        }
    }, [currentQuestionIndex]);

    // Timer countdown
    useEffect(() => {
        if (isPaused || agentState === "speaking" || agentState === "evaluating") return;

        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isPaused, agentState]);

    const toggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (err) {
                console.error("Failed to start speech recognition", err);
            }
        }
    };

    const handleClearText = () => {
        setTranscript("");
    };

    const handleSubmit = () => {
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
        onAnswerSubmit(transcript || "No response provided.");
    };

    const formatTimer = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div className="speech-controller-card">
            <div className="speech-controller-header">
                <div className="timer-badge">
                    <FaClock />
                    <span>Time Remaining: <strong>{formatTimer(timer)}</strong></span>
                </div>

                <div className="input-mode-tabs">
                    <button
                        type="button"
                        className={`tab-btn ${!textMode ? "active" : ""}`}
                        onClick={() => setTextMode(false)}
                    >
                        <FaMicrophone /> Voice Response
                    </button>
                    <button
                        type="button"
                        className={`tab-btn ${textMode ? "active" : ""}`}
                        onClick={() => setTextMode(true)}
                    >
                        <FaKeyboard /> Text Input
                    </button>
                </div>
            </div>

            {!speechSupported && (
                <div className="browser-warning">
                    <FaExclamationTriangle /> Web Speech Recognition is not supported on this browser. Text input mode enabled automatically.
                </div>
            )}

            {/* Response Input Area */}
            <div className="response-box-wrapper">
                <textarea
                    className="response-textarea"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder={
                        isListening
                            ? "Listening to your voice... Speak your response clearly..."
                            : textMode
                            ? "Type your detailed answer here..."
                            : "Click 'Start Voice Recording' below to speak your answer, or type directly..."
                    }
                    rows={5}
                />

                <div className="textarea-footer">
                    <span className="char-count">
                        {transcript.trim().split(/\s+/).filter(Boolean).length} Words | {transcript.length} Characters
                    </span>
                    {transcript && (
                        <button type="button" className="clear-btn" onClick={handleClearText}>
                            <FaTrash /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Action Bar */}
            <div className="controller-actions">
                <div className="mic-controls">
                    {speechSupported && (
                        <button
                            type="button"
                            className={`mic-toggle-btn ${isListening ? "listening-pulse" : ""}`}
                            onClick={toggleListening}
                            disabled={agentState === "speaking"}
                        >
                            {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
                            <span>{isListening ? "Stop Recording" : "Start Voice Recording"}</span>
                        </button>
                    )}
                </div>

                <div className="submission-btns">
                    <button
                        type="button"
                        className="skip-btn"
                        onClick={onSkipQuestion}
                    >
                        <FaForward /> Skip Question
                    </button>

                    <button
                        type="button"
                        className="submit-answer-btn"
                        onClick={handleSubmit}
                        disabled={!transcript.trim()}
                    >
                        <FaPaperPlane /> Submit Answer ({currentQuestionIndex + 1}/{totalQuestions})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpeechController;
