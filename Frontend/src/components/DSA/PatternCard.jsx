import "./PatternCard.css";
import { useNavigate } from "react-router-dom";

const PatternCard = ({ pattern }) => {
    const navigate = useNavigate();
  return (
    <div
  className="pattern-card"
  onClick={() => navigate(`/pattern/${pattern.id}`)}
>

     <div className="card-header">

    <h3>{pattern.pattern}</h3>
</div>

      <p className="pattern-description">
        {pattern.description}
      </p>

      <div className="card-info">

    <div className="pattern-stats">

        <span>{pattern.topics.length} Topics</span>

        <span className="card-divider"></span>

        <span>{pattern.questions.length} Questions</span>

    </div>

   <div className="explore-link">

  <span>Explore</span>

  <span className="arrow">→</span>

</div>

</div>

    </div>
  );
};

export default PatternCard;