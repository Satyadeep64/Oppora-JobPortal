const SuggestionPanel = ({ suggestions }) => {
  return (
    <div className="suggestion-card">

      <h2>AI Suggestions</h2>

      {suggestions.map((item, index) => (

        <div
          key={index}
          className="suggestion-item"
        >
          ✅ {item}
        </div>

      ))}

    </div>
  );
};

export default SuggestionPanel;