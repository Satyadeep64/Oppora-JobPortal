using System.ComponentModel.DataAnnotations;

namespace Oppora.API.Models
{
    public class Registration
    {
        public int Id { get; set; }

        public int CompetitionId { get; set; }

        [Required]
        [MaxLength(200)]
        public string ParticipantName { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        [EmailAddress]
        public string ParticipantEmail { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? CollegeName { get; set; }

        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;

        public Competition? Competition { get; set; }
    }
}
