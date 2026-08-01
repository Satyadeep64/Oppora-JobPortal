import { useState, useEffect, useRef, useCallback } from "react";
import InterviewSetupModal from "./components/InterviewSetupModal";
import AIInterviewerCard from "./components/AIInterviewerCard";
import SpeechController from "./components/SpeechController";
import InterviewScorecard from "./components/InterviewScorecard";
import { FaSlidersH, FaRobot, FaBrain } from "react-icons/fa";
import "./AIMockInterview.css";

// Comprehensive AI Question Repository mapped by Role & Tech Stack
const QUESTION_REPOSITORY = {
    fullstack: [
        {
            text: "Explain how React handles state updates under the hood and how Virtual DOM diffing optimizes DOM manipulations in modern web applications.",
            hint: "Mention Reconciliation algorithm, Fibers, batching state updates, and key props in list rendering.",
            keywords: ["virtual dom", "reconciliation", "batching", "fiber", "diffing", "render"],
            idealAnswer: "React uses a Virtual DOM memory representation. When state changes, it creates a new Virtual DOM tree and performs diffing (Reconciliation) to compute minimal real DOM updates efficiently."
        },
        {
            text: "How do you design a scalable RESTful API in ASP.NET Core with proper layer separation, dependency injection, and error handling?",
            hint: "Discuss Controller-Service-Repository pattern, Middleware for global exceptions, and DTOs.",
            keywords: ["dependency injection", "middleware", "dto", "repository", "controller", "async"],
            idealAnswer: "Separate into Controller, Service, and Data layers using ASP.NET Core Dependency Injection. Use global middleware for exception handling and return standard HTTP status codes with DTOs."
        },
        {
            text: "Compare SQL relational indexing strategies with NoSQL document stores. When would you choose PostgreSQL over MongoDB?",
            hint: "Talk about ACID compliance, schema enforcement, join complexity vs horizontal scaling.",
            keywords: ["acid", "indexing", "b-tree", "joins", "relational", "transactions", "nosql"],
            idealAnswer: "Choose PostgreSQL for structured relational data requiring ACID compliance, complex JOINs, and transactions. Use MongoDB for flexible dynamic schemas and rapid horizontal read scaling."
        },
        {
            text: "Explain CORS, JWT authentication, and how token refresh mechanisms work securely between React frontend and a backend API.",
            hint: "Discuss HttpOnly cookies, Bearer tokens, token expiration, and security against XSS/CSRF.",
            keywords: ["jwt", "cors", "httponly", "bearer", "refresh token", "xss", "csrf"],
            idealAnswer: "JWTs store claims signed by a server. Short-lived access tokens should be passed in headers, while long-lived refresh tokens are stored securely in HttpOnly, SameSite cookies to protect against XSS."
        },
        {
            text: "Walk me through how you optimize web application performance on both frontend asset loading and backend database queries.",
            hint: "Cover code-splitting, lazy loading, indexing, caching with Redis, and memoization.",
            keywords: ["lazy loading", "code splitting", "indexing", "redis", "caching", "memoization"],
            idealAnswer: "Frontend: Lazy load routes, code split components, and optimize image formats. Backend: Add database indexes, eliminate N+1 queries, and implement Redis caching for frequent queries."
        }
    ],
    frontend: [
        {
            text: "What are the key differences between useEffect, useLayoutEffect, and custom hooks in React 19?",
            hint: "Touch on paint timing, synchronous execution, and hook reusability.",
            keywords: ["useeffect", "uselayout-effect", "paint", "custom hook", "dom", "async"],
            idealAnswer: "useEffect runs asynchronously after browser layout and paint. useLayoutEffect runs synchronously before browser paint to measure or mutate DOM layout preventing visual flickers."
        },
        {
            text: "Explain CSS Grid vs Flexbox, container queries, and your approach to building responsive modern UI layouts.",
            hint: "Flexbox is 1D (rows or columns), Grid is 2D. Container queries adapt based on parent container size.",
            keywords: ["flexbox", "grid", "container queries", "responsive", "media queries", "css"],
            idealAnswer: "Flexbox handles one-dimensional content alignment (row/column). CSS Grid manages two-dimensional layouts (rows and columns simultaneously). Container queries style components based on parent container size."
        },
        {
            text: "How do you manage global state in large React applications? Compare Context API, Redux Toolkit, and Zustand.",
            hint: "Discuss re-renders, boilerplate, store structure, and selectors.",
            keywords: ["context api", "redux", "zustand", "re-renders", "state", "selectors"],
            idealAnswer: "React Context is ideal for low-frequency global state (themes, user auth). For complex data trees, Zustand or Redux Toolkit prevent unnecessary component re-renders with selective state subscriptions."
        }
    ],
    backend: [
        {
            text: "Explain asynchronous programming in C# using async and await, Task, and how to prevent async deadlocks.",
            hint: "Mention SynchronizationContext, Task.ConfigureAwait(false), and thread pool execution.",
            keywords: ["async", "await", "task", "thread pool", "configureawait", "deadlock"],
            idealAnswer: "async/await returns control to the calling thread while awaiting asynchronous I/O. Use ConfigureAwait(false) in library code to prevent capturing SynchronizationContext and avoiding deadlocks."
        },
        {
            text: "How does Entity Framework Core handle change tracking, lazy loading vs eager loading (Include), and compiled queries?",
            hint: "Explain DbContext state tracking, AsNoTracking for read-only queries, and N+1 query problem.",
            keywords: ["entity framework", "eager loading", "include", "asnotracking", "lazy loading", "dbcontext"],
            idealAnswer: "EF Core tracks entity modifications. Use Eager Loading (.Include) to avoid the N+1 problem. Use AsNoTracking() for read-only queries to improve performance and bypass change tracker overhead."
        }
    ],
    behavioral: [
        {
            text: "Describe a challenging situation where you had a technical disagreement with a team member. How did you resolve it?",
            hint: "Use the STAR method: Situation, Task, Action, Result. Focus on objective data and collaboration.",
            keywords: ["star", "conflict", "data", "collaboration", "resolution", "tradeoffs"],
            idealAnswer: "I presented performance benchmarks and code metrics to objectively compare both technical approaches, leading to a collaborative decision focused on overall project goals."
        },
        {
            text: "Tell me about a project where you had to deliver under tight deadlines. How did you manage priorities?",
            hint: "Highlight MVP prioritization, risk mitigation, and clear communication with stakeholders.",
            keywords: ["deadline", "prioritization", "mvp", "communication", "risk"],
            idealAnswer: "I broke the deliverable into core requirements (MVP) and optional enhancements, communicated risks early to stakeholders, and delivered key functionality on time."
        }
    ]
};

const AIMockInterview = () => {
    const [setupConfig, setSetupConfig] = useState(null);
    const [showSetupModal, setShowSetupModal] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [agentState, setAgentState] = useState("idle"); // 'idle' | 'speaking' | 'listening' | 'evaluating'
    const [isMuted, setIsMuted] = useState(false);
    const [voiceSpeed, setVoiceSpeed] = useState(1.0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [evaluationResults, setEvaluationResults] = useState(null);
    const [hintText, setHintText] = useState("");

    const synthRef = useRef(window.speechSynthesis);

    // Initialize interview questions based on config
    const handleStartInterview = (config) => {
        setSetupConfig(config);
        setShowSetupModal(false);
        setVoiceSpeed(config.voiceSpeed);

        const pool = QUESTION_REPOSITORY[config.roleId] || QUESTION_REPOSITORY.fullstack;
        const selected = pool.slice(0, config.questionCount);
        setQuestions(selected);
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setEvaluationResults(null);

        // Speak first question after short delay
        setTimeout(() => {
            if (selected.length > 0) {
                speakQuestion(selected[0].text, config.voiceSpeed, config.voiceGender);
            }
        }, 500);
    };

    // Speech Synthesis function
    const speakQuestion = useCallback((text, speed = 1.0, gender = "Female") => {
        if (!synthRef.current || isMuted) return;

        synthRef.current.cancel(); // stop previous audio

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speed;
        utterance.pitch = gender === "Female" ? 1.1 : 0.9;

        // Try selecting preferred voice
        const voices = synthRef.current.getVoices();
        const preferredVoice = voices.find(v =>
            gender === "Female" ? v.name.includes("Female") || v.name.includes("Zira") || v.name.includes("Google US English")
                : v.name.includes("Male") || v.name.includes("David")
        );
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
            setAgentState("speaking");
        };

        utterance.onend = () => {
            setAgentState("listening");
        };

        utterance.onerror = () => {
            setAgentState("idle");
        };

        synthRef.current.speak(utterance);
    }, [isMuted]);

    // Handle Replay audio
    const handleReplaySpeech = () => {
        if (questions[currentQuestionIndex]) {
            speakQuestion(
                questions[currentQuestionIndex].text,
                voiceSpeed,
                setupConfig ? setupConfig.voiceGender : "Female"
            );
        }
    };

    const handleToggleMute = () => {
        if (!isMuted && synthRef.current) {
            synthRef.current.cancel();
            setAgentState("idle");
        }
        setIsMuted(!isMuted);
    };

    const handleChangeVoiceSpeed = (newSpeed) => {
        setVoiceSpeed(newSpeed);
    };

    const handleGetHint = () => {
        const q = questions[currentQuestionIndex];
        if (q && q.hint) {
            setHintText(q.hint);
        }
    };

    // Handle Answer Submission & Evaluation
    const handleAnswerSubmit = (transcript) => {
        setAgentState("evaluating");
        if (synthRef.current) synthRef.current.cancel();

        const currentQ = questions[currentQuestionIndex];

        // Evaluate answer
        const lowerAnswer = transcript.toLowerCase();
        let keywordMatches = 0;
        if (currentQ && currentQ.keywords) {
            currentQ.keywords.forEach(kw => {
                if (lowerAnswer.includes(kw)) keywordMatches++;
            });
        }

        const keywordScore = currentQ.keywords ? Math.min(100, Math.round((keywordMatches / currentQ.keywords.length) * 100)) : 80;
        const lengthScore = transcript.length > 80 ? 90 : transcript.length > 30 ? 70 : 40;
        const qScore = Math.round((keywordScore * 0.6) + (lengthScore * 0.4));

        const feedbackMsg = qScore >= 80
            ? "Excellent response! Covered key terminology and concepts thoroughly."
            : qScore >= 60
            ? "Good response. Consider including more technical depth and specific examples."
            : "Brief answer. Expand on technical architecture and foundational principles.";

        const answerRecord = {
            question: currentQ.text,
            userAnswer: transcript,
            score: qScore,
            feedback: feedbackMsg,
            idealAnswer: currentQ.idealAnswer
        };

        const updatedAnswers = [...userAnswers, answerRecord];
        setUserAnswers(updatedAnswers);

        // Move to next question or complete interview
        if (currentQuestionIndex + 1 < questions.length) {
            const nextIdx = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIdx);
            setHintText("");

            setTimeout(() => {
                speakQuestion(
                    questions[nextIdx].text,
                    voiceSpeed,
                    setupConfig ? setupConfig.voiceGender : "Female"
                );
            }, 600);
        } else {
            // Generate final scorecard results
            finishInterview(updatedAnswers);
        }
    };

    const handleSkipQuestion = () => {
        handleAnswerSubmit("Skipped by candidate.");
    };

    const finishInterview = (allAnswers) => {
        setAgentState("idle");
        if (synthRef.current) synthRef.current.cancel();

        const total = allAnswers.reduce((sum, item) => sum + item.score, 0);
        const avgScore = Math.round(total / allAnswers.length) || 75;

        setEvaluationResults({
            overallScore: avgScore,
            metrics: {
                technical: Math.min(100, avgScore + 3),
                communication: Math.min(100, avgScore - 2),
                problemSolving: Math.min(100, avgScore + 1),
                confidence: Math.min(100, avgScore + 4)
            },
            strengths: [
                "Strong conceptual grasp of selected technical stack",
                "Clear communication and structured response delivery",
                "Good technical vocabulary and problem decomposition"
            ],
            improvements: [
                "Provide deeper architectural details and edge cases in answers",
                "Elaborate on real-world production tradeoffs and database optimizations"
            ],
            questionResults: allAnswers
        });
    };

    const handleRestart = () => {
        setShowSetupModal(true);
    };

    return (
        <div className="ai-mock-interview-page">
            {/* Top Page Header */}
            <div className="interview-page-header">
                <div className="header-title-group">
                    <h1><FaRobot /> AI Mock Interviewer Workspace</h1>
                    <p>Real-Time Speech-to-Speech & Speech-to-Text AI Voice Recruiter Engine</p>
                </div>

                {setupConfig && !evaluationResults && (
                    <div className="header-meta-pills">
                        <span className="meta-pill">{setupConfig.role}</span>
                        <span className="meta-pill">{setupConfig.speechMode === "speech-to-speech" ? "🎙️ Speech-to-Speech" : "💬 Speech-to-Text"}</span>
                        <button type="button" className="reconfig-btn" onClick={handleRestart}>
                            <FaSlidersH /> Change Setup
                        </button>
                    </div>
                )}
            </div>

            {/* Setup Modal Overlay */}
            {showSetupModal && (
                <InterviewSetupModal onStartInterview={handleStartInterview} />
            )}

            {/* Main Interactive Session */}
            {!showSetupModal && !evaluationResults && (
                <div className="interview-session-container">
                    <AIInterviewerCard
                        question={questions[currentQuestionIndex]}
                        questionNumber={currentQuestionIndex + 1}
                        totalQuestions={questions.length}
                        agentState={agentState}
                        speechMode={setupConfig ? setupConfig.speechMode : "speech-to-speech"}
                        isMuted={isMuted}
                        onToggleMute={handleToggleMute}
                        onReplaySpeech={handleReplaySpeech}
                        onGetHint={handleGetHint}
                        voiceSpeed={voiceSpeed}
                        onChangeVoiceSpeed={handleChangeVoiceSpeed}
                        hintText={hintText}
                    />

                    <SpeechController
                        onAnswerSubmit={handleAnswerSubmit}
                        onSkipQuestion={handleSkipQuestion}
                        agentState={agentState}
                        speechMode={setupConfig ? setupConfig.speechMode : "speech-to-speech"}
                        currentQuestionIndex={currentQuestionIndex}
                        totalQuestions={questions.length}
                    />
                </div>
            )}

            {/* Post-Interview Evaluation Scorecard */}
            {evaluationResults && setupConfig && (
                <InterviewScorecard
                    evaluationResults={evaluationResults}
                    setupConfig={setupConfig}
                    onRestart={handleRestart}
                />
            )}
        </div>
    );
};

export default AIMockInterview;
