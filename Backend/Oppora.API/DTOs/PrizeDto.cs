namespace Oppora.API.DTOs
{
    public class PrizeDto
    {
        public int Rank { get; set; }
        public string PositionName { get; set; } = string.Empty;
        public string RewardDescription { get; set; } = string.Empty;
        public decimal? Amount { get; set; }
    }
}
