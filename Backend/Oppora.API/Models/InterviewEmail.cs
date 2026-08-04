using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Oppora.API.Models
{
    public class InterviewEmail
    {
        [Key]
        public int Id { get; set; }

        public int InterviewId { get; set; }

        [ForeignKey(nameof(InterviewId))]
        public Interview? Interview { get; set; }

        [Required]
        [MaxLength(150)]
        public string RecipientEmail { get; set; } = string.Empty;

        [MaxLength(250)]
        public string Subject { get; set; } = string.Empty;

        public string Body { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string InvitationStatus { get; set; } = "Pending"; // Pending, Sent, Failed

        public DateTime? SentOn { get; set; }

        public string? ErrorMessage { get; set; }

        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    }
}
