using System.ComponentModel.DataAnnotations;

namespace Oppora.API.Models
{
    public class Competition
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(300)]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public int OrganizationId { get; set; }
        public Organization? Organization { get; set; }

        public int CategoryId { get; set; }
        public Category? Category { get; set; }

        public int LocationId { get; set; }
        public Location? Location { get; set; }

        [MaxLength(50)]
        public string Mode { get; set; } = "Online";

        [MaxLength(50)]
        public string TeamSize { get; set; } = "1 - 4 Members";

        public int MinTeamMembers { get; set; } = 1;
        public int MaxTeamMembers { get; set; } = 4;

        [MaxLength(100)]
        public string RegistrationFee { get; set; } = "Free";

        public DateTime RegistrationDeadline { get; set; }
        public DateTime? RegistrationStartDate { get; set; }

        [Required]
        [MaxLength(500)]
        public string OfficialRegistrationUrl { get; set; } = string.Empty;

        public bool IsFeatured { get; set; } = false;

        public int RegisteredCount { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Collections
        public Eligibility? Eligibility { get; set; }
        public ICollection<TimelineRound> TimelineRounds { get; set; } = new List<TimelineRound>();
        public ICollection<Prize> Prizes { get; set; } = new List<Prize>();
        public ICollection<RuleItem> Rules { get; set; } = new List<RuleItem>();
        public ICollection<CompetitionTag> CompetitionTags { get; set; } = new List<CompetitionTag>();
        public ICollection<Registration> Registrations { get; set; } = new List<Registration>();
    }
}
