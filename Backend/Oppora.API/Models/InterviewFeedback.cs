using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Oppora.API.Models
{
    public class InterviewFeedback
    {
        [Key]
        public int Id { get; set; }

        public int InterviewRoundId { get; set; }

        [ForeignKey(nameof(InterviewRoundId))]
        public InterviewRound? InterviewRound { get; set; }

        public int EvaluatorId { get; set; }

        [ForeignKey(nameof(EvaluatorId))]
        public User? Evaluator { get; set; }

        public int? InterviewerId { get; set; }

        [ForeignKey(nameof(InterviewerId))]
        public Interviewer? Interviewer { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; } = 5;

        [Range(1, 5)]
        public int OverallRating { get; set; } = 5;

        [Range(1, 5)]
        public int TechnicalScore { get; set; } = 5;

        [Range(1, 5)]
        public int CommunicationScore { get; set; } = 5;

        [Range(1, 5)]
        public int ProblemSolvingScore { get; set; } = 5;

        [MaxLength(2000)]
        public string Strengths { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string AreasOfImprovement { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string Comments { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Recommendation { get; set; } = "Hire"; // Strong Hire, Hire, Neutral, Reject, Strong Reject

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        public ICollection<InterviewScore> Scores { get; set; } = new List<InterviewScore>();
    }
}
