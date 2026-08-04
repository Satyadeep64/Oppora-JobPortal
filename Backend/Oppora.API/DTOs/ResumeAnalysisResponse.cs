namespace Oppora.API.DTOs
{
    public class ResumeAnalysisResponse
    {
        public int ATSScore { get; set; }

        public List<string> Strengths { get; set; } = new();

        public List<string> MissingSkills { get; set; } = new();

        public List<string> Suggestions { get; set; } = new();

        public string OverallFeedback { get; set; } = string.Empty;
    }
}