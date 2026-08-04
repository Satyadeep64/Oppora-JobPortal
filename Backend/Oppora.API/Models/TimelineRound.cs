using System.ComponentModel.DataAnnotations;

namespace Oppora.API.Models
{
    public class TimelineRound
    {
        public int Id { get; set; }

        public int CompetitionId { get; set; }

        public int RoundNumber { get; set; }

        [Required]
        [MaxLength(200)]
        public string RoundTitle { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DateTime RoundDate { get; set; }

        public Competition? Competition { get; set; }
    }
}
