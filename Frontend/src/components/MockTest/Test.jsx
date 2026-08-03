import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitTest as submitTestApi } from "./MockTestApi";
const Test = () => {

    /* =====================================================
       STAGES
    ===================================================== */

    const navigate = useNavigate();
    
    const [stage, setStage] = useState("loading");
    // loading
    // instructions
    // exam

    /* =====================================================
       SUBMISSION
    ===================================================== */

    const [showSubmitModal, setShowSubmitModal] = useState(false);

    const [showAutoSubmitModal, setShowAutoSubmitModal] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [testSubmitted, setTestSubmitted] = useState(false);


    //Questions

   const [questions, setQuestions] = useState([]);
   const difficulty =
    sessionStorage.getItem("mockTestDifficulty") || "";

const mode =
    sessionStorage.getItem("mockTestMode") || "";

const language =
    sessionStorage.getItem("mockTestLanguage") || "";

const topic =
    sessionStorage.getItem("mockTestTopic") || "";

const totalQuestions =
    Number(sessionStorage.getItem("mockTestQuestionCount")) || 0;

const duration =
    Number(sessionStorage.getItem("mockTestDuration")) || 30;

useEffect(() => {

    const savedQuestions = sessionStorage.getItem("mockTestQuestions");

    if (!savedQuestions) {

        alert("No test found.");

        navigate("/mocktest");

        return;
    }

    setQuestions(JSON.parse(savedQuestions));

}, [navigate]);


    /* =====================================================
       EXAM STATE
    ===================================================== */

    const [currentQuestion, setCurrentQuestion] = useState(0);

    const [selectedAnswers, setSelectedAnswers] = useState({});

    const [timeLeft, setTimeLeft] = useState(() => {

    const duration =
        Number(sessionStorage.getItem("mockTestDuration")) || 30;

    return duration * 60;

});

    /* =====================================================
       HELPERS
    ===================================================== */

    const unansweredQuestions =
        questions.length - Object.keys(selectedAnswers).length;

    const formatTime = (seconds) => {

        const mins = Math.floor(seconds / 60);

        const secs = seconds % 60;

        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;

    };

    const handleAnswerSelect = (option) => {

        setSelectedAnswers(prev => ({

            ...prev,

            [currentQuestion]: option

        }));

    };

        /* =====================================================
       LOADING SCREEN
    ===================================================== */

    useEffect(() => {

        if (stage !== "loading") return;

        const timer = setTimeout(() => {

            setStage("instructions");

        }, 2500);

        return () => clearTimeout(timer);

    }, [stage]);

    /* =====================================================
       EXAM TIMER
    ===================================================== */

    useEffect(() => {

        if (stage !== "exam" || testSubmitted) return;

        const interval = setInterval(() => {

            setTimeLeft(prev => {

                if (prev <= 1) {

                    clearInterval(interval);

                    setShowAutoSubmitModal(true);

                    return 0;

                }

                return prev - 1;

            });

        }, 1000);

        return () => clearInterval(interval);

    }, [stage, testSubmitted]);

    /* =====================================================
       AUTO SUBMIT
    ===================================================== */

    useEffect(() => {

        if (!showAutoSubmitModal) return;

        const timer = setTimeout(() => {

            submitTest();

        }, 2500);

        return () => clearTimeout(timer);

    }, [showAutoSubmitModal]);

    /* =====================================================
       SUBMIT TEST
    ===================================================== */

    const submitTest = async () => {

    if (testSubmitted) return;

    setTestSubmitted(true);

    setShowSubmitModal(false);

    setShowAutoSubmitModal(false);

    setIsSubmitting(true);

    try {

        const sessionId =
            sessionStorage.getItem("mockTestSession");

        const answers = {};

        Object.keys(selectedAnswers).forEach(index => {

            answers[questions[index].id] =
                selectedAnswers[index];

        });
        sessionStorage.setItem(
    "mockTestUserAnswers",
    JSON.stringify(answers)
);
// Save user's selected answers
sessionStorage.setItem(
    "mockTestUserAnswers",
    JSON.stringify(answers)
);

// Call backend
const result = await submitTestApi(sessionId, answers);

// Save backend result
sessionStorage.setItem(
    "mockTestResult",
    JSON.stringify(result)
);

// Navigate to Result page
navigate("/mocktest/result");

    }
    catch (error) {

        alert(error.message);

        setTestSubmitted(false);

    }
    finally {

        setIsSubmitting(false);

    }

};
    /* =====================================================
       LOADING PAGE
    ===================================================== */

    if (stage === "loading") {

        return (

            <div className="test-page">

                <div className="test-container">

                    <div className="instructions-card">

                        <div className="loading-icon">

                            🤖

                        </div>

                        <h1>

                            Preparing Your AI Assessment

                        </h1>

                        <p>

                            Please wait while we generate your personalized
                            mock test.

                        </p>

                        <ul className="instructions-list">

                            <li>✅ Selecting Topics...</li>

                            <li>✅ Configuring Difficulty...</li>

                            <li>⏳ Generating Questions...</li>

                            <li>⏳ Finalizing Assessment...</li>

                        </ul>

                    </div>

                </div>

            </div>

        );

    }

    /* =====================================================
       INSTRUCTIONS PAGE
    ===================================================== */

    if (stage === "instructions") {

        return (

            <div className="test-page">

                <div className="test-container">

                    <div className="instructions-card">

                        <h1>

                            Mock Test Instructions

                        </h1>

                        <p>

                            Read all instructions carefully before starting
                            your assessment.

                        </p>

                       <div className="test-info-grid">

    <div className="test-info-box">
        <h3>{totalQuestions}</h3>
        <span>Questions</span>
    </div>

    <div className="test-info-box">
        <h3>{duration}</h3>
        <span>Minutes</span>
    </div>

    <div className="test-info-box">
        <h3>{difficulty}</h3>
        <span>Difficulty</span>
    </div>

    <div className="test-info-box">
        <h3>{mode}</h3>
        <span>Question Type</span>
    </div>

    <div className="test-info-box">
        <h3>{language}</h3>
        <span>Language</span>
    </div>

    <div className="test-info-box">
        <h3>{topic}</h3>
        <span>Topic</span>
    </div>

</div>

                        <ul className="instructions-list">

                            <li>Timer starts after clicking Start Test.</li>

                            <li>You can freely navigate between questions.</li>

                            <li>The test auto-submits when time expires.</li>

                            <li>Do not refresh the page during the assessment.</li>

                            <li>Each question carries equal marks.</li>

                        </ul>

                        <button
                            className="start-test-btn-large"
                            onClick={() => setStage("exam")}
                        >

                            Start Test

                        </button>

                    </div>

                </div>

            </div>

        );

    }

    /* =====================================================
       EXAM PAGE
    ===================================================== */
if (questions.length === 0) {

    return null;

}
    const answeredQuestions = Object.keys(selectedAnswers).length;

return (

    <div className="test-page">

        <div className="exam-layout">

            {/* ==========================================
                LEFT PANEL
            ========================================== */}

            <div className="exam-main">

                <div className="exam-header">

                    <div>

                       <h2>

{topic} Assessment

</h2>

                        <span className="question-progress">

                            Answered {answeredQuestions} / {questions.length}

                        </span>

                    </div>

                    <div
                        className={`exam-timer
                        ${
                            timeLeft <= 300
                                ? "danger"
                                : timeLeft <= 600
                                ? "warning"
                                : ""
                        }`}
                    >

                        ⏱ {formatTime(timeLeft)}

                    </div>

                </div>

                {/* Question Card */}

                <div className="question-card">

                    <h3>

                        Question {currentQuestion + 1} of {questions.length}

                    </h3>

                    <h2 className="question-title">

                        {questions[currentQuestion].questionText}

                    </h2>

                    <div className="options-list">

                        {questions[currentQuestion].options.map((option, index) => (

                            <label
                                key={index}
                                className={`option-item ${
                                    selectedAnswers[currentQuestion] === option
                                        ? "selected"
                                        : ""
                                }`}
                            >

                                <input

                                    type="radio"

                                    name={`question-${currentQuestion}`}

                                    checked={
                                        selectedAnswers[currentQuestion] === option
                                    }

                                    onChange={() =>
                                        handleAnswerSelect(option)
                                    }

                                />

                                {option}

                            </label>

                        ))}

                    </div>

                </div>

                {/* Navigation */}

               <div className="navigation-buttons">

    <div className="nav-left">

        {currentQuestion > 0 && (

            <button
                onClick={() =>
                    setCurrentQuestion(prev =>
                        Math.max(prev - 1, 0)
                    )
                }
            >
                ← Previous
            </button>

        )}

    </div>

    <div className="nav-right">

    {currentQuestion < questions.length - 1 ? (

        <button
            onClick={() =>
                setCurrentQuestion(prev =>
                    Math.min(prev + 1, questions.length - 1)
                )
            }
        >
            Next →
        </button>

    ) : (

        <button
            className="finish-test-btn"
            onClick={() => setShowSubmitModal(true)}
        >
            Finish Test
        </button>

    )}

</div>


</div>
            </div>

            {/* ==========================================
                RIGHT SIDEBAR
            ========================================== */}

            <div className="exam-sidebar">

                <h3>Question Palette</h3>

                <p className="palette-text">

                    Click any question number to navigate instantly.

                </p>

                <div className="palette-grid">

                    {questions.map((question, index) => (

                        <button

    key={question.id}

    className={`palette-btn

    ${currentQuestion === index ? "active" : ""}

    ${selectedAnswers[index] ? "answered" : ""}

    `}

    onClick={() => setCurrentQuestion(index)}

>

    {index + 1}

</button>

                    ))}

                </div>

                <div className="palette-summary">

                    <p>

                        Answered :
                        <strong> {answeredQuestions}</strong>

                    </p>

                    <p>

                        Remaining :
                        <strong> {unansweredQuestions}</strong>

                    </p>

                </div>

                <button

                    className="submit-test-btn"

                    onClick={() => setShowSubmitModal(true)}

                >

                    Submit Test

                </button>

            </div>

        </div>

                {/* ==========================================
            MANUAL SUBMIT CONFIRMATION
        ========================================== */}

        {showSubmitModal && (

            <div className="modal-overlay">

                <div className="submit-modal">

                    <div className="modal-icon">
                        📝
                    </div>

                    <h2>Submit Mock Test?</h2>

                    <p>

                        You have

                        <strong> {unansweredQuestions} </strong>

                        unanswered question(s).

                    </p>

                    <p>

                        Once submitted, you cannot modify your answers.

                    </p>

                    <div className="modal-buttons">

                        <button
                            className="cancel-btn"
                            onClick={() => setShowSubmitModal(false)}
                        >

                            Review Questions

                        </button>

                        <button
                            className="confirm-submit-btn"
                            onClick={submitTest}
                        >

                            Submit Test

                        </button>

                    </div>

                </div>

            </div>

        )}

        {/* ==========================================
            AUTO SUBMIT
        ========================================== */}

        {showAutoSubmitModal && (

            <div className="modal-overlay">

                <div className="submit-modal auto-submit-box">

                    <div className="auto-submit-icon">

                        ⏰

                    </div>

                    <h2>Time's Up!</h2>

                    <p>

                        Your assessment time has ended.

                    </p>

                    <p>

                        Your responses are being submitted automatically.

                    </p>

                    <div className="loading-dots">

                        <span></span>

                        <span></span>

                        <span></span>

                    </div>

                </div>

            </div>

        )}

        {/* ==========================================
            SUBMITTING
        ========================================== */}

        {isSubmitting && (

            <div className="modal-overlay">

                <div className="submit-modal">

                    <div className="submit-loader">

                        ⏳

                    </div>

                    <h2>

                        Submitting Your Test...

                    </h2>

                    <p>

                        Please wait while we evaluate your responses.

                    </p>

                </div>

            </div>

        )}

    </div>

);

};

export default Test;