import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Result = () => {

    const navigate = useNavigate();

    const [expandedQuestion, setExpandedQuestion] = useState(null);

    const [resultData, setResultData] = useState(null);

    const [reviewQuestionsData, setReviewQuestionsData] = useState([]);

    useEffect(() => {

        const result = JSON.parse(
            sessionStorage.getItem("mockTestResult")
        );

        if (!result) {

    navigate("/mocktest");

    return;

}

setResultData({

    testName:
        sessionStorage.getItem("mockTestTopic"),

    accuracy:
        result.percentage,

    performance:
        result.percentage >= 80
            ? "Excellent"
            : result.percentage >= 60
            ? "Good"
            : "Needs Improvement",

    totalQuestions:
        result.totalQuestions,

    correct:
        result.correctAnswers,

    wrong:
        result.wrongAnswers,

    skipped:
        result.unattempted,

    difficulty:
        sessionStorage.getItem("mockTestDifficulty"),

    language:
        sessionStorage.getItem("mockTestLanguage"),

    timeTaken:
        sessionStorage.getItem("mockTestDuration") + " min"

});

setReviewQuestionsData(result.review || []);

    }, [navigate]);

    const toggleExplanation = (id) => {

        if (expandedQuestion === id) {

            setExpandedQuestion(null);

        }

        else {

            setExpandedQuestion(id);

        }

    };

    if (!resultData) {

        return null;

    }

    /* =====================================================
       HERO SECTION
    ===================================================== */

    return (

        <div className="result-page">

            <div className="result-container">

                <div className="result-hero">

                    <h1>

                        Assessment Completed Successfully

                    </h1>

                    <p>

                        {resultData.testName}

                    </p>

                    <div
    className="score-circle"
    style={{
        "--progress": resultData.accuracy,
        "--color":
            resultData.accuracy >= 80
                ? "#22c55e"
                : resultData.accuracy >= 60
                ? "#f59e0b"
                : "#ef4444"
    }}
>

                        <div className="score-inner">

                            <h2>

                                {resultData.accuracy}%

                            </h2>

                            <span>

                                Score

                            </span>

                        </div>

                    </div>

                    <div className="performance-badge">

                        {resultData.performance}

                    </div>

                    <div className="result-buttons">

                        <button

                            className="retake-btn"

                            onClick={() => navigate("/mocktest")}

                        >

                            Retake Test

                        </button>

                        <button

                            className="home-btn"

                            onClick={() => navigate("/mocktest")}

                        >

                            Back to Mock Tests

                        </button>

                    </div>

                </div>

                                {/* =====================================================
                    PERFORMANCE SUMMARY
                ===================================================== */}

                <section className="summary-section">

                    <div className="section-heading">

                        <div className="heading-line"></div>

                        <div>

                            <h2>Performance Summary</h2>

                            <p>
                                A quick overview of your assessment performance.
                            </p>

                        </div>

                    </div>

                    <div className="summary-grid">

                        <div className="summary-card">

                            <h3>{resultData.totalQuestions}</h3>

                            <span>Total Questions</span>

                        </div>

                        <div className="summary-card correct">

                            <h3>{resultData.correct}</h3>

                            <span>Correct Answers</span>

                        </div>

                        <div className="summary-card wrong">

                            <h3>{resultData.wrong}</h3>

                            <span>Incorrect Answers</span>

                        </div>

                        <div className="summary-card skipped">

                            <h3>{resultData.skipped}</h3>

                            <span>Skipped</span>

                        </div>

                        <div className="summary-card">

                            <h3>{resultData.accuracy}%</h3>

                            <span>Accuracy</span>

                        </div>

                        <div className="summary-card">

                            <h3>{resultData.timeTaken}</h3>

                            <span>Time Taken</span>

                        </div>

                        <div className="summary-card">

                            <h3>{resultData.difficulty}</h3>

                            <span>Difficulty</span>

                        </div>

                        <div className="summary-card">

                            <h3>{resultData.language}</h3>

                            <span>Language</span>

                        </div>

                    </div>

                </section>

                {/* =====================================================
                    PERFORMANCE ANALYSIS
                ===================================================== */}

                <section className="analysis-section">

                    <div className="section-heading">

                        <div className="heading-line"></div>

                        <div>

                            <h2>Performance Analysis</h2>

                            <p>

                                Understand your overall assessment performance.

                            </p>

                        </div>

                    </div>

                    <div className="analysis-container">

                        <div className="analysis-item">

                            <div className="analysis-header">

                                <span>Accuracy</span>

                                <span>{resultData.accuracy}%</span>

                            </div>

                            <div className="analysis-bar">

                      <div
    className="analysis-fill"
    style={{
        width: `${resultData.accuracy}%`,
        "--bar-color":
            resultData.accuracy >= 80
                ? "#22c55e"
                : resultData.accuracy >= 60
                ? "#f59e0b"
                : "#ef4444"
    }}
></div>
                            </div>

                        </div>

                        <div className="analysis-item">

                            <div className="analysis-header">

                                <span>Completion</span>

                                <span>

                                    {Math.round(
                                        ((resultData.correct +
                                            resultData.wrong) /
                                            resultData.totalQuestions) *
                                            100
                                    )}
                                    %

                                </span>

                            </div>

                            <div className="analysis-bar">

    <div
        className="analysis-fill"
        style={{
            width: `${Math.round(
                ((resultData.correct +
                    resultData.wrong) /
                    resultData.totalQuestions) *
                    100
            )}%`,
            "--bar-color": "#2563eb"
        }}
    ></div>

                            </div>

                        </div>

                        <div className="analysis-item">

                            <div className="analysis-header">

                                <span>Time Utilization</span>

                                <span>100%</span>

                            </div>

                            <div className="analysis-bar">

                               <div
    className="analysis-fill"
    style={{
        width: "100%",
        "--bar-color": "#2563eb"
    }}
></div>

                            </div>

                        </div>

                        <div className="analysis-item">

                            <div className="analysis-header">

                                <span>Overall Performance</span>

                                <span>{resultData.performance}</span>

                            </div>

                            <div className="analysis-bar">

                              <div
    className="analysis-fill"
    style={{
        width: `${resultData.accuracy}%`,
        "--bar-color":
            resultData.accuracy >= 80
                ? "#22c55e"
                : resultData.accuracy >= 60
                ? "#f59e0b"
                : "#ef4444"
    }}
></div>

                            </div>

                        </div>

                    </div>

                </section>

                {/* =====================================================
                    ANSWER REVIEW
                ===================================================== */}

                <section className="review-section">

                    <div className="section-heading">

                        <div className="heading-line"></div>

                        <div>

                            <h2>Answer Review</h2>

                            <p>

                                Review every question along with the correct
                                answer and explanation.

                            </p>

                        </div>

                    </div>

                    <div className="review-list">

                        {reviewQuestionsData.map((question) => (

                            <div
                                key={question.id}
                                className={`review-card ${
                                    question.isCorrect
                                        ? "correct-card"
                                        : "wrong-card"
                                }`}
                            >

                                <div className="review-header">

                                    <div>

                                        <h3>

                                            Question {question.id}

                                        </h3>

                                        <p className="review-question">

                                            {question.question}

                                        </p>

                                    </div>

                                    <div
                                        className={`status-badge ${
                                            question.isCorrect
                                                ? "correct"
                                                : "wrong"
                                        }`}
                                    >

                                        {question.isCorrect
                                            ? "Correct"
                                            : "Incorrect"}

                                    </div>

                                </div>

                                <div className="answer-grid">

                                    <div className="answer-box your-answer">

                                        <h4>Your Answer</h4>

                                        <p>

                                            {question.yourAnswer}

                                        </p>

                                    </div>

                                    <div className="answer-box correct-answer">

                                        <h4>Correct Answer</h4>

                                        <p>

                                            {question.correctAnswer}

                                        </p>

                                    </div>

                                </div>

                                <button
                                    className="explanation-btn"
                                    onClick={() =>
                                        toggleExplanation(question.id)
                                    }
                                >

                                    {expandedQuestion === question.id
                                        ? "Hide Explanation ▲"
                                        : "Show Explanation ▼"}

                                </button>

                                {expandedQuestion === question.id && (

                                    <div className="explanation-box">

                                        <h4>

                                            Explanation

                                        </h4>

                                        <p>

                                            {question.explanation}

                                        </p>

                                    </div>

                                )}

                            </div>

                        ))}

                    </div>

                </section>

                                {/* =====================================================
                    AI PERFORMANCE REVIEW
                ===================================================== */}

                <section className="ai-feedback-section">

                    <div className="section-heading">

                        <div className="heading-line"></div>

                        <div>

                            <h2>AI Performance Review</h2>

                            <p>

                                Personalized insights generated from your assessment performance.

                            </p>

                        </div>

                    </div>

                    <div className="ai-feedback-grid">

                        <div className="feedback-card">

                            <h3>Strengths</h3>

                            <ul>

                                {resultData.accuracy >= 80 ? (
                                    <>
                                        <li>Excellent understanding of the selected topic.</li>
                                        <li>Strong accuracy in answering questions.</li>
                                        <li>Ready for higher difficulty mock tests.</li>
                                    </>
                                ) : resultData.accuracy >= 60 ? (
                                    <>
                                        <li>Good conceptual understanding.</li>
                                        <li>Can solve most interview questions.</li>
                                        <li>Minor improvements required.</li>
                                    </>
                                ) : (
                                    <>
                                        <li>Basic concepts are developing.</li>
                                        <li>Keep practicing consistently.</li>
                                        <li>Focus on fundamentals first.</li>
                                    </>
                                )}

                            </ul>

                        </div>

                        <div className="feedback-card">

                            <h3>Areas to Improve</h3>

                            <ul>

                                <li>Practice more questions on {resultData.testName}.</li>

                                <li>Revise incorrect concepts thoroughly.</li>

                                <li>Take another mock after revision.</li>

                            </ul>

                        </div>

                    </div>

                    <div className="recommendation-card">

                        <h3>AI Recommendation</h3>

                        <p>

                            Based on your score of <strong>{resultData.accuracy}%</strong>,
                            continue practicing <strong>{resultData.testName}</strong> questions.
                            Increase the difficulty level gradually and attempt another mock test
                            after revision.

                        </p>

                    </div>

                    <div className="readiness-section">

                        <h3>Placement Readiness</h3>

                        <div className="analysis-bar">

                            <div
                                className="analysis-fill"
                                style={{
                                    width: `${resultData.accuracy}%`
                                }}
                            ></div>

                        </div>

                        <span className="readiness-score">

                            {resultData.accuracy}% Ready

                        </span>

                    </div>

                </section>

                {/* =====================================================
                    RECOMMENDED MOCK TESTS
                ===================================================== */}

                <section className="recommended-section">

                    <div className="section-heading">

                        <div className="heading-line"></div>

                        <div>

                            <h2>Recommended Next Mock Tests</h2>

                            <p>

                                Continue improving with these recommended assessments.

                            </p>

                        </div>

                    </div>

                    <div className="recommended-grid">

                        <div className="recommended-card">

                            <h3>{resultData.testName}</h3>

                            <span>Easy Level</span>

                            <button onClick={() => navigate("/mocktest")}>

                                Generate Test

                            </button>

                        </div>

                        <div className="recommended-card">

                            <h3>{resultData.testName}</h3>

                            <span>Medium Level</span>

                            <button onClick={() => navigate("/mocktest")}>

                                Generate Test

                            </button>

                        </div>

                        <div className="recommended-card">

                            <h3>{resultData.testName}</h3>

                            <span>Hard Level</span>

                            <button onClick={() => navigate("/mocktest")}>

                                Generate Test

                            </button>

                        </div>

                    </div>

                </section>

                {/* =====================================================
                    FINAL ACTIONS
                ===================================================== */}

                <section className="result-actions">

                    <button

                        className="retake-btn"

                        onClick={() => navigate("/mocktest")}

                    >

                        Retake Test

                    </button>

                    <button

                        className="generate-new-btn"

                        onClick={() => navigate("/mocktest")}

                    >

                        Generate New Test

                    </button>

                    <button

                        className="back-home-btn"

                        onClick={() => navigate("/home")}

                    >

                        Back to Home

                    </button>

                </section>

            </div>

        </div>

    );

};

export default Result;