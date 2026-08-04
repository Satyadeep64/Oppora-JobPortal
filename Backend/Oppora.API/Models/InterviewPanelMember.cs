using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Oppora.API.Models
{
    public class InterviewPanelMember
    {
        [Key]
        public int Id { get; set; }

        public int InterviewRoundId { get; set; }

        [ForeignKey(nameof(InterviewRoundId))]
        public InterviewRound? InterviewRound { get; set; }

        public int PanelMemberUserId { get; set; }

        [ForeignKey(nameof(PanelMemberUserId))]
        public User? PanelMemberUser { get; set; }

        [MaxLength(100)]
        public string RoleInInterview { get; set; } = "Interviewer"; // Lead Interviewer, Technical Evaluator, HR Observer

        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    }
}
