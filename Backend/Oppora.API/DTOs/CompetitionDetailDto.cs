namespace Oppora.API.DTOs
{
    public class CompetitionDetailDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Organization { get; set; } = string.Empty;
        public string Logo { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Mode { get; set; } = "Online";
        public string TeamSize { get; set; } = "1 - 4 Members";
        public string RegistrationFee { get; set; } = "Free";
        public DateTime RegistrationDeadline { get; set; }
        public string Deadline { get; set; } = string.Empty;
        public string DaysLeft { get; set; } = string.Empty;
        public string OfficialRegistrationUrl { get; set; } = string.Empty;
        public bool IsFeatured { get; set; }
        public int RegisteredCount { get; set; }
        public DateTime CreatedAt { get; set; }

        public EligibilityDto? Eligibility { get; set; }
        public List<TimelineRoundDto> Timeline { get; set; } = new();
        public List<PrizeDto> Prizes { get; set; } = new();
        public List<string> Rules { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public List<string> Categories { get; set; } = new();
    }
}
