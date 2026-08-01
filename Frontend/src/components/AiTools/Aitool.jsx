import { useState } from "react";
import AIToolCard from "./AIToolCard";

import chatgpt from "../../images/Ai/Chatgpt.webp";
import claude from "../../images/Ai/claude-ai-logo-rounded-hd-free-png.webp";
import gemini from "../../images/Ai/gemini-logo_brandlogos.net_fwajr-512x512.webp";
import copilot from "../../images/Ai/a21f7fe054a2354898be2bc3163980f2.webp";
import perplexity from "../../images/Ai/Perplexity-AI-Logo-2023-Turquiose-White.png.webp";
import canva from "../../images/Ai/canva.webp";

import { Bot, Sparkles, Search } from "lucide-react";

const tools = [
  {
    name: "ChatGPT",
    logo: chatgpt,
    description: "AI assistant for learning, debugging code, interview prep, and workflow automation.",
    link: "https://chat.openai.com",
    category: "Coding & General",
    rating: "4.9"
  },
  {
    name: "Claude AI",
    logo: claude,
    description: "Advanced AI for long-context document analysis, nuanced writing, and reasoning.",
    link: "https://claude.ai",
    category: "Writing & Docs",
    rating: "4.9"
  },
  {
    name: "Google Gemini",
    logo: gemini,
    description: "Multimodal AI assistant connected directly with Google Workspace and search.",
    link: "https://gemini.google.com",
    category: "Research",
    rating: "4.8"
  },
  {
    name: "GitHub Copilot",
    logo: copilot,
    description: "Real-time AI pair programmer inside your IDE for faster code generation.",
    link: "https://github.com/features/copilot",
    category: "Coding",
    rating: "4.9"
  },
  {
    name: "Perplexity AI",
    logo: perplexity,
    description: "AI-powered web research engine providing cited, up-to-date answers instantly.",
    link: "https://www.perplexity.ai",
    category: "Search & Research",
    rating: "4.8"
  },
  {
    name: "Canva AI",
    logo: canva,
    description: "AI creative studio for generating pitch decks, graphics, and resume templates.",
    link: "https://www.canva.com",
    category: "Design",
    rating: "4.7"
  }
];

const AITools = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [aiSearch, setAiSearch] = useState("");

  const categories = ["All", "Coding", "Writing & Docs", "Research", "Design"];

  const filteredTools = tools.filter((tool) => {
    const matchesCategory =
      selectedCategory === "All"
        ? true
        : tool.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      tool.name.toLowerCase().includes(aiSearch.toLowerCase()) ||
      tool.description.toLowerCase().includes(aiSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="ai-section">
      <div className="ai-heading">
        <div className="ai-spotlight-badge">
          <Bot size={16} />
          <span>Next-Gen Productivity</span>
        </div>

        <h2>
          Accelerate Career with <span>AI Tools</span>
        </h2>
        <p>
          Handpicked top AI tools and prompts to elevate your coding, interview prep, and design skills.
        </p>

        {/* Filter bar */}
        <div className="ai-controls-bar">
          <div className="ai-categories">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`ai-cat-btn ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="ai-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search AI tool..."
              value={aiSearch}
              onChange={(e) => setAiSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="ai-grid">
        {filteredTools.length > 0 ? (
          filteredTools.map((tool, index) => (
            <AIToolCard key={index} {...tool} />
          ))
        ) : (
          <div className="no-tools-found">
            <p>No AI tools match your search "{aiSearch}".</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AITools;