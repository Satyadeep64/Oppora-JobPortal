using System.ComponentModel.DataAnnotations;

namespace Oppora.API.Models
{
    public class ResumeAnalysisHistory
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }

        [Required]
        public string FileName { get; set; } = string.Empty;

        public string FileUrl { get; set; } = string.Empty;

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        public int ATSScore { get; set; }

        public string Status { get; set; } = "Analyzed";

        public string OverallFeedback { get; set; } = string.Empty;
        public string Strengths { get; set; } = string.Empty;

        public string MissingSkills { get; set; } = string.Empty;

        public string Suggestions { get; set; } = string.Empty;
    }
}