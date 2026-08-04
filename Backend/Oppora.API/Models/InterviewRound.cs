using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Oppora.API.Models
{
    public class InterviewRound
    {
        [Key]
        public int Id { get; set; }

        public int InterviewId { get; set; }

        [ForeignKey(nameof(InterviewId))]
        public Interview? Interview { get; set; }

        public int RoundNumber { get; set; } = 1;

        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = "Technical Round 1";

        [MaxLength(50)]
        public string InterviewType { get; set; } = "Technical"; // Screening, Technical, System Design, Managerial, HR

        [MaxLength(500)]
        public string Agenda { get; set; } = string.Empty;

        public DateTime InterviewDate { get; set; }

        public DateTime ScheduledStartTime { get; set; }

        public DateTime ScheduledEndTime { get; set; }

        public int DurationMinutes { get; set; } = 45;

        [MaxLength(50)]
        public string TimeZone { get; set; } = "UTC";

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Scheduled"; // Scheduled, In Progress, Completed, Rescheduled, Cancelled

        public bool IsEmailSent { get; set; } = false;
        public DateTime? EmailSentAt { get; set; }

        public bool IsReminderSent { get; set; } = false;
        public DateTime? ReminderSentAt { get; set; }

        public MeetingDetails? MeetingDetails { get; set; }
        public ICollection<Meeting> Meetings { get; set; } = new List<Meeting>();
        public ICollection<InterviewPanel> PanelMembers { get; set; } = new List<InterviewPanel>();
        public ICollection<InterviewFeedback> Feedbacks { get; set; } = new List<InterviewFeedback>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
