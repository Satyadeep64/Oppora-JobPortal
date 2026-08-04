using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Oppora.API.Models
{
    public class Meeting
    {
        [Key]
        public int Id { get; set; }

        public int InterviewRoundId { get; set; }

        [ForeignKey(nameof(InterviewRoundId))]
        public InterviewRound? InterviewRound { get; set; }

        [Required]
        [MaxLength(50)]
        public string Provider { get; set; } = "Google Meet";

        [Required]
        [MaxLength(500)]
        public string MeetingUrl { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? MeetingId { get; set; }

        [MaxLength(100)]
        public string? Passcode { get; set; }

        [MaxLength(250)]
        public string? ExternalCalendarEventId { get; set; }

        [MaxLength(4000)]
        public string? ServiceAccountData { get; set; }

        public int DurationMinutes { get; set; } = 45;

        [MaxLength(50)]
        public string TimeZone { get; set; } = "UTC";

        public DateTime ScheduledStartTime { get; set; }
        public DateTime ScheduledEndTime { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
