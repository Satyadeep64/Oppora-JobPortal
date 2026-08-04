using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Oppora.API.Models
{
    public class InterviewPanel
    {
        [Key]
        public int Id { get; set; }

        public int InterviewRoundId { get; set; }

        [ForeignKey(nameof(InterviewRoundId))]
        public InterviewRound? InterviewRound { get; set; }

        public int InterviewerId { get; set; }

        [ForeignKey(nameof(InterviewerId))]
        public Interviewer? Interviewer { get; set; }

        [MaxLength(50)]
        public string RoleInPanel { get; set; } = "Primary"; // Primary, Secondary, Lead, Observer

        public bool IsConfirmed { get; set; } = true;

        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    }
}
