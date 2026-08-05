import "./PatternDetails.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { dsaSheet } from "../../Data";



const PatternDetails = () => {

    const navigate = useNavigate();

    const { id } = useParams();

const pattern = dsaSheet.find(
  (item) => item.id === Number(id)
);

    if (!pattern) {
  return <h2>Pattern not found.</h2>;
}
  return (
  <div className="pattern-details-page">

    <div className="pattern-details-container">
        <button
  className="back-btn"
  onClick={() => navigate("/dsa-sheet")}
>
  ← Back to DSA Sheet
</button>

      <div className="pattern-header">

  <div>

    <h1>{pattern.pattern}</h1>

    <p>{pattern.description}</p>

  </div>

  <div className="question-count">

    <span>{pattern.questions.length}</span>

    <small>Questions</small>

  </div>

</div>


<div className="pattern-nav">

  {dsaSheet.map((item) => (

    <Link
      key={item.id}
      to={`/pattern/${item.id}`}
      className={`pattern-pill ${
        item.id === pattern.id ? "active" : ""
      }`}
    >
      {item.pattern}
    </Link>

  ))}

</div>

<h3 className="section-title">
  Topics Covered
</h3>

<div className="topics-container">
  {pattern.topics.map((topic, index) => (
    <div className="topic-item" key={index}>
      <span className="topic-dot"></span>
      <span>{topic}</span>
    </div>
  ))}
</div>

<h3 className="questions-heading">
  Interview Questions
</h3>

<div className="questions-list">

  {pattern.questions.map((question) => (

    <div className="question-card" key={question.id}>

      <div className="question-left">

        <h4>{question.title}</h4>

        <div className="question-meta">

          <span className={`difficulty ${question.difficulty.toLowerCase()}`}>
            {question.difficulty}
          </span>

          <span className="platform">
            {question.platform}
          </span>

        </div>

      </div>

      <a
        href={question.link}
        target="_blank"
        rel="noopener noreferrer"
        className="solve-btn"
      >
      Open Problem
<span>↗</span>
      </a>

    </div>

  ))}

</div>

    </div>

  </div>
);
};

export default PatternDetails;