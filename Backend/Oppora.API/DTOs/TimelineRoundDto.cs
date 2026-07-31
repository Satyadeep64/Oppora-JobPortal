namespace Oppora.API.DTOs
{
    public class TimelineRoundDto
    {
        public int RoundNumber { get; set; }
        public string RoundTitle { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime RoundDate { get; set; }
    }
}
