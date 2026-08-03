import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trendingTests } from "../MockTestData";
import { generateTest } from "../MockTestApi";

const TrendingTests = () => {

    const navigate = useNavigate();

    const [generatingId, setGeneratingId] = useState(null);

    const handleGenerateTest = async (test) => {

        try {

            setGeneratingId(test.id);

            const payload = {

                topic: test.topic,

                difficulty: test.difficulty,

                numberOfQuestions: test.questions,

                duration: test.duration,

                questionType: "MCQ",

                templateName: test.title

            };

            console.log("Payload:", payload);

            const response = await generateTest(payload);

            console.log("API Response:", response);

            if (
                !response.questions ||
                response.questions.length === 0
            ) {

                alert(
                    "No questions were generated. Please try again."
                );

                return;

            }

            sessionStorage.setItem(
                "mockTestSession",
                response.sessionId
            );

            sessionStorage.setItem(
                "mockTestQuestions",
                JSON.stringify(response.questions)
            );

            sessionStorage.setItem(
                "mockTestDuration",
                test.duration
            );

            sessionStorage.setItem(
                "mockTestDifficulty",
                test.difficulty
            );

            sessionStorage.setItem(
                "mockTestMode",
                "MCQ"
            );

            sessionStorage.setItem(
                "mockTestLanguage",
                "English"
            );

            sessionStorage.setItem(
                "mockTestTopic",
                test.topic
            );

            sessionStorage.setItem(
                "mockTestQuestionCount",
                test.questions
            );

            navigate("/mocktest/test");

        }

        catch (error) {

            console.error(error);

            alert(error.message);

        }

        finally {

            setGeneratingId(null);

        }

    };

    return (

        <>

            <div
                id="trending-tests"
                className="section-header"
            >

                <div className="section-line"></div>

                <div className="section-content">

                    <h2>
                        Trending Mock Tests
                    </h2>

                    <p>

                        Explore our most popular AI-generated
                        mock tests and start practicing instantly.

                    </p>

                </div>

            </div>

            <section className="trending-tests-section">

                <div className="trending-tests-grid">

                    {trendingTests.map((test) => (

                        <div
                            key={test.id}
                            className="test-card"
                        >

                            <div className="test-card-header">

                                <span className="topic-badge">

                                    {test.topic}

                                </span>

                                <span className="difficulty-badge">

                                    {test.difficulty}

                                </span>

                            </div>

                            <h3>

                                {test.title}

                            </h3>

                            <p>

                                {test.description}

                            </p>

                            <div className="test-details">

                                <div>

                                    <span className="detail-title">

                                        Duration

                                    </span>

                                    <strong>

                                        {test.duration} min

                                    </strong>

                                </div>

                                <div>

                                    <span className="detail-title">

                                        Questions

                                    </span>

                                    <strong>

                                        {test.questions}

                                    </strong>

                                </div>

                            </div>

                            <button
                                className="start-test-btn"
                                onClick={() =>
                                    handleGenerateTest(test)
                                }
                                disabled={
                                    generatingId === test.id
                                }
                            >

                                {generatingId === test.id
                                    ? "Generating..."
                                    : "Generate Test"}

                            </button>

                        </div>

                    ))}

                </div>

            </section>

        </>

    );

};

export default TrendingTests;