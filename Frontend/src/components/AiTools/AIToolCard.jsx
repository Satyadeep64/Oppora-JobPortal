import { useState } from "react";
import { ExternalLink, Star, Copy, Check, Sparkles } from "lucide-react";

const AIToolCard = ({
  name,
  logo,
  description,
  link,
  category = "Productivity",
  rating = "4.9",
  samplePrompt
}) => {
  const [copied, setCopied] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);

  const defaultPrompts = {
    "ChatGPT": "Act as a senior software architect. Code review this function and optimize for runtime performance and security.",
    "Claude AI": "Summarize this long technical document into key bullet points and highlight potential architectural edge cases.",
    "Google Gemini": "Help me prepare for an interview for a Senior React Developer position. Ask me 3 challenging technical questions.",
    "GitHub Copilot": "// Generate an optimized async fetch helper in TypeScript with auto-retry and cache handling.",
    "Perplexity": "Search and summarize the latest 2026 AI web development trends and best state management libraries.",
    "Canva AI": "Generate a modern dark-mode landing page vector illustration with neon gradient accents."
  };

  const activePrompt = samplePrompt || defaultPrompts[name] || "Generate a professional career pitch for software roles.";

  const handleCopyPrompt = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(activePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="ai-card">
      <div className="ai-card-top">
        <div className="ai-logo-wrapper">
          <img src={logo} alt={name} className="ai-logo-img" />
        </div>

        <div className="ai-card-meta">
          <span className="ai-category-badge">{category}</span>
          <div className="ai-rating">
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            <span>{rating}</span>
          </div>
        </div>
      </div>

      <div className="ai-card-content">
        <h3 className="ai-card-title">{name}</h3>
        <p className="ai-card-desc">{description}</p>
      </div>

      <div className="ai-card-actions">
        <button
          className="prompt-try-btn"
          onClick={handleCopyPrompt}
          title="Copy Recommended Prompt"
        >
          {copied ? (
            <>
              <Check size={14} /> Copied Prompt!
            </>
          ) : (
            <>
              <Sparkles size={14} /> Copy Prompt
            </>
          )}
        </button>

        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="ai-explore-btn"
        >
          <span>Launch Tool</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};

export default AIToolCard;