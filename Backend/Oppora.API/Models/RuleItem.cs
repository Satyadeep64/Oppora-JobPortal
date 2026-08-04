using System.ComponentModel.DataAnnotations;

namespace Oppora.API.Models
{
    public class RuleItem
    {
        public int Id { get; set; }

        public int CompetitionId { get; set; }

        [Required]
        [MaxLength(500)]
        public string RuleText { get; set; } = string.Empty;

        public int DisplayOrder { get; set; }

        public Competition? Competition { get; set; }
    }
}
