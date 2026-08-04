import AIToolCard from "./AIToolCard";

import chatgpt from "../../images/Ai/Chatgpt.webp";
import claude from "../../images/Ai/claude-ai-logo-rounded-hd-free-png.webp";
import gemini from "../../images/Ai/gemini-logo_brandlogos.net_fwajr-512x512.webp";
import copilot from "../../images/Ai/a21f7fe054a2354898be2bc3163980f2.webp";
import perplexity from "../../images/Ai/Perplexity-AI-Logo-2023-Turquiose-White.png.webp";
import canva from "../../images/Ai/canva.webp";
const tools = [
    {
        name:"ChatGPT",
        logo:chatgpt,
        description:"AI assistant for learning, coding and productivity.",
        link:"https://chat.openai.com"
    },
    {
        name:"Claude AI",
        logo:claude,
        description:"AI assistant for writing and reasoning.",
        link:"https://claude.ai"
    },
    {
        name:"Google Gemini",
        logo:gemini,
        description:"Google's advanced AI assistant.",
        link:"https://gemini.google.com"
    },
    {
        name:"GitHub Copilot",
        logo:copilot,
        description:"AI coding assistant for developers.",
        link:"https://github.com/features/copilot"
    },
    {
        name:"Perplexity",
        logo:perplexity,
        description:"AI powered search and research.",
        link:"https://www.perplexity.ai"
    },
    {
        name:"Canva AI",
        logo:canva,
        description:"AI tools for creative designs.",
        link:"https://www.canva.com"
    }

];

const AITools =()=>{


return(

<section className="ai-section">
<div className="ai-heading">
<h2>
    Explore <span>AI Tools</span>
</h2>
<p>
    Powerful AI tools to boost your learning, coding and career growth.
</p>
</div>
<div className="ai-grid">
{
tools.map((tool,index)=>(
<AIToolCard
    key={index}
    {...tool}
/>
))
}
</div>
</section>
)
}
export default AITools;