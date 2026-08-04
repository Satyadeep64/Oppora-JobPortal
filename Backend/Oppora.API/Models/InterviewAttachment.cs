using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Oppora.API.Models
{
    public class InterviewAttachment
    {
        [Key]
        public int Id { get; set; }

        public int InterviewId { get; set; }

        [ForeignKey(nameof(InterviewId))]
        public Interview? Interview { get; set; }

        [Required]
        [MaxLength(200)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string FileUrl { get; set; } = string.Empty;

        [MaxLength(50)]
        public string FileType { get; set; } = "Resume"; // Resume, Portfolio, Scorecard, Assignment

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}
