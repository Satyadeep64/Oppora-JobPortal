using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Oppora.API.Models
{
    public class Prize
    {
        public int Id { get; set; }

        public int CompetitionId { get; set; }

        public int Rank { get; set; }

        [MaxLength(100)]
        public string PositionName { get; set; } = string.Empty;

        [MaxLength(300)]
        public string RewardDescription { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Amount { get; set; }

        public Competition? Competition { get; set; }
    }
}
