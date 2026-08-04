using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Oppora.API.Models
{
    public class InterviewAudit
    {
        [Key]
        public int Id { get; set; }

        public int InterviewId { get; set; }

        [ForeignKey(nameof(InterviewId))]
        public Interview? Interview { get; set; }

        [Required]
        [MaxLength(100)]
        public string Action { get; set; } = "Interview Created"; 
        // Tracked Actions: 
        // - Interview Created
        // - Interview Updated
        // - Interview Rescheduled
        // - Interview Cancelled
        // - Email Sent
        // - Reminder Sent
        // - Feedback Submitted
        // - Meeting Link Changed

        public int PerformedByUserId { get; set; }

        [ForeignKey(nameof(PerformedByUserId))]
        public User? PerformedByUser { get; set; }

        [MaxLength(150)]
        public string PerformedByName { get; set; } = "Recruiter Admin";

        [MaxLength(1000)]
        public string OldValue { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string NewValue { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Details { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Changes { get => Details; set => Details = value; }

        [MaxLength(150)]
        public string PerformedBy { get => PerformedByName; set => PerformedByName = value; }

        public DateTime PerformedOn { get => Timestamp; set => Timestamp = value; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
