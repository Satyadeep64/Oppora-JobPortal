using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Oppora.API.Models
{
    public class InterviewScore
    {
        [Key]
        public int Id { get; set; }

        public int InterviewFeedbackId { get; set; }

        [ForeignKey(nameof(InterviewFeedbackId))]
        public InterviewFeedback? InterviewFeedback { get; set; }

        [Required]
        [MaxLength(100)]
        public string CriterionName { get; set; } = "Technical Skills"; // Technical Skills, Coding, System Design, Communication, Culture Fit

        public int Score { get; set; } = 5;

        public int MaxScore { get; set; } = 5;

        [MaxLength(500)]
        public string Notes { get; set; } = string.Empty;
    }
}
