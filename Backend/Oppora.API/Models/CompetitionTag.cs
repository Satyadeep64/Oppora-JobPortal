namespace Oppora.API.Models
{
    public class CompetitionTag
    {
        public int CompetitionId { get; set; }
        public Competition Competition { get; set; } = null!;

        public int TagId { get; set; }
        public Tag Tag { get; set; } = null!;
    }
}
