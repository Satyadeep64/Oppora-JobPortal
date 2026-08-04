using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Oppora.API.Models
{
    public class MeetingDetails
    {
        [Key]
        public int Id { get; set; }

        public int InterviewRoundId { get; set; }

        [ForeignKey(nameof(InterviewRoundId))]
        public InterviewRound? InterviewRound { get; set; }

        [Required]
        [MaxLength(200)]
        public string Provider { get; set; } = "Google Meet"; // Google Meet, MS Teams, Zoom

        [Required]
        [MaxLength(1000)]
        public string MeetingUrl { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? MeetingId { get; set; }

        [MaxLength(200)]
        public string? Passcode { get; set; }

        // Extension fields for future Google Calendar & Google Meet API integration without DB schema changes
        [MaxLength(200)]
        public string? ExternalCalendarEventId { get; set; }

        [MaxLength(2000)]
        public string? ServiceAccountData { get; set; }

        public DateTime ScheduledStartTime { get; set; }
        public DateTime ScheduledEndTime { get; set; }
        public int DurationMinutes { get; set; } = 45;

        [MaxLength(100)]
        public string TimeZone { get; set; } = "UTC";

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
