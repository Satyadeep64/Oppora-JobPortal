using System.ComponentModel.DataAnnotations;

namespace Oppora.API.DTOs
{
    public class CreateCompetitionDto
    {
        [Required]
        [MaxLength(300)]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string OrganizationName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string OrganizationLogoUrl { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string CategoryName { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string LocationName { get; set; } = "Online / India";

        [MaxLength(50)]
        public string Mode { get; set; } = "Online";

        [MaxLength(50)]
        public string TeamSize { get; set; } = "1 - 4 Members";

        public int MinTeamMembers { get; set; } = 1;
        public int MaxTeamMembers { get; set; } = 4;

        [MaxLength(100)]
        public string RegistrationFee { get; set; } = "Free";

        public DateTime RegistrationDeadline { get; set; }

        [Required]
        [MaxLength(500)]
        public string OfficialRegistrationUrl { get; set; } = string.Empty;

        public bool IsFeatured { get; set; } = false;

        public EligibilityDto? Eligibility { get; set; }
        public List<TimelineRoundDto> TimelineRounds { get; set; } = new();
        public List<PrizeDto> Prizes { get; set; } = new();
        public List<string> Rules { get; set; } = new();
        public List<string> Tags { get; set; } = new();
    }
}
