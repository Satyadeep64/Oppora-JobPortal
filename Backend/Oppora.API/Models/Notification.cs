using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Oppora.API.Models
{
    public class Notification
    {
        [Key]
        public int Id { get; set; }

        public int? InterviewId { get; set; }

        [ForeignKey(nameof(InterviewId))]
        public Interview? Interview { get; set; }

        public int RecipientUserId { get; set; }

        [ForeignKey(nameof(RecipientUserId))]
        public User? RecipientUser { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        public string Message { get; set; } = string.Empty;

        [MaxLength(50)]
        public string NotificationType { get; set; } = "Invitation"; // Invitation, Reminder, Update, Cancellation, Feedback

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
