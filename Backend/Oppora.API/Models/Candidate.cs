using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Oppora.API.Models
{
    public class Candidate
    {
        [Key]
        public int Id { get; set; }

        public int? UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }

        [Required]
        [MaxLength(150)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(50)]
        public string PhoneNumber { get; set; } = string.Empty;

        [MaxLength(200)]
        public string College { get; set; } = string.Empty;

        [MaxLength(500)]
        public string ResumeUrl { get; set; } = string.Empty;

        [MaxLength(150)]
        public string CurrentCompany { get; set; } = string.Empty;

        public double ExperienceYears { get; set; } = 0;

        [MaxLength(100)]
        public string Source { get; set; } = "Direct / Ad-Hoc"; // Direct, Referral, Job Posting, Sourced

        [NotMapped]
        public string Phone { get => PhoneNumber; set => PhoneNumber = value; }

        [NotMapped]
        public DateTime CreatedOn { get => CreatedAt; set => CreatedAt = value; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
    }
}
