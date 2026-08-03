import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    topicSuggestions,
    durations,
    questionCounts,
    difficultyLevels,
    languages,
    testModes,
} from "../MockTestData";

import { generateTest as generateMockTest } from "../MockTestApi";

const Preferences = () => {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [selectedTopics, setSelectedTopics] = useState([]);

    const [duration, setDuration] = useState(30);
    const [questions, setQuestions] = useState(20);
    const [difficulty, setDifficulty] = useState("Medium");
    const [language, setLanguage] = useState("English");
    const [mode, setMode] = useState("MCQ");
    const [loading, setLoading] = useState(false);

    // Dropdown states
    const [openDropdown, setOpenDropdown] = useState(null);

    const filteredTopics = useMemo(() => {

        if (!search.trim()) return [];

        return topicSuggestions.filter(
            topic =>
                topic.toLowerCase().includes(search.toLowerCase()) &&
                !selectedTopics.includes(topic)
        );

    }, [search, selectedTopics]);

    const addTopic = (topic) => {

        setSelectedTopics([...selectedTopics, topic]);
        setSearch("");

    };

    const removeTopic = (topic) => {

        setSelectedTopics(
            selectedTopics.filter(item => item !== topic)
        );

    };

    const toggleDropdown = (name) => {

        if (openDropdown === name)
            setOpenDropdown(null);
        else
            setOpenDropdown(name);

    };

    const generateTest = async () => {

    if (selectedTopics.length === 0) {
        alert("Please select at least one topic.");
        return;
    }

    try {

        setLoading(true);

        const payload = {

            topic: selectedTopics.join(", "),

            difficulty: difficulty,

            numberOfQuestions: questions,

            duration: duration,

            questionType: mode,

            templateName: "Custom Test"

        };

       const response = await generateMockTest(payload);

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
            duration
        );
        sessionStorage.setItem(
    "mockTestDifficulty",
    difficulty
);

sessionStorage.setItem(
    "mockTestMode",
    mode
);

sessionStorage.setItem(
    "mockTestLanguage",
    language
);

sessionStorage.setItem(
    "mockTestTopic",
    selectedTopics.join(", ")
);

sessionStorage.setItem(
    "mockTestQuestionCount",
    questions
);

        navigate("/mocktest/test");

    }
    catch (error) {

        alert(error.message);

    }
    finally {

        setLoading(false);

    }

};

    return (

    <>

        <div id="preferences-section" className="section-header">

            <div className="section-line"></div>

            <div className="section-content">

                <h2>Customize Your Test</h2>

                <p>
                    Build a personalized AI-powered mock test 
                </p>

            </div>

        </div>

        <section
            
            className="preferences-section"
        >

            <div className="preferences-grid">

                {/* Topics */}

                <div className="preference-group">

                    <label>Select Topics</label>

                    <input
                        type="text"
                        placeholder="Search topics..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {filteredTopics.length > 0 && (

                        <div className="topic-dropdown">

                            {filteredTopics.map(topic => (

                                <div
                                    key={topic}
                                    className="topic-item"
                                    onClick={() => addTopic(topic)}
                                >
                                    {topic}
                                </div>

                            ))}

                        </div>

                    )}

                    <div className="selected-topics">

                        {selectedTopics.map(topic => (

                            <div
                                key={topic}
                                className="topic-chip"
                            >

                                {topic}

                                <span
                                    onClick={() => removeTopic(topic)}
                                >
                                    ×
                                </span>

                            </div>

                        ))}

                    </div>

                </div>

                {/* Duration */}

                <div className="preference-group">

                    <label>Duration</label>

                    <div
                        className="dropdown-box"
                        onClick={() => toggleDropdown("duration")}
                    >

                        <span>{duration} Minutes</span>

                        <span>▼</span>

                    </div>

                    {openDropdown === "duration" && (

                        <div className="topic-dropdown">

                            {durations.map(item => (

                                <div
                                    key={item}
                                    className="topic-item"
                                    onClick={() => {

                                        setDuration(item);
                                        setOpenDropdown(null);

                                    }}
                                >
                                    {item} Minutes
                                </div>

                            ))}

                        </div>

                    )}

                </div>

                {/* Questions */}

                <div className="preference-group">

                    <label>Questions</label>

                    <div
                        className="dropdown-box"
                        onClick={() => toggleDropdown("questions")}
                    >

                        <span>{questions} Questions</span>

                        <span>▼</span>

                    </div>

                    {openDropdown === "questions" && (

                        <div className="topic-dropdown">

                            {questionCounts.map(item => (

                                <div
                                    key={item}
                                    className="topic-item"
                                    onClick={() => {

                                        setQuestions(item);
                                        setOpenDropdown(null);

                                    }}
                                >
                                    {item} Questions
                                </div>

                            ))}

                        </div>

                    )}

                </div>
                                {/* Difficulty */}

                <div className="preference-group">

                    <label>Difficulty</label>

                    <div
                        className="dropdown-box"
                        onClick={() => toggleDropdown("difficulty")}
                    >

                        <span>{difficulty}</span>

                        <span>▼</span>

                    </div>

                    {openDropdown === "difficulty" && (

                        <div className="topic-dropdown">

                            {difficultyLevels.map(level => (

                                <div
                                    key={level}
                                    className="topic-item"
                                    onClick={() => {

                                        setDifficulty(level);
                                        setOpenDropdown(null);

                                    }}
                                >
                                    {level}
                                </div>

                            ))}

                        </div>

                    )}

                </div>

                {/* Language */}

                <div className="preference-group">

                    <label>Language</label>

                    <div
                        className="dropdown-box"
                        onClick={() => toggleDropdown("language")}
                    >

                        <span>{language}</span>

                        <span>▼</span>

                    </div>

                    {openDropdown === "language" && (

                        <div className="topic-dropdown">

                            {languages.map(item => (

                                <div
                                    key={item}
                                    className="topic-item"
                                    onClick={() => {

                                        setLanguage(item);
                                        setOpenDropdown(null);

                                    }}
                                >
                                    {item}
                                </div>

                            ))}

                        </div>

                    )}

                </div>

                {/* Mode */}

                <div className="preference-group">

                    <label>Test Mode</label>

                    <div
                        className="dropdown-box"
                        onClick={() => toggleDropdown("mode")}
                    >

                        <span>{mode}</span>

                        <span>▼</span>

                    </div>

                    {openDropdown === "mode" && (

                        <div className="topic-dropdown">

                            {testModes.map(item => (

                                <div
                                    key={item}
                                    className="topic-item"
                                    onClick={() => {

                                        setMode(item);
                                        setOpenDropdown(null);

                                    }}
                                >
                                    {item}
                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </div>

            <div className="generate-container">

               <button
    className="generate-btn"
    onClick={generateTest}
    disabled={loading}
>
    {loading ? "Generating..." : "Generate AI Mock Test"}
</button>

            </div>

        </section>
        </>

    );

};

export default Preferences;