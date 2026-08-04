using System.ComponentModel.DataAnnotations;

namespace Oppora.API.Models
{
    public class EmailQueue
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string ToEmail { get; set; } = string.Empty;

        [MaxLength(255)]
        public string ToName { get; set; } = string.Empty;

        [Required]
        [MaxLength(300)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public string BodyHtml { get; set; } = string.Empty;

        public string? IcsCalendarContent { get; set; }

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Pending"; // Pending, Sent, Failed, Reminder_Pending

        public bool IsSent { get; set; } = false;

        public DateTime? SentAt { get; set; }

        public int RetryCount { get; set; } = 0;

        public int MaxRetries { get; set; } = 3;

        public string? ErrorMessage { get; set; }

        public DateTime ScheduledFor { get; set; } = DateTime.UtcNow;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
