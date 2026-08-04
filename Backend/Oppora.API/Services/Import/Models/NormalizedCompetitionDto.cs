using Oppora.API.DTOs;

namespace Oppora.API.Services.Import.Models
{
    public class NormalizedCompetitionDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string OrganizationName { get; set; } = string.Empty;
        public string OrganizationLogoUrl { get; set; } = string.Empty;
        public string CategoryName { get; set; } = "Competitions";
        public string LocationName { get; set; } = "Online / India";
        public string Mode { get; set; } = "Online";
        public string TeamSize { get; set; } = "1 - 4 Members";
        public string RegistrationFee { get; set; } = "Free";
        public DateTime RegistrationDeadline { get; set; } = DateTime.UtcNow.AddDays(30);
        public string OfficialRegistrationUrl { get; set; } = string.Empty;
        public bool IsFeatured { get; set; }

        public string? ExternalSourceId { get; set; }
        public ImportSourceType SourceType { get; set; }

        public EligibilityDto? Eligibility { get; set; }
        public List<TimelineRoundDto> TimelineRounds { get; set; } = new();
        public List<PrizeDto> Prizes { get; set; } = new();
        public List<string> Rules { get; set; } = new();
        public List<string> Tags { get; set; } = new();
    }
}
